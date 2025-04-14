import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import UserCounter from '@/components/UserCounter';
import IdentityCard from '@/components/IdentityCard';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lock, Database, ShieldCheck } from 'lucide-react';
import { useWeb3 } from '@/lib/web3';
import AIAnimation from '@/components/AIAnimation';

const Home = () => {
  const { isConnected, account } = useWeb3();
  
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };
  
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const [identityData, setIdentityData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchIdentityData = async () => {
      if (!isConnected || !account) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/identity/${account}`);
        if (response.ok) {
          const data = await response.json();
          setIdentityData(data);
        }
      } catch (error) {
        console.error("Error fetching identity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdentityData();
  }, [isConnected, account]);
  
  const featureItems = [
    {
      title: "Passwordless Authentication",
      description: "Connect using your MetaMask wallet for secure, passwordless login with cryptographic verification.",
      icon: <Lock className="h-6 w-6" />,
      gradient: "from-blue-500 to-purple-500"
    },
    {
      title: "Decentralized Storage",
      description: "Your data is securely stored on IPFS, giving you complete control and eliminating central points of failure.",
      icon: <Database className="h-6 w-6" />,
      gradient: "from-cyan-500 to-teal-500"
    },
    {
      title: "Verifiable Credentials",
      description: "Allow selective disclosure of your identity information with cryptographic proof of authenticity.",
      icon: <ShieldCheck className="h-6 w-6" />,
      gradient: "from-cyan-500 to-green-500"
    }
  ];
  
  return (
    <>
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between py-16 relative overflow-hidden">
        {/* Neural network animation in background */}
        <AIAnimation type="neurons" color="#00ffff" scale={1.5} />
        
        <motion.div 
          className="w-full md:w-1/2 z-10 mb-12 md:mb-0"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-float">
            <span className="bg-gradient-to-r from-white to-cyan-300 text-transparent bg-clip-text block">Decentralized</span>
            <span className="bg-gradient-to-r from-white to-cyan-300 text-transparent bg-clip-text block">Identity</span>
            <span className="bg-gradient-to-r from-white to-cyan-300 text-transparent bg-clip-text block">Management</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Take control of your digital identity with blockchain technology. Secure, private, and owned entirely by you.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-medium animate-pulse-slow transform transition hover:scale-105 shadow-lg shadow-cyan-500/20"
              >
                Register Identity
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/verify">
              <Button 
                size="lg" 
                variant="outline" 
                className="border border-white/30 bg-white/5 hover:bg-white/10 text-white font-medium transform transition hover:scale-105"
              >
                Verify Identity
              </Button>
            </Link>
          </div>
          
          <UserCounter count={1200} />
        </motion.div>
        
        <motion.div
          className="w-full md:w-1/2 flex justify-center z-10"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          {isLoading ? (
            <div className="animate-pulse bg-primary-800/50 rounded-xl p-8">
              Loading identity data...
            </div>
          ) : identityData ? (
            <IdentityCard data={identityData} />
          ) : (
            <div className="text-center p-8 bg-primary-800/50 rounded-xl">
              <p className="text-gray-400">No identity registered yet.</p>
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 mt-2 inline-block">
                Register now →
              </Link>
            </div>
          )}
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 relative overflow-hidden">
        {/* Digital blocks animation in background */}
        <AIAnimation type="blocks" color="#0088ff" scale={1.2} />
        
        <motion.h2 
          className="text-3xl font-bold text-center mb-16 bg-gradient-to-r from-white to-cyan-300 text-transparent bg-clip-text"
          variants={fadeIn}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          Secured by Blockchain Technology
        </motion.h2>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {featureItems.map((feature, index) => (
            <motion.div 
              key={index}
              className="backdrop-blur-xl bg-primary-800/75 border border-white/10 p-6 rounded-xl transform transition-all hover:scale-105 hover:shadow-xl"
              variants={fadeIn}
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 p-3`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
};

export default Home;
