# TruthStamp: Complete Codebase Guide for Beginners

Welcome! This guide will take you on a tour of the **TruthStamp** project. We will break down every single part of the application, from the "Smart Contract" that lives on the blockchain to the "Web Pages" that users interact with.

---

## 🏗️ 1. Project Architecture (The Big Picture)

Imagine building a house. You need a foundation (Blockchain), a frame (Smart Contract), and the interior decoration (Website).

1.  **The Foundation (Blockchain)**: We use the **Flare Network** (specifically the Coston2 Testnet). It acts as our permanent, unbreakable database.
2.  **The Logic (Smart Contract)**: `TruthStamp.sol` is a program that runs *on* the blockchain. It follows strict rules to save "stamps" of content.
3.  **The Interface (Frontend)**: This is the website folks visit. It helps them talk to the Smart Contract without writing code themselves.

---

## 📜 2. The Smart Contract (`contracts/contracts/TruthStamp.sol`)

This is the heart of the system. Even if the website goes down, this code keeps running on the blockchain networks.

### What does it do?
It acts like a "Notary Public". You bring it a digital fingerprint (Hash) of a file, and it writes down:
*   **Who** brought it (Your Wallet Address).
*   **When** they brought it (Timestamp from Flare's Time Oracle).
*   **What** it is (The Content Hash).

### Key Functions (Explained simply)
*   `createStamp(...)`: "I want to register this file!"
    *   It checks if the file is already registered (`require(stamps[_contentHash]...)`).
    *   It asks the Flare Network to confirm the time (`IFTSO`).
    *   It saves the record permanently.
*   `verifyContent(...)`: "Do you know this file?"
    *   It looks up the Hash in its storage.
    *   If found, it returns the Timestamp and Owner.
*   `findSimilarStamp(...)`: "Do you know anything *like* this file?"
    *   Uses "Hamming Distance" math to find files that look similar (e.g., a resized image). This helps detect fakes or stolen content!

---

## 💻 3. The Web Application (`web/app/`)

We built the website using **Next.js** (a framework for React). Here is every file you need to know:

### A. The "Shell" (`web/app/layout.tsx` & `globals.css`)
*   `layout.tsx`: This is the master template. Every page on the site sits *inside* this file. It sets up the fonts (`Geist`) and the wallet connection tools (`Providers`).
*   `globals.css`: The paint and wallpaper. It defines the colors (Dark Mode slate/teal), fonts, and custom styles like the glass-effect panels.

### B. The Home Page (`web/app/page.tsx`)
*   **URL**: `http://localhost:3000/`
*   **Job**: To look cool and explain the product.
*   **Code Magic**: Uses `framer-motion` to make text fade in and slide up. It links users to the two main tools: Stamping and Verifying.

### C. The Stamping Tool (`web/app/stamp/page.tsx`)
*   **URL**: `http://localhost:3000/stamp`
*   **Job**: To upload files.
*   **How it works**:
    1.  **User Input**: You upload a `cat.jpg` or paste a URL.
    2.  **Hashing**: The browser calculates a `SHA-256` hash (a unique string like `0xabc123...`).
    3.  **Wallet Sign**: You click "Stamp", and your crypto wallet pops up.
    4.  **Transaction**: The app sends the Hash to the `TruthStamp.sol` contract using `writeContract`.

### D. The Verification Tool (`web/app/verify/page.tsx`)
*   **URL**: `http://localhost:3000/verify`
*   **Job**: To check if a file is real.
*   **How it works**:
    1.  **User Input**: You paste a Hash or drop a file.
    2.  **Blockchain Read**: The app uses `useReadContract` to look inside the Smart Contract's storage *without* paying gas fees (because reading is free!).
    3.  **Result**: It tells you "Authentic Original" (Green) or "Unknown/Fake" (Red).

### E. The Public Proof Page (`web/app/verify/[id]/page.tsx`)
*   **URL**: `http://localhost:3000/verify/0x123...`
*   **Job**: A sharable certificate. You can send this link to anyone to prove you own a file.
*   **Code Magic**: It pulls the `[id]` (the hash) from the URL and automatically runs the verification check.

### F. Constants (`web/lib/constants.ts`)
*   **Job**: The "Single Source of Truth".
*   **Why**: Instead of copying the Smart Contract Address and ABI into 3 different files, we keep them here. If we re-deploy the contract, we only update this one file!

---

## 🛠️ 4. Key Terminology for Beginners

| Term | Meaning in TruthStamp |
| :--- | :--- |
| **Hash** | A digital fingerprint. If you change one pixel in an image, this fingerprint changes completely. We store the Hash, not the image itself. |
| **Smart Contract** | A robot that lives on the blockchain. It follows the rules we wrote in `TruthStamp.sol` and cannot be bribed or stopped. |
| **Wallet (wagmi)** | Your digital keychain. It allows the website to prove who you are and pay for the "Stamping" fee. |
| **Timestamp (FTSO)** | A trusted clock provided by the Flare Network. It proves *exactly* when you stamped your content. |

---

## 🚀 5. Deployment Guide (How to put this on the internet)

So you want to share this with the world? Here is the plan:

### Step 1: Deploy the Smart Contract
1.  You need a wallet with "Coston2 Flare" (Testnet tokens).
2.  Run `npx hardhat run scripts/deploy.js --network coston2`.
3.  This will give you a new **Contract Address**.
4.  Update `web/lib/constants.ts` with this new address.

### Step 2: Deploy the Website (Free & Automatic)
We recommend using **Vercel** (the creators of Next.js).
1.  Push your code to **GitHub**.
2.  Go to [Vercel.com](https://vercel.com) and import your GitHub repo.
3.  Vercel will detect it is a Next.js app and build it automatically.
4.  It gives you a free `https://truthstamp.vercel.app` domain!

### Step 3: Verify
*   Open your new Vercel link.
*   Connect your wallet.
*   Stamp something! It works exactly like it did on localhost, but now anyone can see it.

