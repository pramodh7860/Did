import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface IdentityCardProps {
  data: {
    fullName: string;
    age: number;
    collegeId: string;
    walletAddress: string;
    ipfsCid: string;
    updatedAt?: string | Date;
  };
  isVerified?: boolean;
  isAnimated?: boolean;
}

const IdentityCard = ({ data, isVerified = true, isAnimated = true }: IdentityCardProps) => {
  // Format the wallet address to show only a portion
  const formatAddress = (address: string) => {
    return address.length > 10 
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  };
  
  // Format CID to be shorter for display
  const formatCid = (cid: string | null) => {
    if (!cid) return 'No CID';
    return cid.length > 15
      ? `${cid.substring(0, 6)}...${cid.substring(cid.length - 3)}`
      : cid;
  };
  
  // Format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const cardVariants = {
    initial: { 
      rotate: isAnimated ? 3 : 0,
      opacity: 0,
      y: 20
    },
    animate: { 
      rotate: isAnimated ? 3 : 0,
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    },
    hover: {
      rotate: 0,
      scale: 1.02,
      transition: {
        duration: 0.3
      }
    }
  };
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={cardVariants}
      className="w-full max-w-md"
    >
      <Card className="backdrop-blur-xl bg-primary-800/75 border border-white/10 shadow-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-1">Decentralized Identity</h3>
              <p className="text-sm text-gray-400">Stored on IPFS, referenced by Ethereum</p>
            </div>
            {isVerified && (
              <div className="text-green-400 bg-green-900/30 px-2 py-1 rounded-md text-xs flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Verified
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="border-b border-gray-700 pb-3">
              <label className="text-xs text-gray-400">Name</label>
              <p className="text-white">{data.fullName}</p>
            </div>
            
            <div className="border-b border-gray-700 pb-3">
              <label className="text-xs text-gray-400">Age</label>
              <p className="text-white">{data.age}</p>
            </div>
            
            <div className="border-b border-gray-700 pb-3">
              <label className="text-xs text-gray-400">College ID</label>
              <p className="text-white">{data.collegeId}</p>
            </div>
            
            <div className="mt-2">
              <label className="text-xs text-gray-400">Wallet Address</label>
              <div className="font-mono text-xs text-white bg-primary-900/80 p-2 rounded mt-1 overflow-hidden">
                {formatAddress(data.walletAddress)}
              </div>
            </div>
            
            <div className="mt-2">
              <label className="text-xs text-gray-400">
                IPFS: <span className="text-gray-500">{formatCid(data.ipfsCid)}</span>
              </label>
            </div>
          </div>
          
          <div className="text-right text-xs text-gray-500 mt-4">
            Last updated: {formatDate(data.updatedAt || new Date())}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IdentityCard;
