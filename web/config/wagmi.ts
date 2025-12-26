import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'

import { injected } from 'wagmi/connectors'

// --- Wagmi Configuration ---
// This file sets up the connection between our web app and the blockchain.

// 1. Define the Chain
// We are using the "Flare Coston2 Testnet". We define its ID, currency, and RPC URL.
export const coston2 = defineChain({
    id: 114,
    name: 'Flare Coston2 Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'Coston2 Flare',
        symbol: 'C2FLR',
    },
    rpcUrls: {
        default: { http: ['https://coston2-api.flare.network/ext/C/rpc'] },
    },
    blockExplorers: {
        default: { name: 'Coston2 Explorer', url: 'https://coston2-explorer.flare.network' },
    },
    testnet: true,
})

// 2. Create the Config
// This exports a "config" object that the rest of the app uses.
export const config = createConfig({
    chains: [coston2], // The networks we support
    connectors: [
        injected(), // "Injected" means browser wallets like Metamask
    ],
    transports: {
        // HTTP Transport: How we talk to the node (like sending an API request)
        [coston2.id]: http('https://coston2-api.flare.network/ext/C/rpc'),
    },
})
