// Auto-generated multi-network contract addresses and types
// Generated: 2026-09-23T04:00:18.610Z
export const CONTRACTS = {
  "networks": {
    "base": {
      "network": "base",
      "chainId": 8453,
      "contracts": {
        "ZKPassportNFT": {
          "address": "0xa3f1150a8414b0383244e7c7936119e3e24d106d",
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
                },
                {
                  "internalType": "string",
                  "name": "_domain",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "_scope",
                  "type": "string"
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
                  "internalType": "bytes32",
                  "name": "uniqueIdentifier",
                  "type": "bytes32"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "isOver18",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "nationality",
                  "type": "string"
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
                  "internalType": "address",
                  "name": "newVerifier",
                  "type": "address"
                }
              ],
              "name": "VerifierUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ZKPASSPORT_VERIFIER_ADDRESS",
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
              "inputs": [],
              "name": "domain",
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
                      "internalType": "bytes32",
                      "name": "uniqueIdentifier",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "bool",
                      "name": "personhoodVerified",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "isOver18",
                      "type": "bool"
                    },
                    {
                      "internalType": "string",
                      "name": "nationality",
                      "type": "string"
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
                  "internalType": "bytes32",
                  "name": "uniqueIdentifier",
                  "type": "bytes32"
                }
              ],
              "name": "hasNFTByIdentifier",
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
                  "components": [
                    {
                      "internalType": "bytes32",
                      "name": "version",
                      "type": "bytes32"
                    },
                    {
                      "components": [
                        {
                          "internalType": "bytes32",
                          "name": "vkeyHash",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "bytes",
                          "name": "proof",
                          "type": "bytes"
                        },
                        {
                          "internalType": "bytes32[]",
                          "name": "publicInputs",
                          "type": "bytes32[]"
                        }
                      ],
                      "internalType": "struct ProofVerificationData",
                      "name": "proofVerificationData",
                      "type": "tuple"
                    },
                    {
                      "internalType": "bytes",
                      "name": "committedInputs",
                      "type": "bytes"
                    },
                    {
                      "components": [
                        {
                          "internalType": "uint256",
                          "name": "validityPeriodInSeconds",
                          "type": "uint256"
                        },
                        {
                          "internalType": "string",
                          "name": "domain",
                          "type": "string"
                        },
                        {
                          "internalType": "string",
                          "name": "scope",
                          "type": "string"
                        },
                        {
                          "internalType": "bool",
                          "name": "devMode",
                          "type": "bool"
                        }
                      ],
                      "internalType": "struct ServiceConfig",
                      "name": "serviceConfig",
                      "type": "tuple"
                    }
                  ],
                  "internalType": "struct ProofVerificationParams",
                  "name": "params",
                  "type": "tuple"
                },
                {
                  "internalType": "bool",
                  "name": "isIDCard",
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
              "inputs": [],
              "name": "scope",
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
                  "name": "_domain",
                  "type": "string"
                }
              ],
              "name": "setDomain",
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
                  "internalType": "string",
                  "name": "_scope",
                  "type": "string"
                }
              ],
              "name": "setScope",
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
                  "internalType": "address",
                  "name": "verifierAddress",
                  "type": "address"
                }
              ],
              "name": "setVerifier",
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
            },
            {
              "inputs": [],
              "name": "zkPassportVerifier",
              "outputs": [
                {
                  "internalType": "contract IZKPassportVerifier",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        },
        "FaucetManager": {
          "address": "0x145d0d587bce7e390750cd67301e02478c51b48c",
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
        "SwagFactory": {
          "address": "0xb11813d12810f3d432dee99a4f1ef581cf151b37",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_implementation",
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
              "name": "EmptyName",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EmptySku",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "FailedDeployment",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "balance",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "needed",
                  "type": "uint256"
                }
              ],
              "name": "InsufficientBalance",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidAddress",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidAdmin",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidItemAdmin",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidTreasury",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NoPaymentOptions",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NoSizes",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NotACollection",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
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
                  "name": "sku",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "treasury",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "variantCount",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "creator",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "signer",
                  "type": "address"
                }
              ],
              "name": "CollectionDeployed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "CollectionStatusChanged",
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
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "collectionMeta",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "sku",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "creator",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "deployedAt",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "variantCount",
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
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "collections",
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
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "sku",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "itemAdmin",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "metadataURI",
                      "type": "string"
                    },
                    {
                      "internalType": "uint128",
                      "name": "onchainCap",
                      "type": "uint128"
                    },
                    {
                      "internalType": "uint128",
                      "name": "voucherCap",
                      "type": "uint128"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "components": [
                        {
                          "internalType": "address",
                          "name": "token",
                          "type": "address"
                        },
                        {
                          "internalType": "uint256",
                          "name": "price",
                          "type": "uint256"
                        }
                      ],
                      "internalType": "struct SwagFactory.PaymentOption[]",
                      "name": "payments",
                      "type": "tuple[]"
                    }
                  ],
                  "internalType": "struct SwagFactory.VariantInit[]",
                  "name": "sizes",
                  "type": "tuple[]"
                },
                {
                  "internalType": "address",
                  "name": "signer",
                  "type": "address"
                }
              ],
              "name": "deployCollection",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "swagAddr",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getActiveCollections",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getCollectionCount",
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
                  "name": "collection",
                  "type": "address"
                }
              ],
              "name": "getCollectionMeta",
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
                      "name": "sku",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "treasury",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "creator",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "deployedAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "variantCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct SwagFactory.CollectionMeta",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getCollections",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
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
              "inputs": [],
              "name": "implementation",
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
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "isCollection",
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
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setCollectionActive",
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
            }
          ]
        },
        "DonationVault": {
          "address": "0x223f70933a14E847D83ff1e906C8CCf6962d36d3",
          "abi": [
            {
              "inputs": [
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "CampaignDoesNotExist",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "CampaignNotActive",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "DirectEthNotAccepted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EmptyName",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EnforcedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EthNotAccepted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EthTransferFailed",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ExpectedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "IncorrectEthAmount",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "available",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "requested",
                  "type": "uint256"
                }
              ],
              "name": "InsufficientBalance",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidBeneficiary",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidToken",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "SafeERC20FailedOperation",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "TiersNotAscending",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "TokenNotAccepted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ZeroAmount",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "AutoForwardUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "oldBeneficiary",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newBeneficiary",
                  "type": "address"
                }
              ],
              "name": "BeneficiaryUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "receiptCollection",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "CampaignCreated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "CampaignUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "message",
                  "type": "string"
                }
              ],
              "name": "Donated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "ForwardFailed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Forwarded",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "oldCollection",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newCollection",
                  "type": "address"
                }
              ],
              "name": "ReceiptCollectionUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "receiptTokenId",
                  "type": "uint256"
                }
              ],
              "name": "ReceiptFailed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "receiptTokenId",
                  "type": "uint256"
                }
              ],
              "name": "ReceiptIssued",
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
                  "name": "campaignId",
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
                  "internalType": "uint256",
                  "name": "tierCount",
                  "type": "uint256"
                }
              ],
              "name": "TiersUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "bool",
                  "name": "accepted",
                  "type": "bool"
                }
              ],
              "name": "TokenAccepted",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Withdrawn",
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
              "name": "ETH_TOKEN",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "availableBalance",
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
              "name": "campaignCount",
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
              "name": "campaigns",
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
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "receiptCollection",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "donorCount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "donationCount",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "autoForward",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "canDonate",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "allowed",
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
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "receiptCollection",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "createCampaign",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "message",
                  "type": "string"
                }
              ],
              "name": "donate",
              "outputs": [],
              "stateMutability": "payable",
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
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "donated",
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
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getAcceptedTokens",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getActiveCampaigns",
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
                      "internalType": "address",
                      "name": "beneficiary",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "receiptCollection",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donationCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "autoForward",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Campaign[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getAllCampaigns",
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
                      "internalType": "address",
                      "name": "beneficiary",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "receiptCollection",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donationCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "autoForward",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Campaign[]",
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
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getCampaign",
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
                      "internalType": "address",
                      "name": "beneficiary",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "receiptCollection",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donationCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "autoForward",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Campaign",
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
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getCampaignTotals",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "tokens",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "raised",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "available",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "getDonation",
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
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getDonors",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "offset",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "limit",
                  "type": "uint256"
                }
              ],
              "name": "getDonorsPaginated",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "page",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256",
                  "name": "total",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "offset",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "limit",
                  "type": "uint256"
                }
              ],
              "name": "getDonorsWithAmounts",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "donors",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "amounts",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256",
                  "name": "total",
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
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "getTiers",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "minAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "receiptTokenId",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Tier[]",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "isTokenAccepted",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "resolveTier",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "found",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "receiptTokenId",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "accepted",
                  "type": "bool"
                }
              ],
              "name": "setAcceptedToken",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "setAutoForward",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                }
              ],
              "name": "setBeneficiary",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                }
              ],
              "name": "setReceiptCollection",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "minAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "receiptTokenId",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Tier[]",
                  "name": "tiers",
                  "type": "tuple[]"
                }
              ],
              "name": "setTiers",
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
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "totalRaised",
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
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "totalWithdrawn",
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
              "name": "unpause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "updateCampaign",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "withdrawAll",
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
        "DonationReceipt1155": {
          "address": "0xA4E67a7bc9e17D6eBBCaa369727b9e8949D278e0",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "_name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "_symbol",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "baseURI",
                  "type": "string"
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
              "name": "EmptyURI",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidRecipient",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "Soulbound",
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
              "name": "TierHasSupply",
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
              "name": "TierNotActive",
              "type": "error"
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "ReceiptMinted",
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
              "name": "TierRemoved",
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
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "metadataURI",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "TierSet",
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
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "TransfersEnabledSet",
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
              "inputs": [],
              "name": "MINTER_ROLE",
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
                  "name": "minter",
                  "type": "address"
                }
              ],
              "name": "addMinter",
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
              "name": "getTier",
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
                      "name": "metadataURI",
                      "type": "string"
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
                  "internalType": "struct DonationReceipt1155.Tier",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "isTierActive",
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
              "name": "listTierIds",
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
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
                  "internalType": "address",
                  "name": "minter",
                  "type": "address"
                }
              ],
              "name": "removeMinter",
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
              "name": "removeTier",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "tierName",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "metadataURI",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setTier",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "setTransfersEnabled",
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
              "inputs": [],
              "name": "tierCount",
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
              "name": "tiers",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "metadataURI",
                  "type": "string"
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
            },
            {
              "inputs": [],
              "name": "transfersEnabled",
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
                },
                {
                  "internalType": "string",
                  "name": "_domain",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "_scope",
                  "type": "string"
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
                  "internalType": "bytes32",
                  "name": "uniqueIdentifier",
                  "type": "bytes32"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "isOver18",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "nationality",
                  "type": "string"
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
                  "internalType": "address",
                  "name": "newVerifier",
                  "type": "address"
                }
              ],
              "name": "VerifierUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ZKPASSPORT_VERIFIER_ADDRESS",
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
              "inputs": [],
              "name": "domain",
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
                      "internalType": "bytes32",
                      "name": "uniqueIdentifier",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "bool",
                      "name": "personhoodVerified",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "isOver18",
                      "type": "bool"
                    },
                    {
                      "internalType": "string",
                      "name": "nationality",
                      "type": "string"
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
                  "internalType": "bytes32",
                  "name": "uniqueIdentifier",
                  "type": "bytes32"
                }
              ],
              "name": "hasNFTByIdentifier",
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
                  "components": [
                    {
                      "internalType": "bytes32",
                      "name": "version",
                      "type": "bytes32"
                    },
                    {
                      "components": [
                        {
                          "internalType": "bytes32",
                          "name": "vkeyHash",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "bytes",
                          "name": "proof",
                          "type": "bytes"
                        },
                        {
                          "internalType": "bytes32[]",
                          "name": "publicInputs",
                          "type": "bytes32[]"
                        }
                      ],
                      "internalType": "struct ProofVerificationData",
                      "name": "proofVerificationData",
                      "type": "tuple"
                    },
                    {
                      "internalType": "bytes",
                      "name": "committedInputs",
                      "type": "bytes"
                    },
                    {
                      "components": [
                        {
                          "internalType": "uint256",
                          "name": "validityPeriodInSeconds",
                          "type": "uint256"
                        },
                        {
                          "internalType": "string",
                          "name": "domain",
                          "type": "string"
                        },
                        {
                          "internalType": "string",
                          "name": "scope",
                          "type": "string"
                        },
                        {
                          "internalType": "bool",
                          "name": "devMode",
                          "type": "bool"
                        }
                      ],
                      "internalType": "struct ServiceConfig",
                      "name": "serviceConfig",
                      "type": "tuple"
                    }
                  ],
                  "internalType": "struct ProofVerificationParams",
                  "name": "params",
                  "type": "tuple"
                },
                {
                  "internalType": "bool",
                  "name": "isIDCard",
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
              "inputs": [],
              "name": "scope",
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
                  "name": "_domain",
                  "type": "string"
                }
              ],
              "name": "setDomain",
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
                  "internalType": "string",
                  "name": "_scope",
                  "type": "string"
                }
              ],
              "name": "setScope",
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
                  "internalType": "address",
                  "name": "verifierAddress",
                  "type": "address"
                }
              ],
              "name": "setVerifier",
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
            },
            {
              "inputs": [],
              "name": "zkPassportVerifier",
              "outputs": [
                {
                  "internalType": "contract IZKPassportVerifier",
                  "name": "",
                  "type": "address"
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
        "DonationVault": {
          "address": "0x223f70933a14E847D83ff1e906C8CCf6962d36d3",
          "abi": [
            {
              "inputs": [
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "CampaignDoesNotExist",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "CampaignNotActive",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "DirectEthNotAccepted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EmptyName",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EnforcedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EthNotAccepted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EthTransferFailed",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ExpectedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "IncorrectEthAmount",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "available",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "requested",
                  "type": "uint256"
                }
              ],
              "name": "InsufficientBalance",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidBeneficiary",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidToken",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "SafeERC20FailedOperation",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "TiersNotAscending",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "TokenNotAccepted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ZeroAmount",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "AutoForwardUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "oldBeneficiary",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newBeneficiary",
                  "type": "address"
                }
              ],
              "name": "BeneficiaryUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "receiptCollection",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "CampaignCreated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "CampaignUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "message",
                  "type": "string"
                }
              ],
              "name": "Donated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "ForwardFailed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Forwarded",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "oldCollection",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newCollection",
                  "type": "address"
                }
              ],
              "name": "ReceiptCollectionUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "receiptTokenId",
                  "type": "uint256"
                }
              ],
              "name": "ReceiptFailed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "receiptTokenId",
                  "type": "uint256"
                }
              ],
              "name": "ReceiptIssued",
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
                  "name": "campaignId",
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
                  "internalType": "uint256",
                  "name": "tierCount",
                  "type": "uint256"
                }
              ],
              "name": "TiersUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "bool",
                  "name": "accepted",
                  "type": "bool"
                }
              ],
              "name": "TokenAccepted",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Withdrawn",
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
              "name": "ETH_TOKEN",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "availableBalance",
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
              "name": "campaignCount",
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
              "name": "campaigns",
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
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "receiptCollection",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "donorCount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "donationCount",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "autoForward",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "canDonate",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "allowed",
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
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "receiptCollection",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "createCampaign",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "message",
                  "type": "string"
                }
              ],
              "name": "donate",
              "outputs": [],
              "stateMutability": "payable",
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
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "donated",
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
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getAcceptedTokens",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getActiveCampaigns",
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
                      "internalType": "address",
                      "name": "beneficiary",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "receiptCollection",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donationCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "autoForward",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Campaign[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getAllCampaigns",
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
                      "internalType": "address",
                      "name": "beneficiary",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "receiptCollection",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donationCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "autoForward",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Campaign[]",
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
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getCampaign",
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
                      "internalType": "address",
                      "name": "beneficiary",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "receiptCollection",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donationCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "autoForward",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Campaign",
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
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getCampaignTotals",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "tokens",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "raised",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "available",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "getDonation",
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
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getDonors",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "offset",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "limit",
                  "type": "uint256"
                }
              ],
              "name": "getDonorsPaginated",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "page",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256",
                  "name": "total",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "offset",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "limit",
                  "type": "uint256"
                }
              ],
              "name": "getDonorsWithAmounts",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "donors",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "amounts",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256",
                  "name": "total",
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
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "getTiers",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "minAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "receiptTokenId",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Tier[]",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "isTokenAccepted",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "resolveTier",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "found",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "receiptTokenId",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "accepted",
                  "type": "bool"
                }
              ],
              "name": "setAcceptedToken",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "setAutoForward",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                }
              ],
              "name": "setBeneficiary",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                }
              ],
              "name": "setReceiptCollection",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "minAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "receiptTokenId",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Tier[]",
                  "name": "tiers",
                  "type": "tuple[]"
                }
              ],
              "name": "setTiers",
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
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "totalRaised",
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
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "totalWithdrawn",
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
              "name": "unpause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "updateCampaign",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "withdrawAll",
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
        "DonationReceipt1155": {
          "address": "0xA4E67a7bc9e17D6eBBCaa369727b9e8949D278e0",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "_name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "_symbol",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "baseURI",
                  "type": "string"
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
              "name": "EmptyURI",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidRecipient",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "Soulbound",
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
              "name": "TierHasSupply",
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
              "name": "TierNotActive",
              "type": "error"
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "ReceiptMinted",
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
              "name": "TierRemoved",
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
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "metadataURI",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "TierSet",
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
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "TransfersEnabledSet",
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
              "inputs": [],
              "name": "MINTER_ROLE",
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
                  "name": "minter",
                  "type": "address"
                }
              ],
              "name": "addMinter",
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
              "name": "getTier",
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
                      "name": "metadataURI",
                      "type": "string"
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
                  "internalType": "struct DonationReceipt1155.Tier",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "isTierActive",
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
              "name": "listTierIds",
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
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
                  "internalType": "address",
                  "name": "minter",
                  "type": "address"
                }
              ],
              "name": "removeMinter",
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
              "name": "removeTier",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "tierName",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "metadataURI",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setTier",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "setTransfersEnabled",
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
              "inputs": [],
              "name": "tierCount",
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
              "name": "tiers",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "metadataURI",
                  "type": "string"
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
            },
            {
              "inputs": [],
              "name": "transfersEnabled",
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
          "address": "0xc2ddade57815220833c31ecab6f6e9de9c69df09",
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
                },
                {
                  "internalType": "string",
                  "name": "_domain",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "_scope",
                  "type": "string"
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
                  "internalType": "bytes32",
                  "name": "uniqueIdentifier",
                  "type": "bytes32"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "isOver18",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "nationality",
                  "type": "string"
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
                  "internalType": "address",
                  "name": "newVerifier",
                  "type": "address"
                }
              ],
              "name": "VerifierUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ZKPASSPORT_VERIFIER_ADDRESS",
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
              "inputs": [],
              "name": "domain",
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
                      "internalType": "bytes32",
                      "name": "uniqueIdentifier",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "bool",
                      "name": "personhoodVerified",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "isOver18",
                      "type": "bool"
                    },
                    {
                      "internalType": "string",
                      "name": "nationality",
                      "type": "string"
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
                  "internalType": "bytes32",
                  "name": "uniqueIdentifier",
                  "type": "bytes32"
                }
              ],
              "name": "hasNFTByIdentifier",
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
                  "components": [
                    {
                      "internalType": "bytes32",
                      "name": "version",
                      "type": "bytes32"
                    },
                    {
                      "components": [
                        {
                          "internalType": "bytes32",
                          "name": "vkeyHash",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "bytes",
                          "name": "proof",
                          "type": "bytes"
                        },
                        {
                          "internalType": "bytes32[]",
                          "name": "publicInputs",
                          "type": "bytes32[]"
                        }
                      ],
                      "internalType": "struct ProofVerificationData",
                      "name": "proofVerificationData",
                      "type": "tuple"
                    },
                    {
                      "internalType": "bytes",
                      "name": "committedInputs",
                      "type": "bytes"
                    },
                    {
                      "components": [
                        {
                          "internalType": "uint256",
                          "name": "validityPeriodInSeconds",
                          "type": "uint256"
                        },
                        {
                          "internalType": "string",
                          "name": "domain",
                          "type": "string"
                        },
                        {
                          "internalType": "string",
                          "name": "scope",
                          "type": "string"
                        },
                        {
                          "internalType": "bool",
                          "name": "devMode",
                          "type": "bool"
                        }
                      ],
                      "internalType": "struct ServiceConfig",
                      "name": "serviceConfig",
                      "type": "tuple"
                    }
                  ],
                  "internalType": "struct ProofVerificationParams",
                  "name": "params",
                  "type": "tuple"
                },
                {
                  "internalType": "bool",
                  "name": "isIDCard",
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
              "inputs": [],
              "name": "scope",
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
                  "name": "_domain",
                  "type": "string"
                }
              ],
              "name": "setDomain",
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
                  "internalType": "string",
                  "name": "_scope",
                  "type": "string"
                }
              ],
              "name": "setScope",
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
                  "internalType": "address",
                  "name": "verifierAddress",
                  "type": "address"
                }
              ],
              "name": "setVerifier",
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
            },
            {
              "inputs": [],
              "name": "zkPassportVerifier",
              "outputs": [
                {
                  "internalType": "contract IZKPassportVerifier",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        },
        "FaucetManager": {
          "address": "0xdf1be43ae0636ba6f9bc26f75ab6ba8d66a3ddc8",
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
        "SwagFactory": {
          "address": "0x79abd2dabe18fa1086e210c41b622ed6011e0c85",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_implementation",
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
              "name": "EmptyName",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EmptySku",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "FailedDeployment",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "balance",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "needed",
                  "type": "uint256"
                }
              ],
              "name": "InsufficientBalance",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidAddress",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidAdmin",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidItemAdmin",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidTreasury",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NoPaymentOptions",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NoSizes",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NotACollection",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
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
                  "name": "sku",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "treasury",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "variantCount",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "creator",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "signer",
                  "type": "address"
                }
              ],
              "name": "CollectionDeployed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "CollectionStatusChanged",
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
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "collectionMeta",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "sku",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "creator",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "deployedAt",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "variantCount",
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
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "collections",
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
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "sku",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "itemAdmin",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "metadataURI",
                      "type": "string"
                    },
                    {
                      "internalType": "uint128",
                      "name": "onchainCap",
                      "type": "uint128"
                    },
                    {
                      "internalType": "uint128",
                      "name": "voucherCap",
                      "type": "uint128"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "components": [
                        {
                          "internalType": "address",
                          "name": "token",
                          "type": "address"
                        },
                        {
                          "internalType": "uint256",
                          "name": "price",
                          "type": "uint256"
                        }
                      ],
                      "internalType": "struct SwagFactory.PaymentOption[]",
                      "name": "payments",
                      "type": "tuple[]"
                    }
                  ],
                  "internalType": "struct SwagFactory.VariantInit[]",
                  "name": "sizes",
                  "type": "tuple[]"
                },
                {
                  "internalType": "address",
                  "name": "signer",
                  "type": "address"
                }
              ],
              "name": "deployCollection",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "swagAddr",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getActiveCollections",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getCollectionCount",
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
                  "name": "collection",
                  "type": "address"
                }
              ],
              "name": "getCollectionMeta",
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
                      "name": "sku",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "treasury",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "creator",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "deployedAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "variantCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct SwagFactory.CollectionMeta",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getCollections",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
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
              "inputs": [],
              "name": "implementation",
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
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "isCollection",
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
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setCollectionActive",
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
                },
                {
                  "internalType": "string",
                  "name": "_domain",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "_scope",
                  "type": "string"
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
                  "internalType": "bytes32",
                  "name": "uniqueIdentifier",
                  "type": "bytes32"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "isOver18",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "nationality",
                  "type": "string"
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
                  "internalType": "address",
                  "name": "newVerifier",
                  "type": "address"
                }
              ],
              "name": "VerifierUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ZKPASSPORT_VERIFIER_ADDRESS",
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
              "inputs": [],
              "name": "domain",
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
                      "internalType": "bytes32",
                      "name": "uniqueIdentifier",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "bool",
                      "name": "personhoodVerified",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "isOver18",
                      "type": "bool"
                    },
                    {
                      "internalType": "string",
                      "name": "nationality",
                      "type": "string"
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
                  "internalType": "bytes32",
                  "name": "uniqueIdentifier",
                  "type": "bytes32"
                }
              ],
              "name": "hasNFTByIdentifier",
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
                  "components": [
                    {
                      "internalType": "bytes32",
                      "name": "version",
                      "type": "bytes32"
                    },
                    {
                      "components": [
                        {
                          "internalType": "bytes32",
                          "name": "vkeyHash",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "bytes",
                          "name": "proof",
                          "type": "bytes"
                        },
                        {
                          "internalType": "bytes32[]",
                          "name": "publicInputs",
                          "type": "bytes32[]"
                        }
                      ],
                      "internalType": "struct ProofVerificationData",
                      "name": "proofVerificationData",
                      "type": "tuple"
                    },
                    {
                      "internalType": "bytes",
                      "name": "committedInputs",
                      "type": "bytes"
                    },
                    {
                      "components": [
                        {
                          "internalType": "uint256",
                          "name": "validityPeriodInSeconds",
                          "type": "uint256"
                        },
                        {
                          "internalType": "string",
                          "name": "domain",
                          "type": "string"
                        },
                        {
                          "internalType": "string",
                          "name": "scope",
                          "type": "string"
                        },
                        {
                          "internalType": "bool",
                          "name": "devMode",
                          "type": "bool"
                        }
                      ],
                      "internalType": "struct ServiceConfig",
                      "name": "serviceConfig",
                      "type": "tuple"
                    }
                  ],
                  "internalType": "struct ProofVerificationParams",
                  "name": "params",
                  "type": "tuple"
                },
                {
                  "internalType": "bool",
                  "name": "isIDCard",
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
              "inputs": [],
              "name": "scope",
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
                  "name": "_domain",
                  "type": "string"
                }
              ],
              "name": "setDomain",
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
                  "internalType": "string",
                  "name": "_scope",
                  "type": "string"
                }
              ],
              "name": "setScope",
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
                  "internalType": "address",
                  "name": "verifierAddress",
                  "type": "address"
                }
              ],
              "name": "setVerifier",
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
            },
            {
              "inputs": [],
              "name": "zkPassportVerifier",
              "outputs": [
                {
                  "internalType": "contract IZKPassportVerifier",
                  "name": "",
                  "type": "address"
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
        "SwagFactory": {
          "address": "0x94b9f649f8825d5d797e37d04dfc66d612750b10",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "admin",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "_implementation",
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
              "name": "EmptyName",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EmptySku",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "FailedDeployment",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "balance",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "needed",
                  "type": "uint256"
                }
              ],
              "name": "InsufficientBalance",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidAddress",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidAdmin",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidItemAdmin",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidTreasury",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NoPaymentOptions",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NoSizes",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "NotACollection",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
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
                  "name": "sku",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "treasury",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "variantCount",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "creator",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "address",
                  "name": "signer",
                  "type": "address"
                }
              ],
              "name": "CollectionDeployed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "CollectionStatusChanged",
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
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "collectionMeta",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "sku",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "creator",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "deployedAt",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "variantCount",
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
                  "name": "",
                  "type": "uint256"
                }
              ],
              "name": "collections",
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
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "sku",
                  "type": "string"
                },
                {
                  "internalType": "address",
                  "name": "treasury",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "itemAdmin",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "metadataURI",
                      "type": "string"
                    },
                    {
                      "internalType": "uint128",
                      "name": "onchainCap",
                      "type": "uint128"
                    },
                    {
                      "internalType": "uint128",
                      "name": "voucherCap",
                      "type": "uint128"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "components": [
                        {
                          "internalType": "address",
                          "name": "token",
                          "type": "address"
                        },
                        {
                          "internalType": "uint256",
                          "name": "price",
                          "type": "uint256"
                        }
                      ],
                      "internalType": "struct SwagFactory.PaymentOption[]",
                      "name": "payments",
                      "type": "tuple[]"
                    }
                  ],
                  "internalType": "struct SwagFactory.VariantInit[]",
                  "name": "sizes",
                  "type": "tuple[]"
                },
                {
                  "internalType": "address",
                  "name": "signer",
                  "type": "address"
                }
              ],
              "name": "deployCollection",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "swagAddr",
                  "type": "address"
                }
              ],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getActiveCollections",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getCollectionCount",
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
                  "name": "collection",
                  "type": "address"
                }
              ],
              "name": "getCollectionMeta",
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
                      "name": "sku",
                      "type": "string"
                    },
                    {
                      "internalType": "address",
                      "name": "treasury",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "creator",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "deployedAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "variantCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct SwagFactory.CollectionMeta",
                  "name": "",
                  "type": "tuple"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getCollections",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
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
              "inputs": [],
              "name": "implementation",
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
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "isCollection",
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
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setCollectionActive",
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
            }
          ]
        },
        "DonationVault": {
          "address": "0x223f70933a14E847D83ff1e906C8CCf6962d36d3",
          "abi": [
            {
              "inputs": [
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "CampaignDoesNotExist",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "CampaignNotActive",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "DirectEthNotAccepted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EmptyName",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EnforcedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EthNotAccepted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EthTransferFailed",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ExpectedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "IncorrectEthAmount",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "available",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "requested",
                  "type": "uint256"
                }
              ],
              "name": "InsufficientBalance",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidBeneficiary",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidToken",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "SafeERC20FailedOperation",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "TiersNotAscending",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "TokenNotAccepted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ZeroAmount",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "AutoForwardUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "oldBeneficiary",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newBeneficiary",
                  "type": "address"
                }
              ],
              "name": "BeneficiaryUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "receiptCollection",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "CampaignCreated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "CampaignUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "message",
                  "type": "string"
                }
              ],
              "name": "Donated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "ForwardFailed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Forwarded",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "oldCollection",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newCollection",
                  "type": "address"
                }
              ],
              "name": "ReceiptCollectionUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "receiptTokenId",
                  "type": "uint256"
                }
              ],
              "name": "ReceiptFailed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "receiptTokenId",
                  "type": "uint256"
                }
              ],
              "name": "ReceiptIssued",
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
                  "name": "campaignId",
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
                  "internalType": "uint256",
                  "name": "tierCount",
                  "type": "uint256"
                }
              ],
              "name": "TiersUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "bool",
                  "name": "accepted",
                  "type": "bool"
                }
              ],
              "name": "TokenAccepted",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Withdrawn",
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
              "name": "ETH_TOKEN",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "availableBalance",
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
              "name": "campaignCount",
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
              "name": "campaigns",
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
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "receiptCollection",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "donorCount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "donationCount",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "autoForward",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "canDonate",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "allowed",
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
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "receiptCollection",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "createCampaign",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "message",
                  "type": "string"
                }
              ],
              "name": "donate",
              "outputs": [],
              "stateMutability": "payable",
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
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "donated",
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
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getAcceptedTokens",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getActiveCampaigns",
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
                      "internalType": "address",
                      "name": "beneficiary",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "receiptCollection",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donationCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "autoForward",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Campaign[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getAllCampaigns",
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
                      "internalType": "address",
                      "name": "beneficiary",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "receiptCollection",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donationCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "autoForward",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Campaign[]",
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
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getCampaign",
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
                      "internalType": "address",
                      "name": "beneficiary",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "receiptCollection",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donationCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "autoForward",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Campaign",
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
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getCampaignTotals",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "tokens",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "raised",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "available",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "getDonation",
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
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getDonors",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "offset",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "limit",
                  "type": "uint256"
                }
              ],
              "name": "getDonorsPaginated",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "page",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256",
                  "name": "total",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "offset",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "limit",
                  "type": "uint256"
                }
              ],
              "name": "getDonorsWithAmounts",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "donors",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "amounts",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256",
                  "name": "total",
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
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "getTiers",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "minAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "receiptTokenId",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Tier[]",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "isTokenAccepted",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "resolveTier",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "found",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "receiptTokenId",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "accepted",
                  "type": "bool"
                }
              ],
              "name": "setAcceptedToken",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "setAutoForward",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                }
              ],
              "name": "setBeneficiary",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                }
              ],
              "name": "setReceiptCollection",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "minAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "receiptTokenId",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Tier[]",
                  "name": "tiers",
                  "type": "tuple[]"
                }
              ],
              "name": "setTiers",
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
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "totalRaised",
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
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "totalWithdrawn",
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
              "name": "unpause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "updateCampaign",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "withdrawAll",
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
        "DonationReceipt1155": {
          "address": "0xA4E67a7bc9e17D6eBBCaa369727b9e8949D278e0",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "_name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "_symbol",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "baseURI",
                  "type": "string"
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
              "name": "EmptyURI",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidRecipient",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "Soulbound",
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
              "name": "TierHasSupply",
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
              "name": "TierNotActive",
              "type": "error"
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "ReceiptMinted",
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
              "name": "TierRemoved",
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
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "metadataURI",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "TierSet",
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
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "TransfersEnabledSet",
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
              "inputs": [],
              "name": "MINTER_ROLE",
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
                  "name": "minter",
                  "type": "address"
                }
              ],
              "name": "addMinter",
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
              "name": "getTier",
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
                      "name": "metadataURI",
                      "type": "string"
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
                  "internalType": "struct DonationReceipt1155.Tier",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "isTierActive",
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
              "name": "listTierIds",
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
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
                  "internalType": "address",
                  "name": "minter",
                  "type": "address"
                }
              ],
              "name": "removeMinter",
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
              "name": "removeTier",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "tierName",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "metadataURI",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setTier",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "setTransfersEnabled",
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
              "inputs": [],
              "name": "tierCount",
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
              "name": "tiers",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "metadataURI",
                  "type": "string"
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
            },
            {
              "inputs": [],
              "name": "transfersEnabled",
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
    "celo": {
      "network": "celo",
      "chainId": 42220,
      "contracts": {
        "ZKPassportNFT": {
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
                },
                {
                  "internalType": "string",
                  "name": "_domain",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "_scope",
                  "type": "string"
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
                  "internalType": "bytes32",
                  "name": "uniqueIdentifier",
                  "type": "bytes32"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "isOver18",
                  "type": "bool"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "nationality",
                  "type": "string"
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
                  "internalType": "address",
                  "name": "newVerifier",
                  "type": "address"
                }
              ],
              "name": "VerifierUpdated",
              "type": "event"
            },
            {
              "inputs": [],
              "name": "ZKPASSPORT_VERIFIER_ADDRESS",
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
              "inputs": [],
              "name": "domain",
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
                      "internalType": "bytes32",
                      "name": "uniqueIdentifier",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "bool",
                      "name": "personhoodVerified",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "isOver18",
                      "type": "bool"
                    },
                    {
                      "internalType": "string",
                      "name": "nationality",
                      "type": "string"
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
                  "internalType": "bytes32",
                  "name": "uniqueIdentifier",
                  "type": "bytes32"
                }
              ],
              "name": "hasNFTByIdentifier",
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
                  "components": [
                    {
                      "internalType": "bytes32",
                      "name": "version",
                      "type": "bytes32"
                    },
                    {
                      "components": [
                        {
                          "internalType": "bytes32",
                          "name": "vkeyHash",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "bytes",
                          "name": "proof",
                          "type": "bytes"
                        },
                        {
                          "internalType": "bytes32[]",
                          "name": "publicInputs",
                          "type": "bytes32[]"
                        }
                      ],
                      "internalType": "struct ProofVerificationData",
                      "name": "proofVerificationData",
                      "type": "tuple"
                    },
                    {
                      "internalType": "bytes",
                      "name": "committedInputs",
                      "type": "bytes"
                    },
                    {
                      "components": [
                        {
                          "internalType": "uint256",
                          "name": "validityPeriodInSeconds",
                          "type": "uint256"
                        },
                        {
                          "internalType": "string",
                          "name": "domain",
                          "type": "string"
                        },
                        {
                          "internalType": "string",
                          "name": "scope",
                          "type": "string"
                        },
                        {
                          "internalType": "bool",
                          "name": "devMode",
                          "type": "bool"
                        }
                      ],
                      "internalType": "struct ServiceConfig",
                      "name": "serviceConfig",
                      "type": "tuple"
                    }
                  ],
                  "internalType": "struct ProofVerificationParams",
                  "name": "params",
                  "type": "tuple"
                },
                {
                  "internalType": "bool",
                  "name": "isIDCard",
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
              "inputs": [],
              "name": "scope",
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
                  "name": "_domain",
                  "type": "string"
                }
              ],
              "name": "setDomain",
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
                  "internalType": "string",
                  "name": "_scope",
                  "type": "string"
                }
              ],
              "name": "setScope",
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
                  "internalType": "address",
                  "name": "verifierAddress",
                  "type": "address"
                }
              ],
              "name": "setVerifier",
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
            },
            {
              "inputs": [],
              "name": "zkPassportVerifier",
              "outputs": [
                {
                  "internalType": "contract IZKPassportVerifier",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            }
          ]
        },
        "FaucetManager": {
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
        "DonationVault": {
          "address": "0x223f70933a14E847D83ff1e906C8CCf6962d36d3",
          "abi": [
            {
              "inputs": [
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "CampaignDoesNotExist",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "CampaignNotActive",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "DirectEthNotAccepted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EmptyName",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EnforcedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EthNotAccepted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "EthTransferFailed",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ExpectedPause",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "IncorrectEthAmount",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "available",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "requested",
                  "type": "uint256"
                }
              ],
              "name": "InsufficientBalance",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidBeneficiary",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidToken",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ReentrancyGuardReentrantCall",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "SafeERC20FailedOperation",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "TiersNotAscending",
              "type": "error"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "TokenNotAccepted",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "ZeroAmount",
              "type": "error"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "AutoForwardUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "oldBeneficiary",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newBeneficiary",
                  "type": "address"
                }
              ],
              "name": "BeneficiaryUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "receiptCollection",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "CampaignCreated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "CampaignUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "message",
                  "type": "string"
                }
              ],
              "name": "Donated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "ForwardFailed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Forwarded",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "oldCollection",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "newCollection",
                  "type": "address"
                }
              ],
              "name": "ReceiptCollectionUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "receiptTokenId",
                  "type": "uint256"
                }
              ],
              "name": "ReceiptFailed",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "receiptTokenId",
                  "type": "uint256"
                }
              ],
              "name": "ReceiptIssued",
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
                  "name": "campaignId",
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
                  "internalType": "uint256",
                  "name": "tierCount",
                  "type": "uint256"
                }
              ],
              "name": "TiersUpdated",
              "type": "event"
            },
            {
              "anonymous": false,
              "inputs": [
                {
                  "indexed": true,
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "bool",
                  "name": "accepted",
                  "type": "bool"
                }
              ],
              "name": "TokenAccepted",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "indexed": true,
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "Withdrawn",
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
              "name": "ETH_TOKEN",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "availableBalance",
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
              "name": "campaignCount",
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
              "name": "campaigns",
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
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "receiptCollection",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "donorCount",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "donationCount",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                },
                {
                  "internalType": "bool",
                  "name": "autoForward",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "canDonate",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "allowed",
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
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "receiptCollection",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "createCampaign",
              "outputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "message",
                  "type": "string"
                }
              ],
              "name": "donate",
              "outputs": [],
              "stateMutability": "payable",
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
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "donated",
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
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getAcceptedTokens",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getActiveCampaigns",
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
                      "internalType": "address",
                      "name": "beneficiary",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "receiptCollection",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donationCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "autoForward",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Campaign[]",
                  "name": "",
                  "type": "tuple[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "getAllCampaigns",
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
                      "internalType": "address",
                      "name": "beneficiary",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "receiptCollection",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donationCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "autoForward",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Campaign[]",
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
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getCampaign",
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
                      "internalType": "address",
                      "name": "beneficiary",
                      "type": "address"
                    },
                    {
                      "internalType": "address",
                      "name": "receiptCollection",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donorCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "donationCount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "active",
                      "type": "bool"
                    },
                    {
                      "internalType": "bool",
                      "name": "autoForward",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Campaign",
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
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getCampaignTotals",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "tokens",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "raised",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "available",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "donor",
                  "type": "address"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "getDonation",
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
                  "name": "campaignId",
                  "type": "uint256"
                }
              ],
              "name": "getDonors",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "",
                  "type": "address[]"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "offset",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "limit",
                  "type": "uint256"
                }
              ],
              "name": "getDonorsPaginated",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "page",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256",
                  "name": "total",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "offset",
                  "type": "uint256"
                },
                {
                  "internalType": "uint256",
                  "name": "limit",
                  "type": "uint256"
                }
              ],
              "name": "getDonorsWithAmounts",
              "outputs": [
                {
                  "internalType": "address[]",
                  "name": "donors",
                  "type": "address[]"
                },
                {
                  "internalType": "uint256[]",
                  "name": "amounts",
                  "type": "uint256[]"
                },
                {
                  "internalType": "uint256",
                  "name": "total",
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
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "getTiers",
              "outputs": [
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "minAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "receiptTokenId",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Tier[]",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "isTokenAccepted",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "resolveTier",
              "outputs": [
                {
                  "internalType": "bool",
                  "name": "found",
                  "type": "bool"
                },
                {
                  "internalType": "uint256",
                  "name": "receiptTokenId",
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
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "internalType": "bool",
                  "name": "accepted",
                  "type": "bool"
                }
              ],
              "name": "setAcceptedToken",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "bool",
                  "name": "autoForward",
                  "type": "bool"
                }
              ],
              "name": "setAutoForward",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "beneficiary",
                  "type": "address"
                }
              ],
              "name": "setBeneficiary",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "collection",
                  "type": "address"
                }
              ],
              "name": "setReceiptCollection",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                },
                {
                  "components": [
                    {
                      "internalType": "uint256",
                      "name": "minAmount",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "receiptTokenId",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct DonationVault.Tier[]",
                  "name": "tiers",
                  "type": "tuple[]"
                }
              ],
              "name": "setTiers",
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
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "totalRaised",
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
                },
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "name": "totalWithdrawn",
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
              "name": "unpause",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
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
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "updateCampaign",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
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
              "inputs": [
                {
                  "internalType": "uint256",
                  "name": "campaignId",
                  "type": "uint256"
                },
                {
                  "internalType": "address",
                  "name": "token",
                  "type": "address"
                }
              ],
              "name": "withdrawAll",
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
        "DonationReceipt1155": {
          "address": "0xA4E67a7bc9e17D6eBBCaa369727b9e8949D278e0",
          "abi": [
            {
              "inputs": [
                {
                  "internalType": "string",
                  "name": "_name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "_symbol",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "baseURI",
                  "type": "string"
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
              "name": "EmptyURI",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "InvalidRecipient",
              "type": "error"
            },
            {
              "inputs": [],
              "name": "Soulbound",
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
              "name": "TierHasSupply",
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
              "name": "TierNotActive",
              "type": "error"
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
                }
              ],
              "name": "ReceiptMinted",
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
              "name": "TierRemoved",
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
                  "name": "name",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "string",
                  "name": "metadataURI",
                  "type": "string"
                },
                {
                  "indexed": false,
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "TierSet",
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
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "TransfersEnabledSet",
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
              "inputs": [],
              "name": "MINTER_ROLE",
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
                  "name": "minter",
                  "type": "address"
                }
              ],
              "name": "addMinter",
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
              "name": "getTier",
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
                      "name": "metadataURI",
                      "type": "string"
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
                  "internalType": "struct DonationReceipt1155.Tier",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                }
              ],
              "name": "isTierActive",
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
              "name": "listTierIds",
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
                  "internalType": "uint256",
                  "name": "amount",
                  "type": "uint256"
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
                  "internalType": "address",
                  "name": "minter",
                  "type": "address"
                }
              ],
              "name": "removeMinter",
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
              "name": "removeTier",
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
                  "internalType": "uint256",
                  "name": "tokenId",
                  "type": "uint256"
                },
                {
                  "internalType": "string",
                  "name": "tierName",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "metadataURI",
                  "type": "string"
                },
                {
                  "internalType": "bool",
                  "name": "active",
                  "type": "bool"
                }
              ],
              "name": "setTier",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "bool",
                  "name": "enabled",
                  "type": "bool"
                }
              ],
              "name": "setTransfersEnabled",
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
              "inputs": [],
              "name": "tierCount",
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
              "name": "tiers",
              "outputs": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "string",
                  "name": "metadataURI",
                  "type": "string"
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
            },
            {
              "inputs": [],
              "name": "transfersEnabled",
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
      "ZKPassportNFT": "0xa3f1150a8414b0383244e7c7936119e3e24d106d",
      "FaucetManager": "0x145d0d587bce7e390750cd67301e02478c51b48c",
      "SwagFactory": "0xb11813d12810f3d432dee99a4f1ef581cf151b37",
      "DonationVault": "0x223f70933a14E847D83ff1e906C8CCf6962d36d3",
      "DonationReceipt1155": "0xA4E67a7bc9e17D6eBBCaa369727b9e8949D278e0"
    }
  },
  "ethereum": {
    "chainId": 1,
    "addresses": {
      "ZKPassportNFT": "0x607003f188c49ed6e0553805734b9990393402df",
      "FaucetManager": "0x2940e286b41d279b61e484b98a08498e355e4778",
      "DonationVault": "0x223f70933a14E847D83ff1e906C8CCf6962d36d3",
      "DonationReceipt1155": "0xA4E67a7bc9e17D6eBBCaa369727b9e8949D278e0"
    }
  },
  "unichain": {
    "chainId": 130,
    "addresses": {
      "ZKPassportNFT": "0xc2ddade57815220833c31ecab6f6e9de9c69df09",
      "FaucetManager": "0xdf1be43ae0636ba6f9bc26f75ab6ba8d66a3ddc8",
      "SwagFactory": "0x79abd2dabe18fa1086e210c41b622ed6011e0c85"
    }
  },
  "optimism": {
    "chainId": 10,
    "addresses": {
      "ZKPassportNFT": "0x607003f188c49ed6e0553805734b9990393402df",
      "FaucetManager": "0x2940e286b41d279b61e484b98a08498e355e4778",
      "SwagFactory": "0x94b9f649f8825d5d797e37d04dfc66d612750b10",
      "DonationVault": "0x223f70933a14E847D83ff1e906C8CCf6962d36d3",
      "DonationReceipt1155": "0xA4E67a7bc9e17D6eBBCaa369727b9e8949D278e0"
    }
  },
  "celo": {
    "chainId": 42220,
    "addresses": {
      "DonationVault": "0x223f70933a14E847D83ff1e906C8CCf6962d36d3",
      "DonationReceipt1155": "0xA4E67a7bc9e17D6eBBCaa369727b9e8949D278e0"
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
