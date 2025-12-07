import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'

import { injected } from 'wagmi/connectors'

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

export const config = createConfig({
    chains: [coston2],
    connectors: [injected()],
    transports: {
        [coston2.id]: http('https://coston2-api.flare.network/ext/C/rpc'),
    },
})
