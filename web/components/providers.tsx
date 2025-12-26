'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/config/wagmi'
import { useState } from 'react'

// --- Global Providers ---
// This component wraps our entire application to give it "superpowers".
// 1. WagmiProvider -> Gives every page access to the Blockchain (Wallet, Contracts).
// 2. QueryClientProvider -> Helps managing data fetching (loading states, caching).
export function Providers({ children }: { children: React.ReactNode }) {
    // Create a new QueryClient for each session
    const [queryClient] = useState(() => new QueryClient())

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}
