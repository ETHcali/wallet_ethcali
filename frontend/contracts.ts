// Auto-generated multi-network contract addresses and types
// Generated: 2026-02-02T17:40:39.721Z
export const CONTRACTS = {
  "networks": {
    "base": {
      "network": "base",
      "chainId": 8453,
      "contracts": {
        "ZKPassportNFT": {
          "address": "0x458eb490bf5f56b6ada8605c56bcef3510d83ec8",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "symbol",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "initialOwner",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "ERC721IncorrectOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ERC721InsufficientApproval",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "approver",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidApprover",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidOperator",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "receiver",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidReceiver",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidSender",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ERC721NonexistentToken",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "OwnableInvalidOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "OwnableUnauthorizedAccount",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "approved",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "Approval",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "ApprovalForAll",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "_fromTokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "_toTokenId",
                  "type": "uint256"
                }
              ],
              "name": "BatchMetadataUpdate",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "_tokenId",
                  "type": "uint256"
                }
              ],
              "name": "MetadataUpdate",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "externalURL",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "useIPFS",
                  "type": "bool"
                }
              ],
              "name": "MetadataUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "NFTMinted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "previousOwner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
                }
              ],
              "name": "OwnershipTransferred",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "Transfer",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "userAddress",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "VerificationApproved",
              "type": "event"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "approve",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "userAddress",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "approveVerification",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "name": "approvedVerifications",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "userAddress",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "isApproved",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "balanceOf",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getApproved",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getTokenData",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "uniqueIdentifier",
                      "type": "string"
                    },
                    {
                      "internalType": "bool",
                      "name": "faceMatchPassed",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "personhoodVerified",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct ZKPassportNFT.TokenData",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                }
              ],
              "name": "hasNFT",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "hasNFTByAddress",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "isApprovedForAll",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                }
              ],
              "name": "mint",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "mintWithVerification",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "name",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftDescription",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftExternalURL",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftImageURI",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "owner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ownerOf",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "renounceOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "setApprovalForAll",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                }
              ],
              "name": "setDescription",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "externalURL",
                  "type": "string"
                }
              ],
              "name": "setExternalURL",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                }
              ],
              "name": "setImageURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "externalURL",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "useIPFS",
                  "type": "bool"
                }
              ],
              "name": "setMetadata",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bool",
                  "name": "useIPFS",
                  "type": "bool"
                }
              ],
              "name": "setUseIPFSImage",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "symbol",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "tokenURI",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "transferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
                }
              ],
              "name": "transferOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "useIPFSImage",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        },
        "FaucetManager": {
          "address": "0xbd7d12722008a6c2f89e3906a964cc2290131a92",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_nftContract",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "initialAdmin",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "AccessControlBadConfirmation",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "neededRole",
                  "type": "bytes32"
                }
              ],
              "name": "AccessControlUnauthorizedAccount",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EnforcedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ExpectedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "AddressRemovedFromWhitelist",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "AddressWhitelisted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Claimed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "oldContract",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newContract",
                  "type": "address"
                }
              ],
              "name": "NFTContractUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "Paused",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Returned",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "previousAdminRole",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "newAdminRole",
                  "type": "bytes32"
                }
              ],
              "name": "RoleAdminChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleGranted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleRevoked",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "Unpaused",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "enum FaucetManager.VaultType",
                  "name": "vaultType",
                  "type": "uint8"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "whitelistEnabled",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "VaultCreated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "depositor",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "VaultDeposit",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "VaultGatingUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "VaultUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "VaultWithdraw",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "WhitelistUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "DEFAULT_ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "addAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address[]",
                  "name": "users",
                  "type": "address[]"
                }
              ],
              "name": "addBatchToWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "addToWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "canUserClaim",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "canClaim",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "reason",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "claim",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "claims",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "hasClaimed",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "claimedAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "claimedAt",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "hasReturned",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "returnedAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "returnedAt",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "enum FaucetManager.VaultType",
                  "name": "vaultType",
                  "type": "uint8"
                },
                {
                  "internalType": "bool",
                  "name": "whitelistEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "createVault",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "deposit",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getActiveVaults",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                },
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "balance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalReturned",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum FaucetManager.VaultType",
                      "name": "vaultType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "whitelistEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "zkPassportRequired",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "allowedToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.Vault[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getAllVaults",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "balance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalReturned",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum FaucetManager.VaultType",
                      "name": "vaultType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "whitelistEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "zkPassportRequired",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "allowedToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.Vault[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getClaimInfo",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "hasClaimed",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "hasReturned",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.ClaimInfo",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getReturnCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                }
              ],
              "name": "getRoleAdmin",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getUserClaims",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "vaultIds",
                  "type": "uint256[]"
                },
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "hasClaimed",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "hasReturned",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.ClaimInfo[]",
                  "name": "claimInfos",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "getVault",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "balance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalReturned",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum FaucetManager.VaultType",
                      "name": "vaultType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "whitelistEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "zkPassportRequired",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "allowedToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.Vault",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "grantRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "hasRole",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isSuperAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "isWhitelisted",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftContract",
              "outputs": [
                {
                  "internalType": "contract ZKPassportNFT",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "pause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "paused",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "removeAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address[]",
                  "name": "users",
                  "type": "address[]"
                }
              ],
              "name": "removeBatchFromWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "removeFromWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "callerConfirmation",
                  "type": "address"
                }
              ],
              "name": "renounceRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "returnCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "returnFunds",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "revokeRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newContract",
                  "type": "address"
                }
              ],
              "name": "setNFTContract",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "setWhitelistEnabled",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "unpause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "updateVault",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "updateVaultGating",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "vaultCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "vaults",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "balance",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "totalClaimed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "totalReturned",
                  "type": "uint256"
                },
                {
                  "internalType": "enum FaucetManager.VaultType",
                  "name": "vaultType",
                  "type": "uint8"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "whitelistEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "createdAt",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "whitelist",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "withdraw",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "stateMutability": "payable",
              "type": "receive"
            }
          ]
        },
        "Swag1155": {
          "address": "0xd4218995da2e92323d33a6e38adc8ef3a671b456",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "baseURI",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "_usdc",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "initialAdmin",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_poap",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "AccessControlBadConfirmation",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "neededRole",
                  "type": "bytes32"
                }
              ],
              "name": "AccessControlUnauthorizedAccount",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "balance",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "needed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ERC1155InsufficientBalance",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "approver",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidApprover",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "idsLength",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "valuesLength",
                  "type": "uint256"
                }
              ],
              "name": "ERC1155InvalidArrayLength",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidOperator",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "receiver",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidReceiver",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidSender",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "ERC1155MissingApprovalForAll",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "AdminAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "AdminRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "ApprovalForAll",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "originalPrice",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "finalPrice",
                  "type": "uint256"
                }
              ],
              "name": "DiscountApplied",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "HolderDiscountAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "HolderDiscountRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "discountBps",
                  "type": "uint256"
                }
              ],
              "name": "PoapDiscountAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                }
              ],
              "name": "PoapDiscountRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "quantity",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "unitPrice",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "totalPrice",
                  "type": "uint256"
                }
              ],
              "name": "Purchased",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "tokenIds",
                  "type": "uint256[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "quantities",
                  "type": "uint256[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "totalPrice",
                  "type": "uint256"
                }
              ],
              "name": "PurchasedBatch",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "RedemptionFulfilled",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "RedemptionRequested",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "previousAdminRole",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "newAdminRole",
                  "type": "bytes32"
                }
              ],
              "name": "RoleAdminChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleGranted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleRevoked",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "RoyaltiesCleared",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "name": "RoyaltyAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "ids",
                  "type": "uint256[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "values",
                  "type": "uint256[]"
                }
              ],
              "name": "TransferBatch",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "TransferSingle",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newTreasury",
                  "type": "address"
                }
              ],
              "name": "TreasuryUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "value",
                  "type": "string"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                }
              ],
              "name": "URI",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newUSDC",
                  "type": "address"
                }
              ],
              "name": "USDCUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "uri",
                  "type": "string"
                }
              ],
              "name": "VariantURISet",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "VariantUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "DEFAULT_ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "POAP_CONTRACT",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "ROYALTY_DENOMINATOR",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "addAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "addHolderDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "discountBps",
                  "type": "uint256"
                }
              ],
              "name": "addPoapDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "name": "addRoyalty",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                }
              ],
              "name": "balanceOf",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address[]",
                  "name": "accounts",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "ids",
                  "type": "uint256[]"
                }
              ],
              "name": "balanceOfBatch",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "quantity",
                  "type": "uint256"
                }
              ],
              "name": "buy",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256[]",
                  "name": "tokenIds",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "quantities",
                  "type": "uint256[]"
                }
              ],
              "name": "buyBatch",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "clearRoyalties",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                }
              ],
              "name": "getDiscountedPrice",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "finalPrice",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getHolderDiscounts",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "token",
                      "type": "address"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "uint256",
                      "name": "value",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct Swag1155.HolderDiscount[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getPoapDiscounts",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "eventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "discountBps",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct Swag1155.PoapDiscount[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getRedemptionStatus",
              "outputs": [
                {
                  "internalType": "enum Swag1155.RedemptionStatus",
                  "name": "",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                }
              ],
              "name": "getRoleAdmin",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getRoyalties",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "recipient",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "percentage",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct Swag1155.RoyaltyInfo[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getVariant",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "price",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxSupply",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minted",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct Swag1155.Variant",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "grantRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "hasRole",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "holderDiscounts",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "isApprovedForAll",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isSuperAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "listTokenIds",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "markFulfilled",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "poapDiscounts",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "discountBps",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "redeem",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "redemptions",
              "outputs": [
                {
                  "internalType": "enum Swag1155.RedemptionStatus",
                  "name": "",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "remaining",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "removeAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "index",
                  "type": "uint256"
                }
              ],
              "name": "removeHolderDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "index",
                  "type": "uint256"
                }
              ],
              "name": "removePoapDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "callerConfirmation",
                  "type": "address"
                }
              ],
              "name": "renounceRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "revokeRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "royaltyRecipients",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256[]",
                  "name": "ids",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "values",
                  "type": "uint256[]"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "name": "safeBatchTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "setApprovalForAll",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "newURI",
                  "type": "string"
                }
              ],
              "name": "setBaseURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newTreasury",
                  "type": "address"
                }
              ],
              "name": "setTreasury",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newUSDC",
                  "type": "address"
                }
              ],
              "name": "setUSDC",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setVariant",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "tokenURI",
                  "type": "string"
                }
              ],
              "name": "setVariantWithURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "totalRoyaltyBps",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "treasury",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "uri",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "usdc",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "variants",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "minted",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        }
      }
    },
    "ethereum": {
      "network": "ethereum",
      "chainId": 1,
      "contracts": {
        "ZKPassportNFT": {
          "address": "0x607003f188c49ed6e0553805734b9990393402df",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "symbol",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "initialOwner",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "ERC721IncorrectOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ERC721InsufficientApproval",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "approver",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidApprover",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidOperator",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "receiver",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidReceiver",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidSender",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ERC721NonexistentToken",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "OwnableInvalidOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "OwnableUnauthorizedAccount",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "approved",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "Approval",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "ApprovalForAll",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "_fromTokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "_toTokenId",
                  "type": "uint256"
                }
              ],
              "name": "BatchMetadataUpdate",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "_tokenId",
                  "type": "uint256"
                }
              ],
              "name": "MetadataUpdate",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "externalURL",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "useIPFS",
                  "type": "bool"
                }
              ],
              "name": "MetadataUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "NFTMinted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "previousOwner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
                }
              ],
              "name": "OwnershipTransferred",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "Transfer",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "userAddress",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "VerificationApproved",
              "type": "event"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "approve",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "userAddress",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "approveVerification",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "name": "approvedVerifications",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "userAddress",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "isApproved",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "balanceOf",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getApproved",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getTokenData",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "uniqueIdentifier",
                      "type": "string"
                    },
                    {
                      "internalType": "bool",
                      "name": "faceMatchPassed",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "personhoodVerified",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct ZKPassportNFT.TokenData",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                }
              ],
              "name": "hasNFT",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "hasNFTByAddress",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "isApprovedForAll",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                }
              ],
              "name": "mint",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "mintWithVerification",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "name",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftDescription",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftExternalURL",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftImageURI",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "owner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ownerOf",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "renounceOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "setApprovalForAll",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                }
              ],
              "name": "setDescription",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "externalURL",
                  "type": "string"
                }
              ],
              "name": "setExternalURL",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                }
              ],
              "name": "setImageURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "externalURL",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "useIPFS",
                  "type": "bool"
                }
              ],
              "name": "setMetadata",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bool",
                  "name": "useIPFS",
                  "type": "bool"
                }
              ],
              "name": "setUseIPFSImage",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "symbol",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "tokenURI",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "transferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
                }
              ],
              "name": "transferOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "useIPFSImage",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        },
        "FaucetManager": {
          "address": "0x2940e286b41d279b61e484b98a08498e355e4778",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_nftContract",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "initialAdmin",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "AccessControlBadConfirmation",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "neededRole",
                  "type": "bytes32"
                }
              ],
              "name": "AccessControlUnauthorizedAccount",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EnforcedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ExpectedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "AddressRemovedFromWhitelist",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "AddressWhitelisted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Claimed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "oldContract",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newContract",
                  "type": "address"
                }
              ],
              "name": "NFTContractUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "Paused",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Returned",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "previousAdminRole",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "newAdminRole",
                  "type": "bytes32"
                }
              ],
              "name": "RoleAdminChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleGranted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleRevoked",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "Unpaused",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "enum FaucetManager.VaultType",
                  "name": "vaultType",
                  "type": "uint8"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "whitelistEnabled",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "VaultCreated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "depositor",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "VaultDeposit",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "VaultGatingUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "VaultUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "VaultWithdraw",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "WhitelistUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "DEFAULT_ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "addAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address[]",
                  "name": "users",
                  "type": "address[]"
                }
              ],
              "name": "addBatchToWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "addToWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "canUserClaim",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "canClaim",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "reason",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "claim",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "claims",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "hasClaimed",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "claimedAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "claimedAt",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "hasReturned",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "returnedAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "returnedAt",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "enum FaucetManager.VaultType",
                  "name": "vaultType",
                  "type": "uint8"
                },
                {
                  "internalType": "bool",
                  "name": "whitelistEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "createVault",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "deposit",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getActiveVaults",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                },
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "balance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalReturned",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum FaucetManager.VaultType",
                      "name": "vaultType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "whitelistEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "zkPassportRequired",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "allowedToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.Vault[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getAllVaults",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "balance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalReturned",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum FaucetManager.VaultType",
                      "name": "vaultType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "whitelistEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "zkPassportRequired",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "allowedToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.Vault[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getClaimInfo",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "hasClaimed",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "hasReturned",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.ClaimInfo",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getReturnCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                }
              ],
              "name": "getRoleAdmin",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getUserClaims",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "vaultIds",
                  "type": "uint256[]"
                },
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "hasClaimed",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "hasReturned",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.ClaimInfo[]",
                  "name": "claimInfos",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "getVault",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "balance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalReturned",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum FaucetManager.VaultType",
                      "name": "vaultType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "whitelistEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "zkPassportRequired",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "allowedToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.Vault",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "grantRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "hasRole",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isSuperAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "isWhitelisted",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftContract",
              "outputs": [
                {
                  "internalType": "contract ZKPassportNFT",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "pause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "paused",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "removeAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address[]",
                  "name": "users",
                  "type": "address[]"
                }
              ],
              "name": "removeBatchFromWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "removeFromWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "callerConfirmation",
                  "type": "address"
                }
              ],
              "name": "renounceRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "returnCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "returnFunds",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "revokeRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newContract",
                  "type": "address"
                }
              ],
              "name": "setNFTContract",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "setWhitelistEnabled",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "unpause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "updateVault",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "updateVaultGating",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "vaultCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "vaults",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "balance",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "totalClaimed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "totalReturned",
                  "type": "uint256"
                },
                {
                  "internalType": "enum FaucetManager.VaultType",
                  "name": "vaultType",
                  "type": "uint8"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "whitelistEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "createdAt",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "whitelist",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "withdraw",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "stateMutability": "payable",
              "type": "receive"
            }
          ]
        },
        "Swag1155": {
          "address": "0xd9663db045850171850fd1298a2176b329a67928",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "baseURI",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "_usdc",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "initialAdmin",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_poap",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "AccessControlBadConfirmation",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "neededRole",
                  "type": "bytes32"
                }
              ],
              "name": "AccessControlUnauthorizedAccount",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "balance",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "needed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ERC1155InsufficientBalance",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "approver",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidApprover",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "idsLength",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "valuesLength",
                  "type": "uint256"
                }
              ],
              "name": "ERC1155InvalidArrayLength",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidOperator",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "receiver",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidReceiver",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidSender",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "ERC1155MissingApprovalForAll",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "AdminAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "AdminRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "ApprovalForAll",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "originalPrice",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "finalPrice",
                  "type": "uint256"
                }
              ],
              "name": "DiscountApplied",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "HolderDiscountAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "HolderDiscountRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "discountBps",
                  "type": "uint256"
                }
              ],
              "name": "PoapDiscountAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                }
              ],
              "name": "PoapDiscountRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "quantity",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "unitPrice",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "totalPrice",
                  "type": "uint256"
                }
              ],
              "name": "Purchased",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "tokenIds",
                  "type": "uint256[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "quantities",
                  "type": "uint256[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "totalPrice",
                  "type": "uint256"
                }
              ],
              "name": "PurchasedBatch",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "RedemptionFulfilled",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "RedemptionRequested",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "previousAdminRole",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "newAdminRole",
                  "type": "bytes32"
                }
              ],
              "name": "RoleAdminChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleGranted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleRevoked",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "RoyaltiesCleared",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "name": "RoyaltyAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "ids",
                  "type": "uint256[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "values",
                  "type": "uint256[]"
                }
              ],
              "name": "TransferBatch",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "TransferSingle",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newTreasury",
                  "type": "address"
                }
              ],
              "name": "TreasuryUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "value",
                  "type": "string"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                }
              ],
              "name": "URI",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newUSDC",
                  "type": "address"
                }
              ],
              "name": "USDCUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "uri",
                  "type": "string"
                }
              ],
              "name": "VariantURISet",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "VariantUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "DEFAULT_ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "POAP_CONTRACT",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "ROYALTY_DENOMINATOR",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "addAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "addHolderDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "discountBps",
                  "type": "uint256"
                }
              ],
              "name": "addPoapDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "name": "addRoyalty",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                }
              ],
              "name": "balanceOf",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address[]",
                  "name": "accounts",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "ids",
                  "type": "uint256[]"
                }
              ],
              "name": "balanceOfBatch",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "quantity",
                  "type": "uint256"
                }
              ],
              "name": "buy",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256[]",
                  "name": "tokenIds",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "quantities",
                  "type": "uint256[]"
                }
              ],
              "name": "buyBatch",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "clearRoyalties",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                }
              ],
              "name": "getDiscountedPrice",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "finalPrice",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getHolderDiscounts",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "token",
                      "type": "address"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "uint256",
                      "name": "value",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct Swag1155.HolderDiscount[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getPoapDiscounts",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "eventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "discountBps",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct Swag1155.PoapDiscount[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getRedemptionStatus",
              "outputs": [
                {
                  "internalType": "enum Swag1155.RedemptionStatus",
                  "name": "",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                }
              ],
              "name": "getRoleAdmin",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getRoyalties",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "recipient",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "percentage",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct Swag1155.RoyaltyInfo[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getVariant",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "price",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxSupply",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minted",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct Swag1155.Variant",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "grantRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "hasRole",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "holderDiscounts",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "isApprovedForAll",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isSuperAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "listTokenIds",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "markFulfilled",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "poapDiscounts",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "discountBps",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "redeem",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "redemptions",
              "outputs": [
                {
                  "internalType": "enum Swag1155.RedemptionStatus",
                  "name": "",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "remaining",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "removeAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "index",
                  "type": "uint256"
                }
              ],
              "name": "removeHolderDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "index",
                  "type": "uint256"
                }
              ],
              "name": "removePoapDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "callerConfirmation",
                  "type": "address"
                }
              ],
              "name": "renounceRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "revokeRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "royaltyRecipients",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256[]",
                  "name": "ids",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "values",
                  "type": "uint256[]"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "name": "safeBatchTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "setApprovalForAll",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "newURI",
                  "type": "string"
                }
              ],
              "name": "setBaseURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newTreasury",
                  "type": "address"
                }
              ],
              "name": "setTreasury",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newUSDC",
                  "type": "address"
                }
              ],
              "name": "setUSDC",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setVariant",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "tokenURI",
                  "type": "string"
                }
              ],
              "name": "setVariantWithURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "totalRoyaltyBps",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "treasury",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "uri",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "usdc",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "variants",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "minted",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        }
      }
    },
    "unichain": {
      "network": "unichain",
      "chainId": 130,
      "contracts": {
        "ZKPassportNFT": {
          "address": "0x0499924492348159aa281385ace43539689e158b",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "symbol",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "initialOwner",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "ERC721IncorrectOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ERC721InsufficientApproval",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "approver",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidApprover",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidOperator",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "receiver",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidReceiver",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidSender",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ERC721NonexistentToken",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "OwnableInvalidOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "OwnableUnauthorizedAccount",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "approved",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "Approval",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "ApprovalForAll",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "_fromTokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "_toTokenId",
                  "type": "uint256"
                }
              ],
              "name": "BatchMetadataUpdate",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "_tokenId",
                  "type": "uint256"
                }
              ],
              "name": "MetadataUpdate",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "externalURL",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "useIPFS",
                  "type": "bool"
                }
              ],
              "name": "MetadataUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "NFTMinted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "previousOwner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
                }
              ],
              "name": "OwnershipTransferred",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "Transfer",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "userAddress",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "VerificationApproved",
              "type": "event"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "approve",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "userAddress",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "approveVerification",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "name": "approvedVerifications",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "userAddress",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "isApproved",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "balanceOf",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getApproved",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getTokenData",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "uniqueIdentifier",
                      "type": "string"
                    },
                    {
                      "internalType": "bool",
                      "name": "faceMatchPassed",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "personhoodVerified",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct ZKPassportNFT.TokenData",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                }
              ],
              "name": "hasNFT",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "hasNFTByAddress",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "isApprovedForAll",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                }
              ],
              "name": "mint",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "mintWithVerification",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "name",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftDescription",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftExternalURL",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftImageURI",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "owner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ownerOf",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "renounceOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "setApprovalForAll",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                }
              ],
              "name": "setDescription",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "externalURL",
                  "type": "string"
                }
              ],
              "name": "setExternalURL",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                }
              ],
              "name": "setImageURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "externalURL",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "useIPFS",
                  "type": "bool"
                }
              ],
              "name": "setMetadata",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bool",
                  "name": "useIPFS",
                  "type": "bool"
                }
              ],
              "name": "setUseIPFSImage",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "symbol",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "tokenURI",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "transferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
                }
              ],
              "name": "transferOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "useIPFSImage",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        },
        "FaucetManager": {
          "address": "0xf32e10560673668ee849c44596d74502493c7fb1",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_nftContract",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "initialAdmin",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "AccessControlBadConfirmation",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "neededRole",
                  "type": "bytes32"
                }
              ],
              "name": "AccessControlUnauthorizedAccount",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EnforcedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ExpectedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "AddressRemovedFromWhitelist",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "AddressWhitelisted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Claimed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "oldContract",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newContract",
                  "type": "address"
                }
              ],
              "name": "NFTContractUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "Paused",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Returned",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "previousAdminRole",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "newAdminRole",
                  "type": "bytes32"
                }
              ],
              "name": "RoleAdminChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleGranted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleRevoked",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "Unpaused",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "enum FaucetManager.VaultType",
                  "name": "vaultType",
                  "type": "uint8"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "whitelistEnabled",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "VaultCreated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "depositor",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "VaultDeposit",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "VaultGatingUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "VaultUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "VaultWithdraw",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "WhitelistUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "DEFAULT_ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "addAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address[]",
                  "name": "users",
                  "type": "address[]"
                }
              ],
              "name": "addBatchToWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "addToWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "canUserClaim",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "canClaim",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "reason",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "claim",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "claims",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "hasClaimed",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "claimedAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "claimedAt",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "hasReturned",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "returnedAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "returnedAt",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "enum FaucetManager.VaultType",
                  "name": "vaultType",
                  "type": "uint8"
                },
                {
                  "internalType": "bool",
                  "name": "whitelistEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "createVault",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "deposit",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getActiveVaults",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                },
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "balance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalReturned",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum FaucetManager.VaultType",
                      "name": "vaultType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "whitelistEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "zkPassportRequired",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "allowedToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.Vault[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getAllVaults",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "balance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalReturned",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum FaucetManager.VaultType",
                      "name": "vaultType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "whitelistEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "zkPassportRequired",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "allowedToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.Vault[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getClaimInfo",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "hasClaimed",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "hasReturned",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.ClaimInfo",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getReturnCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                }
              ],
              "name": "getRoleAdmin",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getUserClaims",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "vaultIds",
                  "type": "uint256[]"
                },
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "hasClaimed",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "hasReturned",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.ClaimInfo[]",
                  "name": "claimInfos",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "getVault",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "balance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalReturned",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum FaucetManager.VaultType",
                      "name": "vaultType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "whitelistEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "zkPassportRequired",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "allowedToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.Vault",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "grantRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "hasRole",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isSuperAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "isWhitelisted",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftContract",
              "outputs": [
                {
                  "internalType": "contract ZKPassportNFT",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "pause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "paused",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "removeAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address[]",
                  "name": "users",
                  "type": "address[]"
                }
              ],
              "name": "removeBatchFromWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "removeFromWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "callerConfirmation",
                  "type": "address"
                }
              ],
              "name": "renounceRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "returnCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "returnFunds",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "revokeRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newContract",
                  "type": "address"
                }
              ],
              "name": "setNFTContract",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "setWhitelistEnabled",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "unpause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "updateVault",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "updateVaultGating",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "vaultCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "vaults",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "balance",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "totalClaimed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "totalReturned",
                  "type": "uint256"
                },
                {
                  "internalType": "enum FaucetManager.VaultType",
                  "name": "vaultType",
                  "type": "uint8"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "whitelistEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "createdAt",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "whitelist",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "withdraw",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "stateMutability": "payable",
              "type": "receive"
            }
          ]
        },
        "Swag1155": {
          "address": "0xb76a448715e3986a3a060e79598e9ffb78e792f6",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "baseURI",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "_usdc",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "initialAdmin",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_poap",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "AccessControlBadConfirmation",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "neededRole",
                  "type": "bytes32"
                }
              ],
              "name": "AccessControlUnauthorizedAccount",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "balance",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "needed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ERC1155InsufficientBalance",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "approver",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidApprover",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "idsLength",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "valuesLength",
                  "type": "uint256"
                }
              ],
              "name": "ERC1155InvalidArrayLength",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidOperator",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "receiver",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidReceiver",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidSender",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "ERC1155MissingApprovalForAll",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "AdminAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "AdminRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "ApprovalForAll",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "originalPrice",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "finalPrice",
                  "type": "uint256"
                }
              ],
              "name": "DiscountApplied",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "HolderDiscountAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "HolderDiscountRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "discountBps",
                  "type": "uint256"
                }
              ],
              "name": "PoapDiscountAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                }
              ],
              "name": "PoapDiscountRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "quantity",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "unitPrice",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "totalPrice",
                  "type": "uint256"
                }
              ],
              "name": "Purchased",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "tokenIds",
                  "type": "uint256[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "quantities",
                  "type": "uint256[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "totalPrice",
                  "type": "uint256"
                }
              ],
              "name": "PurchasedBatch",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "RedemptionFulfilled",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "RedemptionRequested",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "previousAdminRole",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "newAdminRole",
                  "type": "bytes32"
                }
              ],
              "name": "RoleAdminChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleGranted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleRevoked",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "RoyaltiesCleared",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "name": "RoyaltyAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "ids",
                  "type": "uint256[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "values",
                  "type": "uint256[]"
                }
              ],
              "name": "TransferBatch",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "TransferSingle",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newTreasury",
                  "type": "address"
                }
              ],
              "name": "TreasuryUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "value",
                  "type": "string"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                }
              ],
              "name": "URI",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newUSDC",
                  "type": "address"
                }
              ],
              "name": "USDCUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "uri",
                  "type": "string"
                }
              ],
              "name": "VariantURISet",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "VariantUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "DEFAULT_ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "POAP_CONTRACT",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "ROYALTY_DENOMINATOR",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "addAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "addHolderDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "discountBps",
                  "type": "uint256"
                }
              ],
              "name": "addPoapDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "name": "addRoyalty",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                }
              ],
              "name": "balanceOf",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address[]",
                  "name": "accounts",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "ids",
                  "type": "uint256[]"
                }
              ],
              "name": "balanceOfBatch",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "quantity",
                  "type": "uint256"
                }
              ],
              "name": "buy",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256[]",
                  "name": "tokenIds",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "quantities",
                  "type": "uint256[]"
                }
              ],
              "name": "buyBatch",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "clearRoyalties",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                }
              ],
              "name": "getDiscountedPrice",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "finalPrice",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getHolderDiscounts",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "token",
                      "type": "address"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "uint256",
                      "name": "value",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct Swag1155.HolderDiscount[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getPoapDiscounts",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "eventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "discountBps",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct Swag1155.PoapDiscount[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getRedemptionStatus",
              "outputs": [
                {
                  "internalType": "enum Swag1155.RedemptionStatus",
                  "name": "",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                }
              ],
              "name": "getRoleAdmin",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getRoyalties",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "recipient",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "percentage",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct Swag1155.RoyaltyInfo[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getVariant",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "price",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxSupply",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minted",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct Swag1155.Variant",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "grantRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "hasRole",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "holderDiscounts",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "isApprovedForAll",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isSuperAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "listTokenIds",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "markFulfilled",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "poapDiscounts",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "discountBps",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "redeem",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "redemptions",
              "outputs": [
                {
                  "internalType": "enum Swag1155.RedemptionStatus",
                  "name": "",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "remaining",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "removeAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "index",
                  "type": "uint256"
                }
              ],
              "name": "removeHolderDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "index",
                  "type": "uint256"
                }
              ],
              "name": "removePoapDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "callerConfirmation",
                  "type": "address"
                }
              ],
              "name": "renounceRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "revokeRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "royaltyRecipients",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256[]",
                  "name": "ids",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "values",
                  "type": "uint256[]"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "name": "safeBatchTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "setApprovalForAll",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "newURI",
                  "type": "string"
                }
              ],
              "name": "setBaseURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newTreasury",
                  "type": "address"
                }
              ],
              "name": "setTreasury",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newUSDC",
                  "type": "address"
                }
              ],
              "name": "setUSDC",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setVariant",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "tokenURI",
                  "type": "string"
                }
              ],
              "name": "setVariantWithURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "totalRoyaltyBps",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "treasury",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "uri",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "usdc",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "variants",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "minted",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        }
      }
    },
    "optimism": {
      "network": "optimism",
      "chainId": 10,
      "contracts": {
        "ZKPassportNFT": {
          "address": "0x25b43ce10ffd04cb90123d7582e6b5100b27f9cb",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "symbol",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "initialOwner",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "ERC721IncorrectOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ERC721InsufficientApproval",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "approver",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidApprover",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidOperator",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "receiver",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidReceiver",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "ERC721InvalidSender",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ERC721NonexistentToken",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "OwnableInvalidOwner",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "OwnableUnauthorizedAccount",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "approved",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "Approval",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "ApprovalForAll",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "_fromTokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "_toTokenId",
                  "type": "uint256"
                }
              ],
              "name": "BatchMetadataUpdate",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "_tokenId",
                  "type": "uint256"
                }
              ],
              "name": "MetadataUpdate",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "externalURL",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "useIPFS",
                  "type": "bool"
                }
              ],
              "name": "MetadataUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "NFTMinted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "previousOwner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
                }
              ],
              "name": "OwnershipTransferred",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "Transfer",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "userAddress",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "VerificationApproved",
              "type": "event"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "approve",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "userAddress",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "approveVerification",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "name": "approvedVerifications",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "userAddress",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "isApproved",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "balanceOf",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getApproved",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getTokenData",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "uniqueIdentifier",
                      "type": "string"
                    },
                    {
                      "internalType": "bool",
                      "name": "faceMatchPassed",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "personhoodVerified",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct ZKPassportNFT.TokenData",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                }
              ],
              "name": "hasNFT",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "hasNFTByAddress",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "isApprovedForAll",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                }
              ],
              "name": "mint",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "uniqueIdentifier",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "faceMatchPassed",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "personhoodVerified",
                  "type": "bool"
                }
              ],
              "name": "mintWithVerification",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "name",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftDescription",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftExternalURL",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftImageURI",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "owner",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ownerOf",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "renounceOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "setApprovalForAll",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                }
              ],
              "name": "setDescription",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "externalURL",
                  "type": "string"
                }
              ],
              "name": "setExternalURL",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                }
              ],
              "name": "setImageURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "imageURI",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "externalURL",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "useIPFS",
                  "type": "bool"
                }
              ],
              "name": "setMetadata",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bool",
                  "name": "useIPFS",
                  "type": "bool"
                }
              ],
              "name": "setUseIPFSImage",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "symbol",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "tokenURI",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "transferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newOwner",
                  "type": "address"
                }
              ],
              "name": "transferOwnership",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "useIPFSImage",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        },
        "FaucetManager": {
          "address": "0x76235436cbd3f2ff12cc3610f2643654211efb3d",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "_nftContract",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "initialAdmin",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "AccessControlBadConfirmation",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "neededRole",
                  "type": "bytes32"
                }
              ],
              "name": "AccessControlUnauthorizedAccount",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EnforcedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ExpectedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "AddressRemovedFromWhitelist",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "AddressWhitelisted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Claimed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "oldContract",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newContract",
                  "type": "address"
                }
              ],
              "name": "NFTContractUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "Paused",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Returned",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "previousAdminRole",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "newAdminRole",
                  "type": "bytes32"
                }
              ],
              "name": "RoleAdminChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleGranted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleRevoked",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "Unpaused",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "enum FaucetManager.VaultType",
                  "name": "vaultType",
                  "type": "uint8"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "whitelistEnabled",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "VaultCreated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "depositor",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "VaultDeposit",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "VaultGatingUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "VaultUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "VaultWithdraw",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "WhitelistUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "DEFAULT_ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "addAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address[]",
                  "name": "users",
                  "type": "address[]"
                }
              ],
              "name": "addBatchToWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "addToWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "canUserClaim",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "canClaim",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "reason",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "claim",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "claims",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "hasClaimed",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "claimedAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "claimedAt",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "hasReturned",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "returnedAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "returnedAt",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "enum FaucetManager.VaultType",
                  "name": "vaultType",
                  "type": "uint8"
                },
                {
                  "internalType": "bool",
                  "name": "whitelistEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "createVault",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "deposit",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getActiveVaults",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                },
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "balance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalReturned",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum FaucetManager.VaultType",
                      "name": "vaultType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "whitelistEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "zkPassportRequired",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "allowedToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.Vault[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getAllVaults",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "balance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalReturned",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum FaucetManager.VaultType",
                      "name": "vaultType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "whitelistEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "zkPassportRequired",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "allowedToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.Vault[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getClaimInfo",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "hasClaimed",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "hasReturned",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.ClaimInfo",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getReturnCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                }
              ],
              "name": "getRoleAdmin",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "getUserClaims",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "vaultIds",
                  "type": "uint256[]"
                },
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "hasClaimed",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimedAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "hasReturned",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "returnedAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.ClaimInfo[]",
                  "name": "claimInfos",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "getVault",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "description",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "claimAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "balance",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalClaimed",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalReturned",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum FaucetManager.VaultType",
                      "name": "vaultType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "whitelistEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "zkPassportRequired",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "allowedToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct FaucetManager.Vault",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "grantRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "hasRole",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isSuperAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "isWhitelisted",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "nftContract",
              "outputs": [
                {
                  "internalType": "contract ZKPassportNFT",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "pause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "paused",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "removeAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address[]",
                  "name": "users",
                  "type": "address[]"
                }
              ],
              "name": "removeBatchFromWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                }
              ],
              "name": "removeFromWhitelist",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "callerConfirmation",
                  "type": "address"
                }
              ],
              "name": "renounceRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "returnCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                }
              ],
              "name": "returnFunds",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "revokeRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newContract",
                  "type": "address"
                }
              ],
              "name": "setNFTContract",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "setWhitelistEnabled",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "unpause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "updateVault",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                }
              ],
              "name": "updateVaultGating",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "vaultCount",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "vaults",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "description",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "claimAmount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "balance",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "totalClaimed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "totalReturned",
                  "type": "uint256"
                },
                {
                  "internalType": "enum FaucetManager.VaultType",
                  "name": "vaultType",
                  "type": "uint8"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "whitelistEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "zkPassportRequired",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "allowedToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "createdAt",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "whitelist",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "vaultId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "withdraw",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "stateMutability": "payable",
              "type": "receive"
            }
          ]
        },
        "Swag1155": {
          "address": "0x9df46e1c221f8b067343f9b760f5cb2c4757fe2d",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "baseURI",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "_usdc",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "initialAdmin",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_poap",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "constructor"
            },
            {
              "inputs": [],
              "name": "AccessControlBadConfirmation",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "bytes32",
                  "name": "neededRole",
                  "type": "bytes32"
                }
              ],
              "name": "AccessControlUnauthorizedAccount",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "balance",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "needed",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "ERC1155InsufficientBalance",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "approver",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidApprover",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "idsLength",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "valuesLength",
                  "type": "uint256"
                }
              ],
              "name": "ERC1155InvalidArrayLength",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidOperator",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "receiver",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidReceiver",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "ERC1155InvalidSender",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "ERC1155MissingApprovalForAll",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "AdminAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "AdminRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "ApprovalForAll",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "originalPrice",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "finalPrice",
                  "type": "uint256"
                }
              ],
              "name": "DiscountApplied",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "HolderDiscountAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "HolderDiscountRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "discountBps",
                  "type": "uint256"
                }
              ],
              "name": "PoapDiscountAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                }
              ],
              "name": "PoapDiscountRemoved",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "quantity",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "unitPrice",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "totalPrice",
                  "type": "uint256"
                }
              ],
              "name": "Purchased",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "tokenIds",
                  "type": "uint256[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "quantities",
                  "type": "uint256[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "totalPrice",
                  "type": "uint256"
                }
              ],
              "name": "PurchasedBatch",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "RedemptionFulfilled",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "RedemptionRequested",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "previousAdminRole",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "newAdminRole",
                  "type": "bytes32"
                }
              ],
              "name": "RoleAdminChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleGranted",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "sender",
                  "type": "address"
                }
              ],
              "name": "RoleRevoked",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "RoyaltiesCleared",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "name": "RoyaltyAdded",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "ids",
                  "type": "uint256[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256[]",
                  "name": "values",
                  "type": "uint256[]"
                }
              ],
              "name": "TransferBatch",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "TransferSingle",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newTreasury",
                  "type": "address"
                }
              ],
              "name": "TreasuryUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "value",
                  "type": "string"
                },
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                }
              ],
              "name": "URI",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newUSDC",
                  "type": "address"
                }
              ],
              "name": "USDCUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "uri",
                  "type": "string"
                }
              ],
              "name": "VariantURISet",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "VariantUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "DEFAULT_ADMIN_ROLE",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "POAP_CONTRACT",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "ROYALTY_DENOMINATOR",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "addAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                }
              ],
              "name": "addHolderDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "discountBps",
                  "type": "uint256"
                }
              ],
              "name": "addPoapDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "name": "addRoyalty",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                }
              ],
              "name": "balanceOf",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address[]",
                  "name": "accounts",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "ids",
                  "type": "uint256[]"
                }
              ],
              "name": "balanceOfBatch",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "quantity",
                  "type": "uint256"
                }
              ],
              "name": "buy",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256[]",
                  "name": "tokenIds",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "quantities",
                  "type": "uint256[]"
                }
              ],
              "name": "buyBatch",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "clearRoyalties",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "buyer",
                  "type": "address"
                }
              ],
              "name": "getDiscountedPrice",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "finalPrice",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getHolderDiscounts",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "token",
                      "type": "address"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    },
                    {
                      "internalType": "uint256",
                      "name": "value",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct Swag1155.HolderDiscount[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getPoapDiscounts",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "eventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "discountBps",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct Swag1155.PoapDiscount[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getRedemptionStatus",
              "outputs": [
                {
                  "internalType": "enum Swag1155.RedemptionStatus",
                  "name": "",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                }
              ],
              "name": "getRoleAdmin",
              "outputs": [
                {
                  "internalType": "bytes32",
                  "name": "",
                  "type": "bytes32"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getRoyalties",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "recipient",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "percentage",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct Swag1155.RoyaltyInfo[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "getVariant",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "price",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "maxSupply",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minted",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct Swag1155.Variant",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "grantRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "hasRole",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "holderDiscounts",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                }
              ],
              "name": "isApprovedForAll",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "isSuperAdmin",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "listTokenIds",
              "outputs": [
                {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "markFulfilled",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "poapDiscounts",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "eventId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "discountBps",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "redeem",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "redemptions",
              "outputs": [
                {
                  "internalType": "enum Swag1155.RedemptionStatus",
                  "name": "",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "remaining",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                }
              ],
              "name": "removeAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "index",
                  "type": "uint256"
                }
              ],
              "name": "removeHolderDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "index",
                  "type": "uint256"
                }
              ],
              "name": "removePoapDiscount",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "callerConfirmation",
                  "type": "address"
                }
              ],
              "name": "renounceRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes32",
                  "name": "role",
                  "type": "bytes32"
                },
                {
                  "internalType": "address",
                  "name": "account",
                  "type": "address"
                }
              ],
              "name": "revokeRole",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "royaltyRecipients",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "recipient",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "percentage",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256[]",
                  "name": "ids",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "values",
                  "type": "uint256[]"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "name": "safeBatchTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "from",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "to",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "id",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "value",
                  "type": "uint256"
                },
                {
                  "internalType": "bytes",
                  "name": "data",
                  "type": "bytes"
                }
              ],
              "name": "safeTransferFrom",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "operator",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "approved",
                  "type": "bool"
                }
              ],
              "name": "setApprovalForAll",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "newURI",
                  "type": "string"
                }
              ],
              "name": "setBaseURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newTreasury",
                  "type": "address"
                }
              ],
              "name": "setTreasury",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newUSDC",
                  "type": "address"
                }
              ],
              "name": "setUSDC",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setVariant",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "string",
                  "name": "tokenURI",
                  "type": "string"
                }
              ],
              "name": "setVariantWithURI",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bytes4",
                  "name": "interfaceId",
                  "type": "bytes4"
                }
              ],
              "name": "supportsInterface",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "totalRoyaltyBps",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "treasury",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "uri",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "usdc",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "variants",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "maxSupply",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "minted",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        }
      }
    }
  },
  "defaultNetwork": "base"
} as const;

