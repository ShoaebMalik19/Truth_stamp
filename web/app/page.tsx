'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ShieldCheck, Clock, FileCheck } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      {/* Navigation */}
      <nav className="fixed w-full z-50 p-6 flex justify-between items-center backdrop-blur-md bg-black/10 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-teal-400 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">T</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            TruthStamp
          </span>
        </div>
        <div className="flex gap-4">
          <Link href="/verify">
            <Button variant="ghost">Verify</Button>
          </Link>
          <Link href="/stamp">
            <Button variant="premium">Start Stamping</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-[90vh] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 opacity-20 blur-3xl animate-pulse" />
          <h1 className="relative text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
            Prove It
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
              Existed First.
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-2xl text-lg text-slate-400 mb-8"
        >
          The decentralized proof-of-existence engine tailored for journalists, creators, and fact-checkers. Backed by the Flare Network.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/stamp">
            <Button size="lg" variant="premium" className="group">
              Stamp Content <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/verify">
            <Button size="lg" variant="outline" className="border-slate-700 hover:bg-slate-800">
              Verify Proof
            </Button>
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full">
          {[
            {
              icon: <Clock className="w-6 h-6 text-teal-400" />,
              title: "Immutable Timestamp",
              desc: "Anchored to Flare's FTSO for trusted network time."
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
              title: "FDC Verification",
              desc: "Proves external data validity using the Flare Data Connector."
            },
            {
              icon: <FileCheck className="w-6 h-6 text-cyan-400" />,
              title: "Permanent Record",
              desc: "Creates a lasting NFT record of your content's existence."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-teal-500/30 transition-colors backdrop-blur-sm"
            >
              <div className="mb-4 inline-block p-3 rounded-full bg-slate-900/50">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}
