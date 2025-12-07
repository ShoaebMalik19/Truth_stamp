'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ShieldAlert, BadgeCheck, Clock, ExternalLink } from 'lucide-react'
import { useReadContract } from 'wagmi'

// --- Contract ABI ---
const ABI = [
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
    }
] as const

const ContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xF2bFce624186fb52d7428E14460050215A74596A"

export default function VerifyPage() {
    const [query, setQuery] = useState('')
    const [searchType, setSearchType] = useState<'hash' | 'url' | null>(null)
    const [searchValue, setSearchValue] = useState<string | null>(null)

    // Hook for Hash Verification
    const { data: hashResult, isLoading: hashLoading } = useReadContract({
        address: ContractAddress as `0x${string}`,
        abi: ABI,
        functionName: 'verifyContent',
        args: searchType === 'hash' ? [searchValue as `0x${string}`] : undefined,
        query: { enabled: searchType === 'hash' && !!searchValue }
    })

    // Hook for URL Verification
    const { data: urlResult, isLoading: urlLoading } = useReadContract({
        address: ContractAddress as `0x${string}`,
        abi: ABI,
        functionName: 'verifyUrl',
        args: searchType === 'url' ? [searchValue as string] : undefined,
        query: { enabled: searchType === 'url' && !!searchValue }
    })

    const isLoading = hashLoading || urlLoading

    // Normalize result
    const result = searchType === 'hash' ? hashResult : urlResult
    const exists = result ? result[0] : false

    // Result Parsing
    const timestamp = result ? Number(result[1]) : 0
    const owner = result ? result[2] : ''
    // Hash specific result has url at index 3, URL specific result has hash at index 3
    const contentRef = searchType === 'hash' ? (result as any)?.[3] : (result as any)?.[3]

    // Determine Match Type
    // Enum: 0 = ORIGINAL, 1 = DERIVED, 2 = DUPLICATE
    const matchTypeInt = result ? Number((result as any)[4]) : 0
    const derivedFrom = result ? (result as any)[5] : null

    const matchTypeLabel = matchTypeInt === 0 ? "ORIGINAL" : matchTypeInt === 1 ? "DERIVED" : "DUPLICATE"
    const isOriginal = matchTypeInt === 0

    const handleSearch = () => {
        const trimmed = query.trim()
        setSearchType(null)
        setSearchValue(null)

        // 1. Is it a Verification Link?
        if (trimmed.includes('/verify/')) {
            const parts = trimmed.split('/verify/')
            if (parts.length > 1 && /^0x[a-fA-F0-9]{64}$/.test(parts[1])) {
                setSearchType('hash')
                setSearchValue(parts[1])
                return
            }
        }

        // 2. Is it a direct Hash?
        if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
            setSearchType('hash')
            setSearchValue(trimmed)
            return
        }

        // 3. Is it a URL?
        if (trimmed.startsWith('http')) {
            setSearchType('url')
            setSearchValue(trimmed)
            return
        }

        alert("Invalid input. Please enter a valid URL, Content Hash (0x...), or Verification Link.")
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
                        placeholder="Paste URL (e.g. twitter.com/...) or Content Hash"
                        className="h-12 bg-slate-900/80 border-slate-800"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button size="lg" variant="premium" onClick={handleSearch} disabled={!query}>
                        <Search className="w-5 h-5" />
                    </Button>
                </div>

                {/* Results Section */}
                {searchValue && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {isLoading ? (
                            <div className="text-center text-slate-500">Scanning Flare Registry...</div>
                        ) : exists && result ? (
                            <Card className={`bg-slate-900/40 backdrop-blur-md overflow-hidden border ${isOriginal ? 'border-emerald-500/30' : 'border-amber-500/30'}`}>
                                <div className={`h-2 w-full ${isOriginal ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        {isOriginal ? <BadgeCheck className="w-8 h-8 text-emerald-400" /> : <ShieldAlert className="w-8 h-8 text-amber-400" />}
                                        <div>
                                            <CardTitle className={isOriginal ? 'text-emerald-400' : 'text-amber-400'}>
                                                {isOriginal ? 'Authentic Original Found' : matchTypeInt === 1 ? 'Derived Content Detected' : 'Duplicate Content'}
                                            </CardTitle>
                                            <p className="text-slate-400 text-sm">
                                                {isOriginal
                                                    ? "This content is the earliest known instance on-chain."
                                                    : matchTypeInt === 1
                                                        ? "This content appears to be modified/derived from an earlier source."
                                                        : "This content is an exact duplicate of an earlier stamp."}
                                            </p>
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
                                                {new Date(timestamp * 1000).toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                                            <span className="text-xs text-slate-500 uppercase">Owner Address</span>
                                            <div className="font-mono text-slate-300 text-sm break-all mt-1">
                                                {owner}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {derivedFrom && derivedFrom !== "0x0000000000000000000000000000000000000000000000000000000000000000" && (
                                            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/50">
                                                <span className="text-xs text-amber-500 uppercase font-bold">⚠️ Derived From / Linked To</span>
                                                <div className="font-mono text-xs text-amber-200 break-all mt-1">
                                                    <a href={`/verify/${derivedFrom}`} className="hover:underline flex items-center gap-1">
                                                        {derivedFrom} <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                                            <span className="text-xs text-slate-500 uppercase">Matched Content Hash</span>
                                            <div className="font-mono text-xs text-slate-400 break-all mt-1">
                                                {searchType === 'url' ? contentRef : searchValue}
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
                                        We could not find a stamp for this specific content.
                                        {searchType === 'url' && " Ensure you have stamped this exact URL."}
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