export const ADDRESSES = {
  "base": {
    "chainId": 8453,
    "addresses": {
      "ZKPassportNFT": "0x458eb490bf5f56b6ada8605c56bcef3510d83ec8",
      "FaucetManager": "0xbd7d12722008a6c2f89e3906a964cc2290131a92",
      "Swag1155": "0xd4218995da2e92323d33a6e38adc8ef3a671b456"
    }
  },
  "ethereum": {
    "chainId": 1,
    "addresses": {
      "ZKPassportNFT": "0x607003f188c49ed6e0553805734b9990393402df",
      "FaucetManager": "0x2940e286b41d279b61e484b98a08498e355e4778",
      "Swag1155": "0xd9663db045850171850fd1298a2176b329a67928"
    }
  },
  "unichain": {
    "chainId": 130,
    "addresses": {
      "ZKPassportNFT": "0x0499924492348159aa281385ace43539689e158b",
      "FaucetManager": "0xf32e10560673668ee849c44596d74502493c7fb1",
      "Swag1155": "0xb76a448715e3986a3a060e79598e9ffb78e792f6"
    }
  },
  "optimism": {
    "chainId": 10,
    "addresses": {
      "ZKPassportNFT": "0x25b43ce10ffd04cb90123d7582e6b5100b27f9cb",
      "FaucetManager": "0x76235436cbd3f2ff12cc3610f2643654211efb3d",
      "Swag1155": "0x9df46e1c221f8b067343f9b760f5cb2c4757fe2d"
    }
  }
} as const;

// Helper to get addresses for a specific network
export function getAddresses(network: keyof typeof ADDRESSES) {
  return ADDRESSES[network];
}

// Helper to get contract config for a specific network
export function getContracts(network: keyof typeof CONTRACTS.networks) {
  return CONTRACTS.networks[network];
}

// Default network
export const DEFAULT_NETWORK = "base" as const;
