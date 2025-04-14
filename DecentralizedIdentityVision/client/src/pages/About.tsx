
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ThreeBackground from '@/components/ThreeBackground';
import { useEffect, useState } from 'react';

const About = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const steps = [
    {
      title: "Connect Your Wallet",
      description: "Begin by connecting your MetaMask or compatible Ethereum wallet to establish your identity's cryptographic foundation. This allows for passwordless authentication secured by your private key.",
      color: "blue",
      position: "right",
      icon: "🔗"
    },
    {
      title: "Register Your Identity",
      description: "Fill out and submit your identity information. This data is encrypted and securely stored on IPFS (InterPlanetary File System), a decentralized storage network.",
      color: "cyan",
      position: "left",
      icon: "📝"
    },
    {
      title: "Blockchain Linkage",
      description: "A smart contract on the Ethereum blockchain creates a secure link between your wallet address and the IPFS Content Identifier (CID) where your identity data is stored, without storing the actual data on-chain.",
      color: "teal",
      position: "right",
      icon: "⛓️"
    },
    {
      title: "Verification Process",
      description: "Anyone can verify your identity by providing your wallet address. The system retrieves the CID from the blockchain and fetches your identity data from IPFS, establishing a trustless verification process.",
      color: "green",
      position: "left",
      icon: "✅"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <>
      <ThreeBackground />
      <div className="fixed inset-0 bg-gradient-to-br from-black/20 via-black/40 to-black/60 pointer-events-none" />
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none" />
      <section className="min-h-screen py-16 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent"
          style={{
            transform: `translate(${(mousePosition.x / window.innerWidth - 0.5) * 20}px, ${(mousePosition.y / window.innerHeight - 0.5) * 20}px)`,
            transition: 'transform 0.2s ease-out'
          }}
        />
        
        <div className="max-w-6xl mx-auto px-6 relative">
          <motion.h2 
            className="text-6xl font-bold mb-16 bg-gradient-to-r from-white via-cyan-300 to-blue-500 text-transparent bg-clip-text text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>

          <motion.div 
            className="relative"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-cyan-500 to-green-500 rounded-full z-0 hidden md:block opacity-50">
              <div className="animate-pulse-slow absolute inset-0 bg-gradient-to-b from-blue-400 via-cyan-400 to-green-400 rounded-full blur-sm"></div>
            </div>

            {steps.map((step, index) => {
              const colorMap = {
                blue: "from-blue-600 to-blue-400",
                cyan: "from-cyan-600 to-cyan-400",
                teal: "from-teal-600 to-teal-400",
                green: "from-green-600 to-green-400",
              };

              const isRight = step.position === "right";

              return (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  className={`mb-24 relative z-10 md:w-11/12 group ${isRight ? 'md:ml-auto md:pl-20' : 'md:mr-auto md:pr-20'}`}
                  whileHover="hover"
                >
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{
                      transform: `translate(${(mousePosition.x / window.innerWidth - 0.5) * -30}px, ${(mousePosition.y / window.innerHeight - 0.5) * -30}px)`,
                    }}
                  />
                  
                  <Card className="backdrop-blur-xl bg-black/40 border border-white/10 shadow-xl overflow-hidden group-hover:border-white/30 transition-all duration-300">
                    <div className={`absolute h-24 w-1 bg-gradient-to-b ${colorMap[step.color]} ${isRight ? 'left-0' : 'right-0'} top-full group-hover:scale-y-110 transition-transform`}></div>

                    <CardContent className="p-10 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                      <div className="text-6xl mb-6 opacity-80">{step.icon}</div>
                      <h3 className="text-3xl font-semibold mb-6 flex items-center bg-gradient-to-r from-white to-cyan-300 text-transparent bg-clip-text group-hover:to-blue-400 transition-all">
                        <span>{step.title}</span>
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-lg group-hover:text-white transition-colors">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div 
            className="mt-20 text-center relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-green-500/20 blur-3xl -z-10"></div>
            <h3 className="text-3xl font-semibold mb-8 bg-gradient-to-r from-white to-cyan-300 text-transparent bg-clip-text">Ready to Get Started?</h3>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-cyan-500/20 px-8 py-6 text-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  Register Your Identity
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/verify">
                <Button variant="outline" className="border-white/20 hover:bg-white/10 px-8 py-6 text-lg relative overflow-hidden group backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                  Verify an Identity
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default About;
