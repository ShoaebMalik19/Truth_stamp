'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle2, AlertCircle, Link as LinkIcon, FileUp } from 'lucide-react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useConnect, useSwitchChain } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { keccak256, toHex } from 'viem'

// --- Contract ABI ---
// --- Contract ABI ---
const ABI = [
    {
        "inputs": [
            { "internalType": "bytes32", "name": "_contentHash", "type": "bytes32" },
            { "internalType": "string", "name": "_sourceUrl", "type": "string" },
            { "internalType": "string", "name": "_metadata", "type": "string" },
            { "internalType": "bytes32", "name": "_attestationId", "type": "bytes32" },
            { "internalType": "bytes", "name": "_proof", "type": "bytes" }
        ],
        "name": "createStamp",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const

const ContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xe2e255dc2111Fc3711F17e9bE39ed903150c9E48"

import { cn, copyToClipboard } from '@/lib/utils'

export default function StampPage() {
    const { isConnected, chain } = useAccount()
    const { connect } = useConnect()
    const { switchChain } = useSwitchChain()

    const [step, setStep] = useState(1)
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [hash, setHash] = useState<string | null>(null)
    const [error, setError] = useState('')

    // FDC State
    const [attestationStatus, setAttestationStatus] = useState<'idle' | 'requesting' | 'verified'>('idle')

    // File upload state
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState<string | null>(null)

    const { data: hashTx, writeContract, isPending: isWritePending, error: writeError } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: hashTx,
    })

    // Handle File Selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileName(file.name)
        setLoading(true)
        setError('')

        try {
            const buffer = await file.arrayBuffer()
            const fileBytes = new Uint8Array(buffer)
            // Hash file content
            const demoHash = keccak256(fileBytes)

            setHash(demoHash)
            const fakeUrl = `file://${file.name}`
            setUrl(fakeUrl)

            setLoading(false)
            setStep(2)
        } catch (err) {
            console.error(err)
            setError("Failed to process file.")
            setLoading(false)
        }
    }

    const handleComputeHash = async () => {
        if (!url && !fileName) return
        setLoading(true)
        setError('')
        try {
            // Simulate fetching and hashing
            await new Promise(r => setTimeout(r, 1000))

            if (!url.startsWith('http') && !url.startsWith('file://')) {
                throw new Error("Invalid URL. It must start with http:// or https://")
            }

            // Simple client-side mock hash for URL content
            // If file was already processed, hash is already set
            if (!hash) {
                const mockHash = keccak256(toHex(url + Date.now()))
                setHash(mockHash)
            }
            setStep(2)
        } catch (err: any) {
            setError(err.message || "Failed to fetch or hash content from URL")
        } finally {
            setLoading(false)
        }
    }

    const handleStamp = async () => {
        if (!hash) return

        if (!isConnected) {
            try {
                connect({ connector: injected() })
                return
            } catch (e) {
                setError("Please connect your wallet first.")
                return
            }
        }

        // Enforce Network Switch
        const targetChainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 114)
        if (chain?.id !== targetChainId) {
            try {
                switchChain({ chainId: targetChainId })
                return // Wait for the switch to complete, user will click again
            } catch (e) {
                setError(`Please switch your wallet to the correct network (Chain ID: ${targetChainId})`)
                return
            }
        }

        try {
            // Mock FDC generation flow
            setAttestationStatus('requesting')
            // In a real app, this would call the Flare Data Connector API/Contract
            const mockAttestationId = keccak256(toHex("round1"))
            const mockProof = toHex("valid_merkle_proof")

            writeContract({
                address: ContractAddress as `0x${string}`,
                abi: ABI,
                functionName: 'createStamp',
                args: [
                    hash as `0x${string}`,
                    url,
                    JSON.stringify({ title: fileName || "Stamped Content" }),
                    mockAttestationId,
                    mockProof
                ],
                chainId: 114,
            })
            setAttestationStatus('verified')
        } catch (e) {
            console.error(e)
            setError("Transaction failed to start.")
            setAttestationStatus('idle')
        }
    }

    // Advance step and clearing error
    React.useEffect(() => {
        if (isConfirmed) setStep(3)
    }, [isConfirmed])

    React.useEffect(() => {
        if (writeError) setError("Wallet transaction failed or rejected. Make sure you have testnet tokens.")
    }, [writeError])

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 flex items-center justify-center">
            <div className="w-full max-w-xl">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 text-center"
                >
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-500">
                        Stamp Your Content
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Create an immutable proof of existence on the Flare Network.
                    </p>
                </motion.div>

                <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <div className="bg-slate-900/50 p-1 flex">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`flex-1 h-1 rounded-full mx-1 transition-all duration-500 ${step >= s ? 'bg-teal-500' : 'bg-slate-800'}`}
                            />
                        ))}
                    </div>

                    <CardHeader>
                        <CardTitle>{step === 1 ? 'Source' : step === 2 ? 'Review & Stamp' : 'Success'}</CardTitle>
                        <CardDescription>
                            {step === 1 ? 'Enter the URL or upload a file you published.'
                                : step === 2 ? 'Verify the content hash before stamping.'
                                    : 'Your content is now anchored on-chain.'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <AnimatePresence mode='wait'>
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Content URL</label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                            <Input
                                                placeholder="https://twitter.com/user/status/123..."
                                                className="pl-9"
                                                value={url}
                                                onChange={(e) => setUrl(e.target.value)}
                                                disabled={!!fileName}
                                            />
                                        </div>
                                    </div>

                                    {/* File Upload UI */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer group ${fileName ? 'border-teal-500 bg-teal-900/10' : 'border-slate-800 hover:bg-slate-800/30'}`}
                                    >
                                        <input
                                            type="file"
                                            className="hidden"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                        />
                                        <FileUp className={`mx-auto h-8 w-8 mb-2 transition-colors ${fileName ? 'text-teal-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                                        <p className="text-sm text-slate-500">
                                            {fileName ? `Selected: ${fileName}` : "Or click to upload media file"}
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/20 p-2 rounded">
                                            <AlertCircle className="w-4 h-4" /> {error}
                                        </div>
                                    )}

                                    <Button
                                        className="w-full"
                                        variant="premium"
                                        onClick={handleComputeHash}
                                        disabled={(!url && !fileName) || loading}
                                    >
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                        {loading ? 'Analyzing Content...' : 'Generate Proof Hash'}
                                    </Button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Generated SHA-256 Hash</p>
                                        <code className="text-teal-400 text-sm break-all font-mono">{hash}</code>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-slate-300">Confirmation Steps</h4>
                                        <ul className="text-sm text-slate-400 space-y-2 pl-4 list-disc">
                                            <li>Flare Data Connector (FDC) will verify URL existence.</li>
                                            <li>Current timestamp will be anchored via FTSO.</li>
                                            <li>Proof will be minted to your address.</li>
                                        </ul>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button variant="outline" className="flex-1" onClick={() => { setStep(1); setHash(null); setFileName(null); setUrl('') }}>Back</Button>
                                        <Button
                                            className="flex-1"
                                            variant="premium"
                                            onClick={handleStamp}
                                            disabled={isWritePending || isConfirming}
                                        >
                                            {isWritePending ? 'Sign Request...' : isConfirming ? 'Minting...' : !isConnected ? 'Connect Wallet' : 'Stamp on Chain'}
                                            {(isWritePending || isConfirming) && <Loader2 className="animate-spin ml-2 w-4 h-4" />}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-6"
                                >
                                    <div className="w-16 h-16 bg-teal-500/20 text-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Proof Secured!</h3>
                                    <p className="text-slate-400 mb-6">
                                        Your content has been permanently anchored to the Flare Network.
                                    </p>

                                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 mb-6">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs text-slate-500 uppercase font-semibold">Verification URL</span>
                                            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => copyToClipboard(`${window.location.origin}/verify/${hash}`)}>
                                                Copy Link
                                            </Button>
                                        </div>
                                        <div className="text-sm text-teal-400 bg-slate-900/50 p-2 rounded break-all font-mono border border-slate-800/50">
                                            {typeof window !== 'undefined' ? `${window.location.origin}/verify/${hash}` : ''}
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/50">
                                            <span className="text-xs text-slate-500 uppercase font-semibold">Content Hash</span>
                                            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => copyToClipboard(hash || '')}>
                                                Copy Hash
                                            </Button>
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono break-all">
                                            {hash}
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full" onClick={() => window.location.href = '/'}>
                                        Return Home
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
