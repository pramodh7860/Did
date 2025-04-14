import { useWeb3 } from '@/lib/web3';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const ConnectWalletButton = () => {
  const { connectWallet, disconnectWallet, isConnected, isConnecting, account, error } = useWeb3();
  const { toast } = useToast();
  
  const handleConnectClick = async () => {
    if (isConnected) {
      disconnectWallet();
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected from the application.",
      });
    } else {
      try {
        await connectWallet();
        toast({
          title: "Wallet connected",
          description: "Your wallet has been successfully connected!",
        });
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: error || "Failed to connect wallet. Please try again.",
        });
      }
    }
  };
  
  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  return (
    <Button
      onClick={handleConnectClick}
      variant={isConnected ? "outline" : "default"}
      className={`font-medium flex items-center space-x-2 ${isConnected ? 'bg-green-600/20 text-green-500 hover:bg-green-600/30 border-green-500/50' : 'bg-blue-600 hover:bg-blue-700'}`}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <svg 
          className="h-4 w-4 mr-2" 
          viewBox="0 0 35 33" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M32.9582 1L19.8241 10.9635L22.2667 5.12242L32.9582 1Z" 
            fill={isConnected ? "#21c55d" : "#E2761B"} 
            stroke={isConnected ? "#21c55d" : "#E2761B"} 
            strokeWidth="0.3"
          />
          <path 
            d="M2.04179 1L15.0842 11.0538L12.7333 5.12242L2.04179 1Z" 
            fill={isConnected ? "#21c55d" : "#E4761B"} 
            stroke={isConnected ? "#21c55d" : "#E4761B"} 
            strokeWidth="0.3"
          />
          <path 
            d="M28.1201 23.5059L24.6038 28.8136L32.047 30.8482L34.1732 23.6275L28.1201 23.5059Z" 
            fill={isConnected ? "#21c55d" : "#E4761B"} 
            stroke={isConnected ? "#21c55d" : "#E4761B"} 
            strokeWidth="0.3"
          />
          <path 
            d="M0.836646 23.6275L2.95288 30.8482L10.3962 28.8136L6.87986 23.5059L0.836646 23.6275Z" 
            fill={isConnected ? "#21c55d" : "#E4761B"} 
            stroke={isConnected ? "#21c55d" : "#E4761B"} 
            strokeWidth="0.3"
          />
          <path 
            d="M9.93722 14.4856L7.82178 17.6132L15.2132 17.9264L14.979 9.99609L9.93722 14.4856Z" 
            fill={isConnected ? "#21c55d" : "#E4761B"} 
            stroke={isConnected ? "#21c55d" : "#E4761B"} 
            strokeWidth="0.3"
          />
          <path 
            d="M25.0628 14.4856L19.9546 9.90577L19.8241 17.9264L27.1782 17.6132L25.0628 14.4856Z" 
            fill={isConnected ? "#21c55d" : "#E4761B"} 
            stroke={isConnected ? "#21c55d" : "#E4761B"} 
            strokeWidth="0.3"
          />
          <path 
            d="M10.3962 28.8136L14.7491 26.6676L10.969 23.6797L10.3962 28.8136Z" 
            fill={isConnected ? "#21c55d" : "#E4761B"} 
            stroke={isConnected ? "#21c55d" : "#E4761B"} 
            strokeWidth="0.3"
          />
          <path 
            d="M20.2508 26.6676L24.6038 28.8136L24.031 23.6797L20.2508 26.6676Z" 
            fill={isConnected ? "#21c55d" : "#E4761B"} 
            stroke={isConnected ? "#21c55d" : "#E4761B"} 
            strokeWidth="0.3"
          />
        </svg>
      )}
      {isConnected 
        ? <span>{account ? formatAddress(account) : 'Connected'}</span>
        : <span>Connect Wallet</span>
      }
    </Button>
  );
};

export default ConnectWalletButton;
