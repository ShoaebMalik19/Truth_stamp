# TruthStamp System Architecture

## Overview
TruthStamp is a decentralized application (dApp) on the Flare Network that allows users to create immutable proofs of existence for digital content (URLs, images, news). It leverages Flare's infrastructure to anchor truth on-chain.

## High-Level Architecture

```mermaid
graph TD
    User[User / Client]
    FE[Next.js Frontend]
    SC[TruthStamp Smart Contract]
    FDC[Flare Data Connector]
    FTSO[Flare Time Series Oracle]

    User -->|Interacts| FE
    FE -->|Hashes Content| FE
    FE -->|Connects Wallet (Wagmi)| User
    FE -->|Submits Transaction| SC
    SC -->|Stores Hash & Metadata| SC
    SC -->|Emits Events| FE
```

## Technology Stack & Implementation Map

### 1. Frontend Application
**Location:** `/web`

| Technology | Purpose | Implementation Details |
| :--- | :--- | :--- |
| **Next.js 16** | Core Framework | App Router architecture (`web/app/`). Uses Turbopack for dev performance. |
| **TypeScript** | Type Safety | Used throughout the `web/` directory. |
| **Tailwind CSS** | Styling | Utility-first styling configured in `web/tailwind.config.ts` and `web/app/globals.css`. |
| **Shadcn UI** | UI Components | Reusable components (Buttons, Cards, Inputs) located in `web/components/ui/`. |
| **Framer Motion** | Animations | Used for smooth page transitions and step animations in `web/app/stamp/page.tsx`. |
| **Wagmi v2** | Web3 Hooks | Manages wallet connection, state, and contract interactions. Configured in `web/config/wagmi.ts`. |
| **Viem** | Low-level Web3 | Used for hashing (`keccak256`) and lightweight chain interactions (`web/lib/utils.ts`). |
| **TanStack Query** | Async State | Caching and state management for Wagmi hooks (`web/components/providers.tsx`). |

### 2. Blockchain & Smart Contracts
**Location:** `/contracts`

| Technology | Purpose | Implementation Details |
| :--- | :--- | :--- |
| **Solidity** | Smart Contract Lang | `contracts/contracts/TruthStamp.sol`. Defines the `createStamp` and `verifyContent` logic. |
| **Hardhat** | Dev Environment | Compiling, testing, and deploying contracts (`contracts/hardhat.config.ts`). |
| **Flare Coston2** | Testnet Network | The specific network the dApp connects to (Chain ID 114). Configured in `contracts/hardhat.config.ts` and `web/config/wagmi.ts`. |
| **Ethers.js** | Script Interaction | Used in deployment scripts (`contracts/scripts/deploy.js`). |

### 3. Key Workflows & Files

#### Wallet Connection & Network
*   **Enforcement:** The dApp strictly enforces **Flare Coston2 Testnet**.
*   **Code:** `web/config/wagmi.ts` defines the single chain `coston2`.
*   **Logic:** `web/app/stamp/page.tsx` programmatically checks `chain.id` and triggers `switchChain()` if the user is on Ethereum or elsewhere.

#### Stamping Process (Write)
*   **File:** `web/app/stamp/page.tsx`
*   **Flow:**
    1.  **Upload/Input:** User provides file or URL.
    2.  **Hashing:** Client-side SHA-256 hashing using `viem`.
    3.  **Connection:** Ensures wallet is connected to Coston2.
    4.  **Transaction:** Calls `createStamp` on the smart contract.
    5.  **Success:** Displays the resulting transaction hash and verification link.

#### Verification Process (Read)
*   **File:** `web/app/verify/page.tsx` and `web/app/verify/[id]/page.tsx`
*   **Flow:**
    1.  **Input:** Accepts 64-char Hex Hash or full Verification URL.
    2.  **Parsing:** Extracts hash from URL if needed.
    3.  **Lookup:** Calls `verifyContent` on the smart contract using Wagmi's `useReadContract`.
    4.  **Display:** Renders the timestamp, owner, and existence status directly from the blockchain state.

## Future Integrations (Flare Specific)

*   **FTSO (Flare Time Series Oracle):** Currently, the contract records `block.timestamp`. In production, this will query the FTSO Price/Time feed for a trusted decentralized timestamp.
*   **FDC (Flare Data Connector):** currently mocked or relying on user honesty for URL content. Real implementation would involve an Attestation Request to the FDC to cryptographically prove the URL content before minting.

