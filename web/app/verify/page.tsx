'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ShieldAlert, BadgeCheck, Clock, ExternalLink, FileUp, Loader2, AlertTriangle, Link as LinkIcon, Hash } from 'lucide-react'
import { useReadContract } from 'wagmi'
import { keccak256, toHex } from 'viem'
import { cn } from '@/lib/utils'

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
] as const

const ContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x77409263fa088B612b004F59b37a9b94d3B121b1"

export default function VerifyPage() {
    const [query, setQuery] = useState('')
    const [searchType, setSearchType] = useState<'hash' | 'url' | 'file' | null>(null)
    const [searchValue, setSearchValue] = useState<string | null>(null) // Hash or URL
    const [perceptualHash, setPerceptualHash] = useState<string | null>(null)

    // File State
    const [isDragging, setIsDragging] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // --- Hooks ---

    // 1. Exact Content Check
    const { data: hashResult, isLoading: hashLoading } = useReadContract({
        address: ContractAddress as `0x${string}`,
        abi: ABI,
        functionName: 'verifyContent',
        args: (searchType === 'hash' || searchType === 'file') ? [searchValue as `0x${string}`] : undefined,
        query: { enabled: (searchType === 'hash' || searchType === 'file') && !!searchValue }
    })

    // 2. Exact URL Check
    const { data: urlResult, isLoading: urlLoading } = useReadContract({
        address: ContractAddress as `0x${string}`,
        abi: ABI,
        functionName: 'verifyUrl',
        args: searchType === 'url' ? [searchValue as string] : undefined,
        query: { enabled: searchType === 'url' && !!searchValue }
    })

    // 3. Similarity Check (for Files/Hashes that are NOT exact matches)
    const { data: similarityResult, isLoading: similarityLoading } = useReadContract({
        address: ContractAddress as `0x${string}`,
        abi: ABI,
        functionName: 'findSimilarStamp',
        args: perceptualHash ? [perceptualHash as `0x${string}`] : undefined,
        query: { enabled: (searchType === 'file' || searchType === 'hash') && !!perceptualHash }
    })

    const isLoading = hashLoading || urlLoading || similarityLoading

    // --- Handlers ---

    const handleSearch = () => {
        if (fileName && searchValue && perceptualHash) {
            setSearchType('file')
            return
        }

        const trimmed = query.trim()
        setFileName(null)
        setPerceptualHash(null)
        setSearchType(null)
        setSearchValue(null)

        if (trimmed.includes('/verify/')) {
            const parts = trimmed.split('/verify/')
            if (parts.length > 1 && /^0x[a-fA-F0-9]{64}$/.test(parts[1])) {
                setSearchType('hash')
                setSearchValue(parts[1])
                return
            }
        }

        if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
            setSearchType('hash')
            setSearchValue(trimmed)
            return
        }

        if (trimmed.startsWith('http')) {
            setSearchType('url')
            setSearchValue(trimmed)
            return
        }

        alert("Invalid input.")
    }

    const processFile = async (file: File) => {
        setFileName(file.name)
        setQuery('') // clear text input

        const buffer = await file.arrayBuffer()
        const fileBytes = new Uint8Array(buffer)
        const hash = keccak256(fileBytes)
        // Demo: size as pHash
        const pHash = toHex(file.size, { size: 32 })

        setSearchValue(hash)
        setPerceptualHash(pHash)
        setSearchType('file')
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files?.[0]) {
            await processFile(e.dataTransfer.files[0])
        }
    }

    // --- Logic Parsing ---

    // Exact Match?
    const exactResult = searchType === 'url' ? urlResult : hashResult
    const isExactMatch = exactResult ? exactResult[0] : false

    // Similarity Match? (Only relevant if NOT exact match)
    // similarityResult: [found, matchHash, distance, timestamp, owner]
    const isSimilarMatch = !isExactMatch && similarityResult && similarityResult[0]

    // Final Display Data
    let displayData = null
    let status: 'authentic' | 'derived' | 'none' = 'none'

    if (isExactMatch && exactResult) {
        status = 'authentic'
        displayData = {
            timestamp: Number(exactResult[1]),
            owner: exactResult[2],
            hash: searchType === 'url' ? (exactResult as any)[3] : searchValue,
            url: searchType === 'url' ? searchValue : (exactResult as any)[3]
        }
    } else if (isSimilarMatch && similarityResult) {
        status = 'derived'
        displayData = {
            timestamp: Number(similarityResult[3]),
            owner: similarityResult[4],
            hash: similarityResult[1], // The hash of the ORIGINAL
            distance: Number(similarityResult[2])
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4 font-sans">
            <div className="max-w-4xl mx-auto pt-24 pb-12">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-500">
                        Verify Truth
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Check the authenticity and provenance of digital content.
                    </p>
                </div>

                {/* Unified Search Area */}
                <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl mb-12 overflow-hidden max-w-5xl mx-auto">
                    <CardContent className="p-8 md:p-10">
                        <div className="flex flex-col md:flex-row gap-8 items-stretch">
                            {/* Input Side */}
                            <div className="flex-1 flex flex-col gap-4">
                                <label className="text-sm font-medium text-slate-300">
                                    Paste URL or Content Hash
                                </label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                                        <Input
                                            placeholder="https://... or 0x..."
                                            className="pl-10 h-12 bg-slate-900/50 border-slate-700 focus:border-teal-500 focus:ring-teal-500/20 text-base"
                                            value={query}
                                            onChange={(e) => { setQuery(e.target.value); setFileName(null); }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={handleSearch}
                                        disabled={!query && !fileName}
                                        className="h-12 px-6 bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                                    >
                                        Verify
                                    </Button>
                                </div>
                                <div className="mt-auto pt-2">
                                    <p className="text-xs text-slate-500">
                                        Supported: Direct URLs, SHA-256 Hashes, TruthStamp Links.
                                    </p>
                                </div>
                            </div>

                            {/* Divider (Desktop) */}
                            <div className="hidden md:block w-px bg-slate-800 my-2" />

                            {/* Drop Zone Side */}
                            <div className="flex-1 flex flex-col">
                                <label className="text-sm font-medium text-slate-300 mb-4 block">
                                    Verify by File
                                </label>
                                <div
                                    className={cn(
                                        "flex-1 border-2 border-dashed rounded-xl min-h-[120px] flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
                                        isDragging ? "border-teal-500 bg-teal-500/10 scale-[1.02]" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/50",
                                        fileName ? "border-teal-500/50 bg-teal-950/10" : "bg-slate-900/20"
                                    )}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
                                    <div className={cn("p-2 rounded-full mb-2 transition-colors", fileName ? "bg-teal-500/20" : "bg-slate-800")}>
                                        <FileUp className={cn("w-5 h-5", fileName ? "text-teal-400" : "text-slate-400")} />
                                    </div>
                                    <p className={cn("text-sm font-medium transition-colors text-center px-4", fileName ? "text-teal-400" : "text-slate-400")}>
                                        {fileName || "Drag & drop file here"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section */}
                {(searchValue || searchType === 'url') && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-20"
                    >
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center text-slate-500 py-12">
                                <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-500" />
                                <p>Scanning Flare Registry...</p>
                            </div>
                        ) : status !== 'none' && displayData ? (
                            <Card className={cn(
                                "backdrop-blur-md overflow-hidden border shadow-2xl transition-all max-w-4xl mx-auto",
                                status === 'authentic' ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-amber-500/30 bg-amber-950/10'
                            )}>
                                <div className={cn("h-1 w-full", status === 'authentic' ? 'bg-emerald-500' : 'bg-amber-500')} />
                                <CardHeader className="pb-6 border-b border-white/5 bg-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-3 rounded-full shrink-0", status === 'authentic' ? 'bg-emerald-500/10' : 'bg-amber-500/10')}>
                                            {status === 'authentic' ?
                                                <BadgeCheck className="w-8 h-8 text-emerald-400" /> :
                                                <AlertTriangle className="w-6 h-6 text-amber-400" />
                                            }
                                        </div>
                                        <div>
                                            <CardTitle className={cn("text-xl md:text-2xl", status === 'authentic' ? 'text-emerald-400' : 'text-amber-400')}>
                                                {status === 'authentic' ? 'Authentic Original Found' : 'Likely Derived / Edited Copy'}
                                            </CardTitle>
                                            <p className="text-slate-400 text-sm mt-1">
                                                {status === 'authentic'
                                                    ? "This content matches a registered original exactly."
                                                    : "No exact match found, but this content is highly similar to an existing original."}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Clock className="w-3 h-3" /> Original Timestamp
                                                </h4>
                                                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-lg font-mono text-slate-200">
                                                    {new Date(displayData.timestamp * 1000).toLocaleString()}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <BadgeCheck className="w-3 h-3" /> Original Owner
                                                </h4>
                                                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 font-mono text-slate-300 text-sm break-all">
                                                    {displayData.owner}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    {status === 'authentic' ? <Hash className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
                                                    {status === 'authentic' ? 'Matched Content Hash' : 'Linked Original Hash'}
                                                </h4>
                                                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 font-mono text-xs text-slate-400 break-all leading-relaxed">
                                                    {displayData.hash}
                                                </div>
                                                {status === 'derived' && (
                                                    <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded bg-amber-950/30 border border-amber-900/30 text-[10px] text-amber-500">
                                                        <span>Similarity Distance:</span>
                                                        <span className="font-mono font-bold">{displayData.distance}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-2">
                                                <Button variant="outline" className="w-full flex justify-between items-center group bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white transition-all">
                                                    View on Flare Explorer
                                                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md shadow-2xl max-w-2xl mx-auto">
                                <CardContent className="flex flex-col items-center py-16 text-center">
                                    <div className="p-4 bg-slate-800/50 rounded-full mb-6">
                                        <ShieldAlert className="w-12 h-12 text-slate-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Record Found</h3>
                                    <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                                        No exact or similar content found in the registry.
                                        This content appears to be unregistered.
                                    </p>
                                    <Button size="lg" className="bg-slate-100 text-slate-900 hover:bg-white transition-colors font-semibold" onClick={() => window.location.href = '/stamp'}>
                                        Stamp this Content
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
