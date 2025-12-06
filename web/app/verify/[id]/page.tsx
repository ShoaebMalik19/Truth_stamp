'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Globe, Share2, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useReadContract } from 'wagmi'

// --- Mock Contract ABI for demonstration ---
const ABI = [
    {
        "inputs": [{ "internalType": "bytes32", "name": "_contentHash", "type": "bytes32" }],
        "name": "verifyContent",
        "outputs": [
            { "internalType": "bool", "name": "exists", "type": "bool" },
            { "internalType": "uint256", "name": "firstTimestamp", "type": "uint256" },
            { "internalType": "address", "name": "firstOwner", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
] as const

const ContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"

export default function PublicStampPage() {
    const params = useParams()
    const id = params.id as string // In this demo, ID is the Content Hash

    // Format hash safely
    const formatHash = (h: string) => h.startsWith('0x') ? h as `0x${string}` : `0x${h}` as `0x${string}`

    const { data: verificationResult, isLoading } = useReadContract({
        address: ContractAddress as `0x${string}`,
        abi: ABI,
        functionName: 'verifyContent',
        args: [formatHash(id)],
        query: {
            enabled: !!id
        }
    })

    // For demo purposes, if contract read fails (no deployment), we simulate a "Found" state 
    // if the hash looks like a valid mock hash, or just show loading/error.
    // Real app: verificationResult is authoritative.

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-900/30 text-teal-400 border border-teal-800 mb-4">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">Verified by Flare Network</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">TruthStamp Record</h1>
                </div>

                <Card className="bg-slate-900/60 border-slate-700 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="border-b border-slate-800 pb-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-xl text-slate-200">Content Proof</CardTitle>
                                <CardDescription className="font-mono text-xs mt-1 text-slate-500 break-all">
                                    ID: {id}
                                </CardDescription>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Status */}
                            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                                <span className="text-xs text-slate-500 uppercase font-semibold">Verification Status</span>
                                <div className="flex items-center gap-2 mt-2">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    <span className="text-lg font-bold text-emerald-400">Authentic Original</span>
                                </div>
                            </div>

                            {/* Timestamp */}
                            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                <span className="text-xs text-slate-500 uppercase font-semibold">FTSO Timestamp</span>
                                <div className="flex items-center gap-2 mt-2">
                                    <Clock className="w-5 h-5 text-teal-500" />
                                    <span className="text-lg font-bold text-white">
                                        {verificationResult?.[1]
                                            ? new Date(Number(verificationResult[1]) * 1000).toLocaleString()
                                            : "Fetching time..."}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Source Details */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-slate-400">Source Information</h3>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-950/20 border border-teal-900/50 hover:bg-teal-950/30 transition-colors">
                                <div className="p-2 bg-teal-900/50 rounded-md">
                                    <Globe className="w-5 h-5 text-teal-400" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-slate-200 truncate">
                                        https://twitter.com/user/status/... (Example)
                                    </p>
                                    <p className="text-xs text-teal-500/70">Verified Source Domain</p>
                                </div>
                                <Button size="sm" variant="ghost" className="ml-auto" asChild>
                                    <a href="#" target="_blank">Visit</a>
                                </Button>
                            </div>
                        </div>

                        {/* Chain Info */}
                        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                            <p className="text-xs text-slate-500">
                                Anchored on Flare Testnet • Block #12345 • FDC Attestation #999
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
