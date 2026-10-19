<div align="center">

# TruthStamp 🛡️

**A digital notary for the age of AI: stamp a file's fingerprint on the Flare blockchain and prove it is the original.**

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-1e3a5f?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-0f172a?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com)
[![Solidity](https://img.shields.io/badge/Solidity_0.8.20-1a1a1a?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org)
[![Hardhat](https://img.shields.io/badge/Hardhat-1a1a1a?style=for-the-badge&logo=hardhat&logoColor=FFF100)](https://hardhat.org)
[![Flare](https://img.shields.io/badge/Flare_Coston2-2a0f1a?style=for-the-badge&logoColor=white)](https://flare.network)
[![wagmi](https://img.shields.io/badge/wagmi_+_viem-1b1b1b?style=for-the-badge&logo=ethereum&logoColor=white)](https://wagmi.sh)
[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://truth-stamp.vercel.app)

</div>

---

## ✨ Overview

How do you prove you took a photo *first*, and that nobody edited it? TruthStamp creates a permanent, tamper-proof record of your content on the **Flare Network (Coston2 testnet)**:

1. **Upload a file or paste a URL.** The browser computes a content fingerprint (hash) and a similarity fingerprint.
2. **Stamp it on-chain.** Your wallet signs a transaction that records the fingerprint, your address and a trusted timestamp.
3. **Prove originality.** Anyone can verify a file or hash later, and re-uploads of already-stamped content are rejected.

No centralized backend decides authenticity: the smart contract is the source of truth. Built for the Flare Network hackathon.

## 🚀 Features

- **Stamping:** `createStamp` stores the content hash, perceptual hash, source URL, owner, timestamp and metadata, and rejects duplicates.
- **Original vs. derived classification:** the contract compares perceptual hashes by Hamming distance and links a new stamp to its parent when it is within the similarity threshold.
- **Flare integrations:** optional FDC (Flare Data Connector) attestation check and FTSO (Flare Time Series Oracle) timestamp, with mock contracts for local testing.
- **Verification:** look up any file or hash with a free on-chain read (`verifyContent`, `verifyUrl`, `findSimilarStamp`).
- **Shareable proof pages:** `/verify/[id]` renders a public certificate for a given hash.
- **Wallet connection** via wagmi + viem, with an animated dark UI built on shadcn-style components and Framer Motion.

> **Demo simplifications:** the web app derives the perceptual hash from file name + size (or from the URL) rather than real image analysis, so treat similarity detection as a demonstration of the on-chain logic.

## 🧱 Tech Stack

| Part | Tools |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Radix/shadcn-style UI, Framer Motion, lucide-react |
| Web3 | wagmi, viem, TanStack Query |
| Contracts | Solidity 0.8.20, Hardhat, OpenZeppelin |
| Chain | Flare Coston2 testnet (chain ID 114) |

## 🗂️ Project Structure

```
.
├── contracts/
│   ├── contracts/
│   │   ├── TruthStamp.sol     # Stamping, verification, similarity logic
│   │   └── MockFlare.sol      # Mock FDC and FTSO for local testing
│   ├── scripts/               # deploy.js, verify-logic.js
│   ├── test/TruthStamp.test.js
│   └── hardhat.config.js      # coston2 network
├── web/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── stamp/             # Stamp a file or URL
│   │   └── verify/            # Verify, plus /verify/[id] proof page
│   ├── components/            # UI, wallet providers, animated backgrounds
│   ├── config/wagmi.ts        # Chain + wallet config
│   └── lib/constants.ts       # Contract address and ABI
└── CODE_EXPLANATION.md        # Beginner-friendly walkthrough of the codebase
```

## ⚡ Getting Started

### Requirements

- Node.js
- MetaMask with Coston2 testnet tokens (free from the Flare faucet)

### Smart contracts

```bash
cd contracts
npm install
npm run compile
npm test                 # run the Hardhat tests
npm run chain            # optional: local Hardhat node
npm run deploy:local     # deploy to the local node
npm run deploy:coston2   # deploy to Coston2 (needs PRIVATE_KEY)
```

`contracts/.env` (see `contracts/.env.example`): `PRIVATE_KEY`

### Web app

```bash
cd web
npm install
npm run dev
# open http://localhost:3000
```

`web/.env.local` (see `web/.env.example`): `NEXT_PUBLIC_CONTRACT_ADDRESS`, `NEXT_PUBLIC_CHAIN_ID`

For a full file-by-file tour, read [`CODE_EXPLANATION.md`](CODE_EXPLANATION.md).

## 🛣️ Roadmap

- Real perceptual hashing (image-based) in the browser instead of the demo fingerprint.

## 👤 Author

**Mohammed Shoaeb Malik** · AI & Full-Stack Developer, Bengaluru

[![GitHub](https://img.shields.io/badge/GitHub-ShoaebMalik19-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ShoaebMalik19)
