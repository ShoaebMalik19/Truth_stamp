'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ShieldAlert, BadgeCheck, Clock, ExternalLink } from 'lucide-react'
import { useReadContract } from 'wagmi'

// --- Mock Contract ABI for demonstration ---
// --- Contract ABI for demonstration ---
const ABI = [
    {
        "inputs": [{ "internalType": "bytes32", "name": "_contentHash", "type": "bytes32" }],
        "name": "verifyContent",
        "outputs": [
            { "internalType": "bool", "name": "exists", "type": "bool" },
            { "internalType": "uint256", "name": "firstTimestamp", "type": "uint256" },
            { "internalType": "address", "name": "firstOwner", "type": "address" },
            { "internalType": "string", "name": "sourceUrl", "type": "string" },
            { "internalType": "bool", "name": "isVerified", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const

const ContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xe2e255dc2111Fc3711F17e9bE39ed903150c9E48"

export default function VerifyPage() {
    const [query, setQuery] = useState('')
    const [searchedHash, setSearchedHash] = useState<`0x${string}` | undefined>(undefined)

    const { data: verificationResult, isLoading, isError } = useReadContract({
        address: ContractAddress as `0x${string}`,
        abi: ABI,
        functionName: 'verifyContent',
        args: searchedHash ? [searchedHash] : undefined,
        query: {
            enabled: !!searchedHash
        }
    })

    const handleSearch = () => {
        const trimmed = query.trim()
        let hashToVerify = trimmed

        // Extract hash if full URL provided
        if (trimmed.includes('/verify/')) {
            const parts = trimmed.split('/verify/')
            if (parts.length > 1) {
                hashToVerify = parts[1]
            }
        }

        // Validate hash format (0x + 64 hex chars)
        const isHash = /^0x[a-fA-F0-9]{64}$/.test(hashToVerify)

        if (isHash) {
            setSearchedHash(hashToVerify as `0x${string}`)
        } else {
            // Fallback for non-hash content (FDC demo logic)
            // If user purposely pasted a URL that isn't a verify link, we'd hash it here in a real app
            if (trimmed.startsWith('http')) {
                alert("For this demo, please paste the Content Hash (0x...) or a valid /verify/ link. Automatic URL hashing is part of the FDC integration.")
            } else {
                alert("Invalid format. Please enter a valid Content Hash (0x...) or Verification URL.")
            }
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4">
            <div className="max-w-4xl mx-auto pt-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Verify Truth</h1>
                    <p className="text-slate-400">Check the authenticity and timeline of digital content.</p>
                </div>

                {/* Search Section */}
                <div className="flex gap-2 max-w-xl mx-auto mb-16">
                    <Input
                        placeholder="Paste URL or Content Hash (0x...)"
                        className="h-12 bg-slate-900/80 border-slate-800"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button size="lg" variant="premium" onClick={handleSearch} disabled={!query}>
                        <Search className="w-5 h-5" />
                    </Button>
                </div>

                {/* Results Section */}
                {searchedHash && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {isLoading ? (
                            <div className="text-center text-slate-500">Scanning Flare Registry...</div>
                        ) : verificationResult && verificationResult[0] ? (
                            <Card className="bg-slate-900/40 border-emerald-500/30 backdrop-blur-md overflow-hidden">
                                <div className="h-2 bg-emerald-500 w-full" />
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <BadgeCheck className="w-8 h-8 text-emerald-400" />
                                        <div>
                                            <CardTitle className="text-emerald-400">Authentic Original Found</CardTitle>
                                            <p className="text-slate-400 text-sm">This content was stamped and verified.</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                                            <span className="text-xs text-slate-500 uppercase">First Stamped On</span>
                                            <div className="flex items-center gap-2 text-xl font-mono text-white mt-1">
                                                <Clock className="w-5 h-5 text-teal-500" />
                                                {/* Ensure BigInt is converted to Number safely since block timestamps fit in number */}
                                                {new Date(Number(verificationResult[1]) * 1000).toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                                            <span className="text-xs text-slate-500 uppercase">Owner Address</span>
                                            <div className="font-mono text-slate-300 text-sm break-all mt-1">
                                                {verificationResult[2]}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                                            <span className="text-xs text-slate-500 uppercase">FTSO Consensus</span>
                                            <div className="text-slate-300 text-sm mt-1">
                                                Time confirmed by Flare Time Series Oracle.
                                            </div>
                                        </div>

                                        <Button variant="outline" className="w-full flex justify-between items-center group">
                                            View on Flare Explorer
                                            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-slate-900/40 border-red-500/30 backdrop-blur-md">
                                <CardContent className="flex flex-col items-center py-12 text-center">
                                    <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">No Record Found</h3>
                                    <p className="text-slate-400 max-w-md">
                                        We could not find a stamp for this specific content hash. It may not have been registered yet, or the hash differs.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
