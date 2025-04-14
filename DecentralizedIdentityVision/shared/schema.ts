import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define identity record schema
export const identities = pgTable("identities", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  ipfsCid: text("ipfs_cid"), // Made optional to allow for local-only storage
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  collegeId: text("college_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  version: integer("version").default(1).notNull(),
  previousVersions: jsonb("previous_versions").$type<string[]>(), // Array of previous IPFS CIDs
  profileData: jsonb("profile_data"), // Stores full profile data locally as backup
});

// Insert schema for creating new identity
export const insertIdentitySchema = createInsertSchema(identities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  version: true,
  previousVersions: true,
}).extend({
  ipfsCid: z.string().nullable().optional(), // Make ipfsCid optional and allow null
  profileData: z.any().optional(), // Add profileData field as optional
});

// Schema for updating an identity
export const updateIdentitySchema = createInsertSchema(identities).pick({
  fullName: true,
  age: true,
  collegeId: true,
});

// Create a validation schema for wallet address
export const walletAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address format");

// Create a validation schema for identity data
export const identityDataSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  age: z.number().min(1, "Age must be a positive number"),
  collegeId: z.string().min(1, "College ID is required"),
});

export type InsertIdentity = z.infer<typeof insertIdentitySchema>;
export type UpdateIdentity = z.infer<typeof updateIdentitySchema>;
export type Identity = typeof identities.$inferSelect;
export type IdentityData = z.infer<typeof identityDataSchema>;
