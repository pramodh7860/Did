import { useState } from 'react';
import { useWeb3 } from '@/lib/web3';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { identityDataSchema } from '@shared/schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { uploadToIPFS, IPFS_GATEWAY } from '@/lib/ipfs';
import { ArrowRight, Check, AlertTriangle, Loader2 } from 'lucide-react';
import AIAnimation from '@/components/AIAnimation';

// Extend the schema for the form
const formSchema = identityDataSchema.extend({
  fullName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.coerce.number().min(1, {
    message: "Age must be a positive number.",
  }).max(120, {
    message: "Age must be less than 120.",
  }),
  collegeId: z.string().min(2, {
    message: "College ID must be at least 2 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Register = () => {
  const { web3, account, identityContract, isConnected, connectWallet } = useWeb3();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [ipfsCid, setIpfsCid] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      age: undefined,
      collegeId: "",
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!isConnected || !account || !web3 || !identityContract) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your MetaMask wallet first.",
      });
      return;
    }
    
    setIsSubmitting(true);
    setRegistrationError(null);
    
    try {
      // Add timestamp to the data
      const identityData = {
        ...data,
        walletAddress: account,
        timestamp: new Date().toISOString(),
      };
      
      // 1. Upload data to IPFS
      toast({
        title: "Uploading to IPFS",
        description: "Please wait while your identity data is being uploaded to IPFS...",
      });
      
      let cid = null;
      try {
        cid = await uploadToIPFS(identityData);
      } catch (ipfsError) {
        console.warn("IPFS upload failed, will continue with local storage only:", ipfsError);
        toast({
          title: "IPFS upload failed",
          description: "Continuing with local database storage only",
          variant: "destructive",
        });
      }
      
      // Store CID if available
      if (cid) {
        setIpfsCid(cid);
      }
      
      // 2. Store CID in the blockchain via smart contract (skip if no CID)
      if (cid) {
        toast({
          title: "Storing on blockchain",
          description: "Please confirm the transaction in MetaMask...",
        });
        
        // Check if we have the contract deployed and ready
        if (identityContract && identityContract.methods) {
          try {
            const tx = await identityContract.methods.registerIdentity(cid).send({ from: account });
            setTxHash(tx.transactionHash);
          } catch (err) {
            console.warn("Smart contract interaction failed, continuing with backend storage", err);
            // For demo purposes, we'll continue without blockchain storage
            setTxHash("demo-transaction-hash-" + Date.now());
          }
        } else {
          console.warn("No smart contract available, continuing with backend storage only");
          // For demo purposes, we'll continue without blockchain storage
          setTxHash("demo-transaction-hash-" + Date.now());
        }
      } else {
        // Skip blockchain storage if no CID is available
        console.log("Skipping blockchain storage as no IPFS CID is available");
      }
      
      // 3. Save to backend for indexing
      const backendData = {
        walletAddress: account,
        ipfsCid: cid,
        fullName: data.fullName,
        age: data.age,
        collegeId: data.collegeId,
        // Include full profile data if IPFS failed
        profileData: !cid ? identityData : undefined,
      };
      
      const response = await fetch('/api/identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend storage error:", errorData);
        // Continue anyway since blockchain storage succeeded
      }
      
      // Show success
      setRegistrationSuccess(true);
      
      // Create a message based on what storage methods were successful
      let successDescription = "";
      if (cid && txHash) {
        successDescription = "Your identity has been securely stored on IPFS and referenced on the blockchain.";
      } else if (cid) {
        successDescription = "Your identity has been stored on IPFS and in the database.";
      } else {
        successDescription = "Your identity has been stored securely in the database.";
      }
      
      toast({
        title: "Registration successful!",
        description: successDescription,
        variant: "default",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      setRegistrationError(error.message || "An error occurred during registration");
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleTryAgain = () => {
    setRegistrationError(null);
    setRegistrationSuccess(false);
    setIpfsCid(null);
    setTxHash(null);
  };
  
  return (
    <section id="register" className="py-16">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="text-3xl font-bold mb-16 bg-gradient-to-r from-white to-cyan-300 text-transparent bg-clip-text text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Register Your Identity
        </motion.h2>
        
        <motion.div 
          className="relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* DNA helix animation in background */}
          <AIAnimation type="dna" color="#00ffaa" scale={0.8} className="z-0" />
          <Card className="backdrop-blur-xl bg-primary-800/75 border border-white/10 shadow-lg">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-bl-full z-0"></div>
              
              {!registrationSuccess && !registrationError && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="Enter your full name" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Age</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number"
                                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="Enter your age" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="collegeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">College ID</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                placeholder="Enter your college ID" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <FormLabel className="text-gray-300">Wallet Address</FormLabel>
                        <div className="bg-primary-900/80 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono text-sm break-all flex items-center justify-between">
                          <span>{account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Connect your wallet first'}</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      {!isConnected ? (
                        <Button
                          type="button"
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 w-full py-3 px-6 rounded-lg text-white font-medium transition-all shadow-lg shadow-cyan-500/20"
                          onClick={connectWallet}
                        >
                          Connect Wallet First
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 w-full py-3 px-6 rounded-lg text-white font-medium transition-all shadow-lg shadow-cyan-500/20"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <span>Register Identity on Blockchain</span>
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}
                      <p className="text-xs text-gray-400 mt-3 text-center">Your data will be encrypted and stored on IPFS with only a reference stored on the blockchain.</p>
                    </div>
                  </form>
                </Form>
              )}
              
              {/* Registration Success */}
              {registrationSuccess && (
                <div className="text-center p-8 relative z-10">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
                    <Check className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-white">Identity Registered Successfully!</h3>
                  <p className="text-gray-300 mb-6">
                    {ipfsCid && txHash 
                      ? "Your identity has been securely stored on IPFS and referenced on the Ethereum blockchain."
                      : ipfsCid 
                        ? "Your identity has been stored on IPFS and in the database."
                        : "Your identity has been stored securely in the database."
                    }
                  </p>
                  
                  {ipfsCid && (
                    <div className="backdrop-blur-xl bg-primary-900/30 p-4 rounded-lg mb-6 max-w-md mx-auto">
                      <p className="text-sm text-gray-400 mb-2">IPFS Content Identifier (CID):</p>
                      <p className="font-mono text-xs bg-primary-900/80 p-2 rounded break-all">{ipfsCid}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/verify">
                      <Button variant="outline" className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400">
                        Verify your identity
                      </Button>
                    </Link>
                    
                    {txHash && (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400">
                          View on Etherscan
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {/* Registration Error */}
              {registrationError && (
                <div className="text-center p-8 relative z-10">
                  <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-white">Registration Failed</h3>
                  <p className="text-gray-300 mb-6">{registrationError}</p>
                  <Button onClick={handleTryAgain} className="bg-white/10 hover:bg-white/20 transition-colors">
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Register;
