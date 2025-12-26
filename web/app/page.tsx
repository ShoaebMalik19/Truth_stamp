'use client' // This tells Next.js this component runs in the browser (interactive), not just on the server.

// --- Imports ---
// React Hooks: Tools to manage responsiveness and lifecycle of the page.
import { useState, useEffect } from 'react'

// Animation library for smooth effects (fades, slides).
import { motion, AnimatePresence } from "framer-motion"

// Custom UI components (Buttons, Logos) we built to reuse code.
import { Button } from "@/components/ui/button"

// Next.js Link: Like an <a> tag but faster because it doesn't reload the page.
import Link from "next/link"

// Icons: Beautiful SVG icons from the Lucide library.
import { ArrowRight, ShieldCheck, Clock, FileCheck, ExternalLink, ChevronDown } from "lucide-react"

// Wagmi: The library we use to talk to Ethereum/Flare wallets.
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

// A decorative background component.
import { Waves } from '@/components/Waves'

// --- Main Component Function ---
export default function LandingPage() {
  // --- Wallet Hooks ---
  // These give us the user's wallet status (connected?, address?).
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  // --- Local State ---
  // useState creates a variable (isMounted) and a setter (setIsMounted).
  // When the setter is called, the page re-renders with new data.
  const [isMounted, setIsMounted] = useState(false)

  // activeFeature tracks which of the 3 cards at the bottom is currently expanded.
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  // useEffect runs ONCE when the page loads.
  // We use this to avoid hydration errors (ensuring server and client match).
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Function to trigger wallet connection popup (MetaMask, etc.)
  const handleConnect = () => {
    connect({ connector: injected() })
  }

  // --- Rendering (The HTML) ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-teal-500/30">

      {/* --- Navigation Bar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-slate-950/80 border-b border-white/5 shadow-sm transition-all duration-300">

        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-teal-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="text-white font-bold font-mono">T</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-100">
            TruthStamp
          </span>
        </div>

        {/* Menu & Connect Button */}
        <div className="flex items-center gap-6">
          <Link href="/verify" className="hidden md:block text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Verify
          </Link>
          <Link href="/stamp" className="hidden md:block text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Start Stamping
          </Link>

          {/* Conditional Rendering: Show Address if connected, else Show Connect Button */}
          {isMounted && isConnected ? (
            <div
              className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-full pl-4 pr-2 py-1.5 transition-all hover:bg-slate-900 hover:border-slate-700 cursor-pointer group"
              onClick={() => disconnect()}
            >
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="text-teal-400">Flare Coston2</span>
                <span className="text-slate-600">·</span>
                {/* slice(0,6) shows first 6 chars of address, slice(-4) shows last 4 */}
                <span className="text-slate-300 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
            </div>
          ) : (
            <Button
              onClick={handleConnect}
              className="bg-slate-100 text-slate-900 hover:bg-white font-semibold h-9 px-4 rounded-full text-sm transition-colors"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </nav>

      {/* --- Main Hero Section --- */}
      <main className="relative flex flex-col items-center justify-center min-h-screen px-4 pt-20 overflow-hidden">
        {/* Background Animation */}
        <Waves />

        <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto text-center space-y-10">
          {/* Animated Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-8xl tracking-tight text-white leading-[1.1]">
              <span className="block font-light text-slate-200">Prove It</span>
              <span className="block font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                Existed First.
              </span>
            </h1>
            <p className="max-w-xl mx-auto text-lg text-slate-400 leading-relaxed font-light">
              The decentralized proof-of-existence engine tailored for journalists, creators, and fact-checkers.
              Backed by the Flare Network.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/stamp" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white h-12 px-8 rounded-full text-base font-semibold shadow-lg shadow-teal-900/20 transition-all hover:scale-105">
                Stamp Content <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/verify" className="w-full sm:w-auto">
              <Button size="lg" variant="ghost" className="w-full sm:w-auto text-slate-300 hover:text-white hover:bg-slate-800/50 h-12 px-8 rounded-full text-base border border-slate-800 transition-colors">
                Verify Proof
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* --- Interactive Feature Cards --- 
            We map over an array of data to create 3 similar cards without copying code 3 times.
        */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-6xl w-full px-4 pb-20">
          {[
            {
              icon: <Clock className="w-6 h-6 text-teal-400" />,
              title: "Anchored to Flare’s FTSO",
              desc: "Anchored to Flare's FTSO for trusted, decentralized network time."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
              title: "Verified via Flare Data Connector",
              desc: "Proves external data validity using the Flare Data Connector."
            },
            {
              icon: <FileCheck className="w-6 h-6 text-cyan-400" />,
              title: "On-Chain Proof of Existence",
              desc: "Creates a lasting, verifiable on-chain record of your content."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              onClick={() => setActiveFeature(activeFeature === i ? null : i)}
              className={`group relative p-6 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${activeFeature === i
                ? 'bg-slate-900/80 border-teal-500/50 shadow-xl shadow-teal-900/20'
                : 'bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/60'
                }`}
            >
              {/* Card Header */}
              <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-xl border transition-colors ${activeFeature === i ? 'bg-slate-950 border-teal-500/30' : 'bg-slate-950 border-slate-800 group-hover:border-slate-700'
                  }`}>
                  {feature.icon}
                </div>

                <div className="flex-1 text-left">
                  <h3 className={`text-lg font-semibold transition-colors ${activeFeature === i ? 'text-white' : 'text-slate-200'}`}>
                    {feature.title}
                  </h3>
                </div>

                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${activeFeature === i ? 'rotate-180 text-teal-400' : ''}`} />
              </div>

              {/* Collapsible Content */}
              <AnimatePresence>
                {activeFeature === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden relative z-10"
                  >
                    <p className="pt-4 text-slate-400 leading-relaxed text-sm text-left border-t border-white/5 mt-4">
                      {feature.desc}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Decorative Glow Effect */}
              {activeFeature === i && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent pointer-events-none"
                />
              )}
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
