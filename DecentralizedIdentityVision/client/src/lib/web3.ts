import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import IdentityRegistryABI from '@/contracts/IdentityRegistry.json';

// Type definition for window.ethereum (MetaMask)
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      selectedAddress?: string;
    };
  }
}

interface Web3ContextType {
  web3: Web3 | null;
  account: string | null;
  chainId: number | null;
  identityContract: any | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  web3: null,
  account: null,
  chainId: null,
  identityContract: null,
  isConnected: false,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  error: null,
});

// Use Sepolia testnet contract address or a local address for development
const IDENTITY_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x8B45D5174bdc61ACa647Ad4cF058DC3b5A95c487';

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [identityContract, setIdentityContract] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract once web3 is available
  useEffect(() => {
    if (web3) {
      try {
        const contract = new web3.eth.Contract(
          IdentityRegistryABI as AbiItem[],
          IDENTITY_CONTRACT_ADDRESS
        );
        setIdentityContract(contract);
      } catch (err) {
        console.error('Failed to initialize contract:', err);
        setError('Failed to initialize blockchain contract');
      }
    }
  }, [web3]);

  // Listen for account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setAccount(null);
          setIsConnected(false);
        } else if (accounts[0] !== account) {
          // Account changed
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setChainId(newChainId);
      };

      window.ethereum?.on('accountsChanged', handleAccountsChanged);
      window.ethereum?.on('chainChanged', handleChainChanged);

      // Check if already connected
      if (isConnected && window.ethereum?.selectedAddress) {
        setAccount(window.ethereum?.selectedAddress);
      }

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [account, isConnected]);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not detected. Please install MetaMask to use this application.');
      }

      // Initialize Web3 with the current provider
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get current chain ID
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainIdHex, 16));

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
      }
    } catch (err: any) {
      console.error('Error connecting to wallet:', err);
      setError(err.message || 'Failed to connect to wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
  };

  const contextValue: Web3ContextType = {
    web3,
    account,
    chainId,
    identityContract,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    error,
  };

  // Return the provider with children
  return React.createElement(
    Web3Context.Provider,
    { value: contextValue },
    children
  );
};

export const useWeb3 = () => useContext(Web3Context);
