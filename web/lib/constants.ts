export const TRUTHSTAMP_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x77409263fa088B612b004F59b37a9b94d3B121b1" as `0x${string}`;

export const TRUTHSTAMP_ABI = [
    {
        "inputs": [
            { "internalType": "bytes32", "name": "_contentHash", "type": "bytes32" },
            { "internalType": "bytes32", "name": "_perceptualHash", "type": "bytes32" },
            { "internalType": "bytes32", "name": "_potentialParentHash", "type": "bytes32" },
            { "internalType": "string", "name": "_sourceUrl", "type": "string" },
            { "internalType": "string", "name": "_metadata", "type": "string" },
            { "internalType": "bytes32", "name": "_attestationId", "type": "bytes32" },
            { "internalType": "bytes", "name": "_proof", "type": "bytes" }
        ],
        "name": "createStamp",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "_contentHash", "type": "bytes32" }],
        "name": "verifyContent",
        "outputs": [
            { "internalType": "bool", "name": "exists", "type": "bool" },
            { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "string", "name": "sourceUrl", "type": "string" },
            { "internalType": "uint8", "name": "matchType", "type": "uint8" },
            { "internalType": "bytes32", "name": "derivedFrom", "type": "bytes32" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "string", "name": "_url", "type": "string" }],
        "name": "verifyUrl",
        "outputs": [
            { "internalType": "bool", "name": "exists", "type": "bool" },
            { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
            { "internalType": "address", "name": "owner", "type": "address" },
            { "internalType": "bytes32", "name": "contentHash", "type": "bytes32" },
            { "internalType": "uint8", "name": "matchType", "type": "uint8" },
            { "internalType": "bytes32", "name": "derivedFrom", "type": "bytes32" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "bytes32", "name": "_perceptualHash", "type": "bytes32" }],
        "name": "findSimilarStamp",
        "outputs": [
            { "internalType": "bool", "name": "found", "type": "bool" },
            { "internalType": "bytes32", "name": "matchHash", "type": "bytes32" },
            { "internalType": "uint256", "name": "distance", "type": "uint256" },
            { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
            { "internalType": "address", "name": "owner", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const;
