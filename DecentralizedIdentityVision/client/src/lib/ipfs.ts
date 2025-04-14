import { create, IPFSHTTPClient } from 'ipfs-http-client';

// IPFS Gateway for retrieving identity data
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// Initialize IPFS client with an Infura gateway or use a public one
// In production, you'd use your own IPFS node or a dedicated service
const projectId = import.meta.env.VITE_INFURA_IPFS_PROJECT_ID || '';
const projectSecret = import.meta.env.VITE_INFURA_IPFS_PROJECT_SECRET || '';
const auth = projectId && projectSecret 
  ? 'Basic ' + btoa(projectId + ':' + projectSecret)
  : '';

const ipfsClient = () => {
  if (projectId && projectSecret) {
    return create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https',
      headers: {
        authorization: auth,
      },
    });
  }
  
  // Fallback to a public gateway with limited functionality
  return null;
};

export const ipfs = ipfsClient();

/**
 * Upload data to IPFS
 * @param data - Object to store on IPFS
 * @returns CID string or null if upload fails
 */
export const uploadToIPFS = async (data: any): Promise<string | null> => {
  try {
    // If we have a client, use that
    if (ipfs) {
      const result = await ipfs.add(JSON.stringify(data));
      return result.path;
    }
    
    // Otherwise, use the server-side API to handle IPFS upload
    const response = await fetch('/api/ipfs/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }
    
    const result = await response.json();
    return result.cid;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return null;
  }
};

/**
 * Get data from IPFS by CID
 * @param cid - IPFS Content Identifier
 * @returns The data object or null if retrieval fails
 */
export const getFromIPFS = async (cid: string): Promise<any | null> => {
  try {
    // Try to use the gateway directly
    const response = await fetch(`${IPFS_GATEWAY}${cid}`);
    
    if (!response.ok) {
      throw new Error('Failed to retrieve from IPFS');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    
    // Fallback to server API if direct gateway fails
    try {
      const serverResponse = await fetch(`/api/ipfs/get/${cid}`);
      
      if (!serverResponse.ok) {
        throw new Error('Failed to retrieve from IPFS via server');
      }
      
      return await serverResponse.json();
    } catch (serverError) {
      console.error('Error retrieving from IPFS via server:', serverError);
      return null;
    }
  }
};
