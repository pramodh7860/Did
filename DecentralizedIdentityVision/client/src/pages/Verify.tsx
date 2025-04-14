import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { walletAddressSchema } from '@shared/schema';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/lib/web3';
import { getFromIPFS, IPFS_GATEWAY } from '@/lib/ipfs';
import { ShieldCheck, Clipboard, ExternalLink, Database, AlertTriangle, Search, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import AIAnimation from '@/components/AIAnimation';

// Create form schema
const formSchema = z.object({
  walletAddress: walletAddressSchema,
});

type FormValues = z.infer<typeof formSchema>;

interface VerificationResult {
  fullName: string;
  age: number;
  collegeId: string;
  walletAddress: string;
  ipfsCid: string;
  timestamp: string;
}

const Verify = () => {
  const { web3, identityContract, account } = useWeb3();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      walletAddress: "",
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsVerifying(true);
    setVerificationResult(null);
    setNotFound(false);
    
    try {
      // Try blockchain verification first, but fallback to backend API if needed
      let cid = null;
      
      // If smart contract is available, try to use it
      if (web3 && identityContract && identityContract.methods) {
        try {
          // 1. Check if the identity exists on the blockchain
          const exists = await identityContract.methods.identityExists(data.walletAddress).call();
          
          if (!exists) {
            // Fall back to backend API
            console.log("Identity not found on blockchain, checking backend API...");
          } else {
            // 2. Get the CID from the blockchain
            cid = await identityContract.methods.getIdentityCID(data.walletAddress).call();
          }
        } catch (err) {
          console.warn("Smart contract interaction failed, falling back to backend API", err);
          // Continue with backend API
        }
      }
      
      // If we couldn't get the CID from blockchain, try from backend API
      if (!cid) {
        try {
          const response = await fetch(`/api/identity/${data.walletAddress}`);
          
          if (response.status === 404) {
            setNotFound(true);
            return;
          }
          
          if (!response.ok) {
            throw new Error("Failed to retrieve identity from backend");
          }
          
          const identity = await response.json();
          cid = identity.ipfsCid;
        } catch (err) {
          console.error("Backend API error:", err);
          setNotFound(true);
          return;
        }
      }
      
      let identityData;
      
      // Check if we have the identity in the backend API
      try {
        const response = await fetch(`/api/identity/${data.walletAddress}`);
        
        if (!response.ok) {
          if (response.status !== 404) {
            throw new Error("Failed to retrieve identity from backend");
          }
          // Will be handled below if no IPFS data is also available
        } else {
          // We found the identity in the backend
          const identity = await response.json();
          
          // If we have IPFS data, use it
          if (cid) {
            try {
              const ipfsData = await getFromIPFS(cid);
              if (ipfsData) {
                identityData = ipfsData;
              }
            } catch (err) {
              console.warn("Failed to retrieve data from IPFS, falling back to database data", err);
            }
          }
          
          // If we don't have IPFS data but we have profile data, use that
          if (!identityData && identity.profileData) {
            identityData = identity.profileData;
          } else if (!identityData) {
            // If we don't have IPFS data and no profile data, use the identity data itself
            identityData = {
              fullName: identity.fullName,
              age: identity.age,
              collegeId: identity.collegeId,
              walletAddress: identity.walletAddress,
              timestamp: identity.updatedAt || identity.createdAt || new Date().toISOString()
            };
          }
        }
      } catch (err) {
        console.error("Error retrieving identity data:", err);
      }
      
      // If we still don't have data, throw an error
      if (!identityData) {
        setNotFound(true);
        return;
      }
      
      // 4. Set the verification result
      setVerificationResult({
        fullName: identityData.fullName,
        age: identityData.age,
        collegeId: identityData.collegeId,
        walletAddress: data.walletAddress,
        ipfsCid: cid || "No IPFS CID available (using database storage)",
        timestamp: identityData.timestamp || new Date().toISOString(),
      });
      
      toast({
        title: "Identity verified",
        description: "Identity data has been successfully retrieved and verified.",
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "An error occurred during verification",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.startsWith("0x")) {
        form.setValue("walletAddress", text);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Clipboard error",
        description: "Unable to access clipboard. Please paste the address manually.",
      });
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <section id="verify" className="py-16">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="text-3xl font-bold mb-16 bg-gradient-to-r from-white to-cyan-300 text-transparent bg-clip-text text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Verify Identity
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="backdrop-blur-xl bg-primary-800/75 border border-white/10 shadow-lg relative overflow-hidden">
            {/* Particles animation in background */}
            <AIAnimation type="particles" color="#00eeff" scale={1.2} />
            
            <CardContent className="p-8 relative z-10">
              {!isVerifying && !verificationResult && !notFound && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="walletAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Ethereum Wallet Address</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-primary-900/50 border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                                placeholder="0x..." 
                              />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              onClick={handlePasteFromClipboard}
                            >
                              <Clipboard className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-center pt-2">
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 py-3 px-8 rounded-lg text-white font-medium transition-all shadow-lg shadow-cyan-500/20"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Verify Identity
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
              
              {/* Verification Loading */}
              {isVerifying && (
                <div className="py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
                  <p className="text-gray-300">Retrieving identity from blockchain and IPFS...</p>
                </div>
              )}
              
              {/* Verification Result */}
              {verificationResult && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 bg-primary-900/50 rounded-xl p-6 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-semibold text-white">Identity Information</h3>
                    <div className="text-green-400 bg-green-900/30 px-3 py-1 rounded-full text-sm flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-1" />
                      Verified on Blockchain
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <label className="text-xs text-gray-400">Name</label>
                        <p className="text-white text-lg font-medium">{verificationResult.fullName}</p>
                      </div>
                      <div className="mb-4">
                        <label className="text-xs text-gray-400">Age</label>
                        <p className="text-white text-lg font-medium">{verificationResult.age}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">College ID</label>
                        <p className="text-white text-lg font-medium">{verificationResult.collegeId}</p>
                      </div>
                    </div>
                    <div>
                      <div className="mb-4">
                        <label className="text-xs text-gray-400">Wallet Address</label>
                        <p className="text-white text-sm font-mono bg-primary-900/80 p-2 rounded mt-1 break-all">
                          {verificationResult.walletAddress}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Storage Information</label>
                        <p className="text-white text-sm font-mono bg-primary-900/80 p-2 rounded mt-1 break-all">
                          {verificationResult.ipfsCid.startsWith('Qm')
                            ? verificationResult.ipfsCid
                            : "Data stored in database (no IPFS CID available)"}
                        </p>
                      </div>
                      <div className="mt-4">
                        <label className="text-xs text-gray-400">Last Updated</label>
                        <p className="text-white">{formatDate(verificationResult.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a 
                      href={`https://sepolia.etherscan.io/address/${verificationResult.walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View on Etherscan
                    </a>
                    {verificationResult.ipfsCid && verificationResult.ipfsCid.startsWith('Qm') && (
                      <a 
                        href={`${IPFS_GATEWAY}${verificationResult.ipfsCid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center"
                      >
                        <Database className="h-4 w-4 mr-1" />
                        View on IPFS Gateway
                      </a>
                    )}
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-gray-700 text-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setVerificationResult(null);
                        form.reset();
                      }}
                      className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400"
                    >
                      Verify Another Identity
                    </Button>
                  </div>
                </motion.div>
              )}
              
              {/* Not Found State */}
              {notFound && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mt-8 bg-primary-900/50 rounded-xl p-6 border border-gray-700 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Identity Not Found</h3>
                  <p className="text-gray-300 mb-4">No identity record was found for the provided wallet address.</p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNotFound(false);
                        form.reset();
                      }}
                      className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400"
                    >
                      Try Another Address
                    </Button>
                    
                    <Link href="/register">
                      <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white">
                        Register New Identity
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Verify;
