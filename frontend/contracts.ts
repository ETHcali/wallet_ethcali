// Auto-generated multi-network contract addresses and types
// Generated: 2026-01-21T23:49:27.174Z
export const CONTRACTS = {
  "networks": {
    "base": {
      "network": "base",
      "chainId": 8453,
      "contracts": {
        "ZKPassportNFT": {
          "address": "0x9f0da2f66a0aa01bf4469a257f75fab088130b40",
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
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getNFTDataByOwner",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
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
                  "name": "tokenDataResult",
                  "type": "tuple"
                },
                {
                  "internalType": "string",
                  "name": "tokenURIResult",
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
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getTokenIdByOwner",
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
              "name": "mint",
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
          "address": "0xbd532043af9f2e8090ad9b1fa14e45a5aaaef102",
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
          "address": "0x9c2944f38156f6dfc922a825eba727a38895958e",
          "abi": [
            {
              "inputs": [
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
                      "internalType": "string",
                      "name": "imageUrl",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "website",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "paymentToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "pricePerUnit",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalSupply",
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
                    },
                    {
                      "internalType": "string",
                      "name": "gender",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "color",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "style",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct Swag1155.DesignInfo",
                  "name": "_designInfo",
                  "type": "tuple"
                },
                {
                  "internalType": "address",
                  "name": "_treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_initialAdmin",
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
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "DesignActiveStatusChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "smartContractEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "smartContractAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "smartContractDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "poapEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapEventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    }
                  ],
                  "indexed": false,
                  "internalType": "struct Swag1155.DiscountConfig",
                  "name": "config",
                  "type": "tuple"
                }
              ],
              "name": "DesignDiscountConfigUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
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
                      "internalType": "string",
                      "name": "imageUrl",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "website",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "paymentToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "pricePerUnit",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalSupply",
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
                    },
                    {
                      "internalType": "string",
                      "name": "gender",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "color",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "style",
                      "type": "string"
                    }
                  ],
                  "indexed": false,
                  "internalType": "struct Swag1155.DesignInfo",
                  "name": "info",
                  "type": "tuple"
                }
              ],
              "name": "DesignInfoUpdated",
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
                  "internalType": "string",
                  "name": "size",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "hadDiscount",
                  "type": "bool"
                }
              ],
              "name": "DesignMinted",
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
                  "internalType": "string[]",
                  "name": "sizes",
                  "type": "string[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "totalPrice",
                  "type": "uint256"
                }
              ],
              "name": "DesignMintedBatch",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newToken",
                  "type": "address"
                }
              ],
              "name": "DesignPaymentTokenUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "newPrice",
                  "type": "uint256"
                }
              ],
              "name": "DesignPriceUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "newSupply",
                  "type": "uint256"
                }
              ],
              "name": "DesignTotalSupplyUpdated",
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
              "name": "PhysicalRedemptionFulfilled",
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
              "name": "PhysicalRedemptionRequested",
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
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "uri",
                  "type": "string"
                }
              ],
              "name": "TokenURISet",
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
              "inputs": [],
              "name": "designInfo",
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
                  "internalType": "string",
                  "name": "imageUrl",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "website",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "paymentToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "pricePerUnit",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "totalSupply",
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
                },
                {
                  "internalType": "string",
                  "name": "gender",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "color",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "style",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "discountConfig",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "smartContractEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "smartContractAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "smartContractDiscount",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "poapEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "poapEventId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "poapDiscount",
                  "type": "uint256"
                },
                {
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getDesignDiscountConfig",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "smartContractEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "smartContractAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "smartContractDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "poapEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapEventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    }
                  ],
                  "internalType": "struct Swag1155.DiscountConfig",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getDesignInfo",
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
                      "internalType": "string",
                      "name": "imageUrl",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "website",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "paymentToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "pricePerUnit",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalSupply",
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
                    },
                    {
                      "internalType": "string",
                      "name": "gender",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "color",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "style",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct Swag1155.DesignInfo",
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
                },
                {
                  "internalType": "bool",
                  "name": "hasPoap",
                  "type": "bool"
                }
              ],
              "name": "getDesignPriceWithDiscounts",
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
              "name": "getDesignRemainingSupply",
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
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getDesignTokenRedemptionStatus",
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
              "name": "getDesignTokenSize",
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
              "name": "getDesignTokenTraits",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "size",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "gender",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "color",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "style",
                  "type": "string"
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
              "name": "markRedemptionFulfilled",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "size",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "hasPoapDiscount",
                  "type": "bool"
                }
              ],
              "name": "mintDesign",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string[]",
                  "name": "sizes",
                  "type": "string[]"
                },
                {
                  "internalType": "bool",
                  "name": "hasPoapDiscount",
                  "type": "bool"
                }
              ],
              "name": "mintDesignBatch",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "requestPhysicalRedemption",
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
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setDesignActive",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "smartContractEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "smartContractAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "smartContractDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "poapEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapEventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    }
                  ],
                  "internalType": "struct Swag1155.DiscountConfig",
                  "name": "config",
                  "type": "tuple"
                }
              ],
              "name": "setDesignDiscountConfig",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
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
                      "internalType": "string",
                      "name": "imageUrl",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "website",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "paymentToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "pricePerUnit",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalSupply",
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
                    },
                    {
                      "internalType": "string",
                      "name": "gender",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "color",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "style",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct Swag1155.DesignInfo",
                  "name": "info",
                  "type": "tuple"
                }
              ],
              "name": "setDesignInfo",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "setDesignPaymentToken",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "newPrice",
                  "type": "uint256"
                }
              ],
              "name": "setDesignPrice",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "newSupply",
                  "type": "uint256"
                }
              ],
              "name": "setDesignTotalSupply",
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
                  "internalType": "string",
                  "name": "tokenURI",
                  "type": "string"
                }
              ],
              "name": "setTokenURI",
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
          "address": "0x94b9f649f8825d5d797e37d04dfc66d612750b10",
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
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getNFTDataByOwner",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
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
                  "name": "tokenDataResult",
                  "type": "tuple"
                },
                {
                  "internalType": "string",
                  "name": "tokenURIResult",
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
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getTokenIdByOwner",
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
              "name": "mint",
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
          "address": "0xb24295ffc0bd22b0b173b73a0ff5b42564986fd1",
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
          "address": "0xeb27e63799ec91fb81617629b7f98d26af3f9686",
          "abi": [
            {
              "inputs": [
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
                      "internalType": "string",
                      "name": "imageUrl",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "website",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "paymentToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "pricePerUnit",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalSupply",
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
                    },
                    {
                      "internalType": "string",
                      "name": "gender",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "color",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "style",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct Swag1155.DesignInfo",
                  "name": "_designInfo",
                  "type": "tuple"
                },
                {
                  "internalType": "address",
                  "name": "_treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_initialAdmin",
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
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "DesignActiveStatusChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "smartContractEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "smartContractAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "smartContractDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "poapEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapEventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    }
                  ],
                  "indexed": false,
                  "internalType": "struct Swag1155.DiscountConfig",
                  "name": "config",
                  "type": "tuple"
                }
              ],
              "name": "DesignDiscountConfigUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
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
                      "internalType": "string",
                      "name": "imageUrl",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "website",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "paymentToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "pricePerUnit",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalSupply",
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
                    },
                    {
                      "internalType": "string",
                      "name": "gender",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "color",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "style",
                      "type": "string"
                    }
                  ],
                  "indexed": false,
                  "internalType": "struct Swag1155.DesignInfo",
                  "name": "info",
                  "type": "tuple"
                }
              ],
              "name": "DesignInfoUpdated",
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
                  "internalType": "string",
                  "name": "size",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "hadDiscount",
                  "type": "bool"
                }
              ],
              "name": "DesignMinted",
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
                  "internalType": "string[]",
                  "name": "sizes",
                  "type": "string[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "totalPrice",
                  "type": "uint256"
                }
              ],
              "name": "DesignMintedBatch",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newToken",
                  "type": "address"
                }
              ],
              "name": "DesignPaymentTokenUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "newPrice",
                  "type": "uint256"
                }
              ],
              "name": "DesignPriceUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "newSupply",
                  "type": "uint256"
                }
              ],
              "name": "DesignTotalSupplyUpdated",
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
              "name": "PhysicalRedemptionFulfilled",
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
              "name": "PhysicalRedemptionRequested",
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
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "uri",
                  "type": "string"
                }
              ],
              "name": "TokenURISet",
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
              "inputs": [],
              "name": "designInfo",
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
                  "internalType": "string",
                  "name": "imageUrl",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "website",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "paymentToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "pricePerUnit",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "totalSupply",
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
                },
                {
                  "internalType": "string",
                  "name": "gender",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "color",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "style",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "discountConfig",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "smartContractEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "smartContractAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "smartContractDiscount",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "poapEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "poapEventId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "poapDiscount",
                  "type": "uint256"
                },
                {
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getDesignDiscountConfig",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "smartContractEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "smartContractAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "smartContractDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "poapEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapEventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    }
                  ],
                  "internalType": "struct Swag1155.DiscountConfig",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getDesignInfo",
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
                      "internalType": "string",
                      "name": "imageUrl",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "website",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "paymentToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "pricePerUnit",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalSupply",
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
                    },
                    {
                      "internalType": "string",
                      "name": "gender",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "color",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "style",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct Swag1155.DesignInfo",
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
                },
                {
                  "internalType": "bool",
                  "name": "hasPoap",
                  "type": "bool"
                }
              ],
              "name": "getDesignPriceWithDiscounts",
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
              "name": "getDesignRemainingSupply",
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
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getDesignTokenRedemptionStatus",
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
              "name": "getDesignTokenSize",
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
              "name": "getDesignTokenTraits",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "size",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "gender",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "color",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "style",
                  "type": "string"
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
              "name": "markRedemptionFulfilled",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "size",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "hasPoapDiscount",
                  "type": "bool"
                }
              ],
              "name": "mintDesign",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string[]",
                  "name": "sizes",
                  "type": "string[]"
                },
                {
                  "internalType": "bool",
                  "name": "hasPoapDiscount",
                  "type": "bool"
                }
              ],
              "name": "mintDesignBatch",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "requestPhysicalRedemption",
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
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setDesignActive",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "smartContractEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "smartContractAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "smartContractDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "poapEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapEventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    }
                  ],
                  "internalType": "struct Swag1155.DiscountConfig",
                  "name": "config",
                  "type": "tuple"
                }
              ],
              "name": "setDesignDiscountConfig",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
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
                      "internalType": "string",
                      "name": "imageUrl",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "website",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "paymentToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "pricePerUnit",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalSupply",
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
                    },
                    {
                      "internalType": "string",
                      "name": "gender",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "color",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "style",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct Swag1155.DesignInfo",
                  "name": "info",
                  "type": "tuple"
                }
              ],
              "name": "setDesignInfo",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "setDesignPaymentToken",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "newPrice",
                  "type": "uint256"
                }
              ],
              "name": "setDesignPrice",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "newSupply",
                  "type": "uint256"
                }
              ],
              "name": "setDesignTotalSupply",
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
                  "internalType": "string",
                  "name": "tokenURI",
                  "type": "string"
                }
              ],
              "name": "setTokenURI",
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
          "address": "0x12b5d5796556f0202fa241085409e2b357450d70",
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
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getNFTDataByOwner",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
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
                  "name": "tokenDataResult",
                  "type": "tuple"
                },
                {
                  "internalType": "string",
                  "name": "tokenURIResult",
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
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getTokenIdByOwner",
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
              "name": "mint",
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
          "address": "0x246a2b1d53384e2972272a0f6bd017ecafdb3063",
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
          "address": "0x71fdedc946fe8177a36216300fd5f3cb5d887587",
          "abi": [
            {
              "inputs": [
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
                      "internalType": "string",
                      "name": "imageUrl",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "website",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "paymentToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "pricePerUnit",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalSupply",
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
                    },
                    {
                      "internalType": "string",
                      "name": "gender",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "color",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "style",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct Swag1155.DesignInfo",
                  "name": "_designInfo",
                  "type": "tuple"
                },
                {
                  "internalType": "address",
                  "name": "_treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_initialAdmin",
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
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "DesignActiveStatusChanged",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "smartContractEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "smartContractAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "smartContractDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "poapEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapEventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    }
                  ],
                  "indexed": false,
                  "internalType": "struct Swag1155.DiscountConfig",
                  "name": "config",
                  "type": "tuple"
                }
              ],
              "name": "DesignDiscountConfigUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
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
                      "internalType": "string",
                      "name": "imageUrl",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "website",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "paymentToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "pricePerUnit",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalSupply",
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
                    },
                    {
                      "internalType": "string",
                      "name": "gender",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "color",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "style",
                      "type": "string"
                    }
                  ],
                  "indexed": false,
                  "internalType": "struct Swag1155.DesignInfo",
                  "name": "info",
                  "type": "tuple"
                }
              ],
              "name": "DesignInfoUpdated",
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
                  "internalType": "string",
                  "name": "size",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "price",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "hadDiscount",
                  "type": "bool"
                }
              ],
              "name": "DesignMinted",
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
                  "internalType": "string[]",
                  "name": "sizes",
                  "type": "string[]"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "totalPrice",
                  "type": "uint256"
                }
              ],
              "name": "DesignMintedBatch",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newToken",
                  "type": "address"
                }
              ],
              "name": "DesignPaymentTokenUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "newPrice",
                  "type": "uint256"
                }
              ],
              "name": "DesignPriceUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "newSupply",
                  "type": "uint256"
                }
              ],
              "name": "DesignTotalSupplyUpdated",
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
              "name": "PhysicalRedemptionFulfilled",
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
              "name": "PhysicalRedemptionRequested",
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
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "uri",
                  "type": "string"
                }
              ],
              "name": "TokenURISet",
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
              "inputs": [],
              "name": "designInfo",
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
                  "internalType": "string",
                  "name": "imageUrl",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "website",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "paymentToken",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "pricePerUnit",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "totalSupply",
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
                },
                {
                  "internalType": "string",
                  "name": "gender",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "color",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "style",
                  "type": "string"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "discountConfig",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "smartContractEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "address",
                  "name": "smartContractAddress",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "smartContractDiscount",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "poapEnabled",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "poapEventId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "poapDiscount",
                  "type": "uint256"
                },
                {
                  "internalType": "enum Swag1155.DiscountType",
                  "name": "discountType",
                  "type": "uint8"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getDesignDiscountConfig",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "smartContractEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "smartContractAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "smartContractDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "poapEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapEventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    }
                  ],
                  "internalType": "struct Swag1155.DiscountConfig",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getDesignInfo",
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
                      "internalType": "string",
                      "name": "imageUrl",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "website",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "paymentToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "pricePerUnit",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalSupply",
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
                    },
                    {
                      "internalType": "string",
                      "name": "gender",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "color",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "style",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct Swag1155.DesignInfo",
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
                },
                {
                  "internalType": "bool",
                  "name": "hasPoap",
                  "type": "bool"
                }
              ],
              "name": "getDesignPriceWithDiscounts",
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
              "name": "getDesignRemainingSupply",
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
                },
                {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
                }
              ],
              "name": "getDesignTokenRedemptionStatus",
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
              "name": "getDesignTokenSize",
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
              "name": "getDesignTokenTraits",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "size",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "gender",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "color",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "style",
                  "type": "string"
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
              "name": "markRedemptionFulfilled",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "size",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "hasPoapDiscount",
                  "type": "bool"
                }
              ],
              "name": "mintDesign",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "string[]",
                  "name": "sizes",
                  "type": "string[]"
                },
                {
                  "internalType": "bool",
                  "name": "hasPoapDiscount",
                  "type": "bool"
                }
              ],
              "name": "mintDesignBatch",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "requestPhysicalRedemption",
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
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setDesignActive",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "components": [
                    {
                      "internalType": "bool",
                      "name": "smartContractEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "address",
                      "name": "smartContractAddress",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "smartContractDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "poapEnabled",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapEventId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "poapDiscount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "enum Swag1155.DiscountType",
                      "name": "discountType",
                      "type": "uint8"
                    }
                  ],
                  "internalType": "struct Swag1155.DiscountConfig",
                  "name": "config",
                  "type": "tuple"
                }
              ],
              "name": "setDesignDiscountConfig",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
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
                      "internalType": "string",
                      "name": "imageUrl",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "website",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "paymentToken",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "pricePerUnit",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "totalSupply",
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
                    },
                    {
                      "internalType": "string",
                      "name": "gender",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "color",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "style",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct Swag1155.DesignInfo",
                  "name": "info",
                  "type": "tuple"
                }
              ],
              "name": "setDesignInfo",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "setDesignPaymentToken",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "newPrice",
                  "type": "uint256"
                }
              ],
              "name": "setDesignPrice",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "newSupply",
                  "type": "uint256"
                }
              ],
              "name": "setDesignTotalSupply",
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
                  "internalType": "string",
                  "name": "tokenURI",
                  "type": "string"
                }
              ],
              "name": "setTokenURI",
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
      "ZKPassportNFT": "0x9f0da2f66a0aa01bf4469a257f75fab088130b40",
      "FaucetManager": "0xbd532043af9f2e8090ad9b1fa14e45a5aaaef102",
      "Swag1155": "0x9c2944f38156f6dfc922a825eba727a38895958e"
    }
  },
  "ethereum": {
    "chainId": 1,
    "addresses": {
      "ZKPassportNFT": "0x94b9f649f8825d5d797e37d04dfc66d612750b10",
      "FaucetManager": "0xb24295ffc0bd22b0b173b73a0ff5b42564986fd1",
      "Swag1155": "0xeb27e63799ec91fb81617629b7f98d26af3f9686"
    }
  },
  "unichain": {
    "chainId": 130,
    "addresses": {
      "ZKPassportNFT": "0x12b5d5796556f0202fa241085409e2b357450d70",
      "FaucetManager": "0x246a2b1d53384e2972272a0f6bd017ecafdb3063",
      "Swag1155": "0x71fdedc946fe8177a36216300fd5f3cb5d887587"
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
