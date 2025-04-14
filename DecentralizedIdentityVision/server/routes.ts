import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { identityDataSchema, walletAddressSchema, insertIdentitySchema, updateIdentitySchema } from "@shared/schema";
import { ZodError } from "zod";
import { create as createIPFSClient } from 'ipfs-http-client';

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to retrieve identity by wallet address
  app.get("/api/identity/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      console.log("Retrieving identity for wallet:", walletAddress);
      
      // Validate wallet address format
      const validatedAddress = walletAddressSchema.parse(walletAddress);
      
      // Get identity from storage
      const identity = await storage.getIdentityByWalletAddress(validatedAddress);
      
      console.log("Identity retrieved:", identity ? "Found" : "Not found");
      
      if (!identity) {
        // Double check with a case-insensitive database query
        const allIdentities = await storage.listIdentities();
        const foundByLowercase = allIdentities.find(
          id => id.walletAddress.toLowerCase() === validatedAddress.toLowerCase()
        );
        
        if (foundByLowercase) {
          return res.status(200).json(foundByLowercase);
        }
        
        return res.status(404).json({ 
          message: "Identity not found",
          requestedAddress: validatedAddress
        });
      }
      
      return res.status(200).json(identity);
    } catch (error) {
      console.error("Error retrieving identity:", error);
      
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid wallet address format", errors: error.errors });
      }
      
      return res.status(500).json({ message: "Error retrieving identity" });
    }
  });

  // API endpoint to create a new identity
  app.post("/api/identity", async (req, res) => {
    try {
      console.log("Received identity data:", JSON.stringify(req.body));
      
      // Ensure we have a properly formatted wallet address
      if (!req.body.walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
      }
      
      // Add default empty array for previousVersions if not present
      const dataWithDefaults = {
        ...req.body,
        previousVersions: req.body.previousVersions || []
      };
      
      try {
        // Validate request body
        const validatedData = insertIdentitySchema.parse(dataWithDefaults);
        
        // Check if identity with this wallet address already exists
        const existing = await storage.getIdentityByWalletAddress(validatedData.walletAddress);
        
        if (existing) {
          return res.status(409).json({ message: "Identity with this wallet address already exists" });
        }
        
        // Create identity
        const identity = await storage.createIdentity(validatedData);
        
        return res.status(201).json(identity);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        
        if (validationError instanceof ZodError) {
          return res.status(400).json({ 
            message: "Invalid identity data", 
            errors: validationError.errors,
            receivedData: JSON.stringify(req.body)
          });
        }
        throw validationError;
      }
    } catch (error) {
      console.error("Error creating identity:", error);
      return res.status(500).json({ message: "Error creating identity", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // API endpoint to update an identity
  app.put("/api/identity/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      // Validate wallet address format
      const validatedAddress = walletAddressSchema.parse(walletAddress);
      
      // Validate update data
      const validatedData = updateIdentitySchema.parse(req.body);
      
      // Update identity
      const updatedIdentity = await storage.updateIdentity(validatedAddress, validatedData);
      
      if (!updatedIdentity) {
        return res.status(404).json({ message: "Identity not found" });
      }
      
      return res.status(200).json(updatedIdentity);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      
      return res.status(500).json({ message: "Error updating identity" });
    }
  });

  // API endpoint to list all identities (for admin purposes)
  app.get("/api/identities", async (req, res) => {
    try {
      const identities = await storage.listIdentities();
      return res.status(200).json(identities);
    } catch (error) {
      return res.status(500).json({ message: "Error retrieving identities" });
    }
  });

  // API endpoint to upload data to IPFS
  app.post("/api/ipfs/upload", async (req, res) => {
    try {
      const data = req.body;
      
      if (!data) {
        return res.status(400).json({ message: "No data provided for IPFS upload" });
      }
      
      // Connect to IPFS using Infura credentials
      // Important: In Node.js, we access environment variables directly from process.env,
      // not through import.meta.env (which is Vite-specific for the client)
      const projectId = process.env.VITE_INFURA_IPFS_PROJECT_ID;
      const projectSecret = process.env.VITE_INFURA_IPFS_PROJECT_SECRET;
      
      if (!projectId || !projectSecret) {
        console.error("IPFS credentials missing:", { projectId: !!projectId, projectSecret: !!projectSecret });
        return res.status(500).json({ message: "IPFS configuration error - missing credentials" });
      }
      
      const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
      
      console.log("Connecting to IPFS with credentials...");
      
      const ipfs = createIPFSClient({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: auth
        }
      });
      
      console.log("Adding data to IPFS...");
      
      // Add the data to IPFS
      const result = await ipfs.add(JSON.stringify(data));
      
      console.log("IPFS upload successful:", result.path);
      
      return res.status(200).json({ 
        cid: result.path,
        size: result.size 
      });
    } catch (error) {
      console.error("IPFS upload error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ message: "Error uploading to IPFS", error: errorMessage });
    }
  });
  
  // API endpoint to retrieve data from IPFS
  app.get("/api/ipfs/get/:cid", async (req, res) => {
    try {
      const { cid } = req.params;
      
      if (!cid) {
        return res.status(400).json({ message: "No CID provided" });
      }
      
      // Use a public gateway to retrieve the data
      const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
      
      if (!response.ok) {
        return res.status(404).json({ message: "Content not found on IPFS" });
      }
      
      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error("IPFS retrieval error:", error);
      return res.status(500).json({ message: "Error retrieving from IPFS" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
