// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IdentityRegistry
 * @dev Stores and retrieves identity information linked to Ethereum addresses
 */
contract IdentityRegistry {
    // Owner of the contract
    address public owner;

    // Mapping to store IPFS CIDs against Ethereum addresses
    mapping(address => string) private identityCIDs;
    
    // Mapping to store version number for each identity
    mapping(address => uint256) private identityVersions;
    
    // Mapping to store previous CIDs for each identity
    mapping(address => string[]) private previousCIDs;
    
    // Events
    event IdentityRegistered(address indexed userAddress, string cid, uint256 timestamp);
    event IdentityUpdated(address indexed userAddress, string newCid, uint256 version, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Register a new identity for the sender's address
     * @param cid IPFS Content Identifier (CID) where identity data is stored
     */
    function registerIdentity(string memory cid) public {
        require(bytes(identityCIDs[msg.sender]).length == 0, "Identity already registered");
        require(bytes(cid).length > 0, "CID cannot be empty");
        
        identityCIDs[msg.sender] = cid;
        identityVersions[msg.sender] = 1;
        
        emit IdentityRegistered(msg.sender, cid, block.timestamp);
    }
    
    /**
     * @dev Update an existing identity
     * @param cid New IPFS CID where updated identity data is stored
     */
    function updateIdentity(string memory cid) public {
        require(bytes(identityCIDs[msg.sender]).length > 0, "Identity not registered");
        require(bytes(cid).length > 0, "CID cannot be empty");
        
        // Store the current CID in history before updating
        previousCIDs[msg.sender].push(identityCIDs[msg.sender]);
        
        // Update to new CID and increment version
        identityCIDs[msg.sender] = cid;
        identityVersions[msg.sender]++;
        
        emit IdentityUpdated(msg.sender, cid, identityVersions[msg.sender], block.timestamp);
    }
    
    /**
     * @dev Get the IPFS CID for an address
     * @param userAddress Ethereum address to lookup
     * @return CID string
     */
    function getIdentityCID(address userAddress) public view returns (string memory) {
        return identityCIDs[userAddress];
    }
    
    /**
     * @dev Check if an identity exists for an address
     * @param userAddress Ethereum address to check
     * @return boolean indicating if identity exists
     */
    function identityExists(address userAddress) public view returns (bool) {
        return bytes(identityCIDs[userAddress]).length > 0;
    }
    
    /**
     * @dev Get the current version of an identity
     * @param userAddress Ethereum address to lookup
     * @return version number
     */
    function getIdentityVersion(address userAddress) public view returns (uint256) {
        require(identityExists(userAddress), "Identity does not exist");
        return identityVersions[userAddress];
    }
    
    /**
     * @dev Get previous CIDs for an identity
     * @param userAddress Ethereum address to lookup
     * @return array of previous CIDs
     */
    function getPreviousCIDs(address userAddress) public view returns (string[] memory) {
        require(identityExists(userAddress), "Identity does not exist");
        return previousCIDs[userAddress];
    }
}
