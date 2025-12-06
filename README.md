# TruthStamp - Anti-Fake Content Proof Engine

Hello! 👋 Welcome to TruthStamp. This is a "decentralized application" (dApp) that helps you prove that a piece of content (like a photo or news article) existed at a certain time.

We use the **Flare Network** (specifically the Coston2 testnet) to store these proofs permanently.

## 📂 Project Structure

This project has two main folders:

1.  **`contracts`**: This contains the **Smart Contract**. Think of this as the "backend database logic" that lives on the blockchain.
    *   `TruthStamp.sol`: The actual code that stores the "stamps".
2.  **`web`**: This is the **Frontend**. It is the website you see and interact with. It talks to the Smart Contract.

---

## 🚀 Quick Start Guide

**Follow these steps exactly to run the app on your computer.**

### Step 1: Install Prerequisites
First, you need to set up your environment.
👉 **[Read the Setup Guide (docs/SETUP.md)](docs/SETUP.md)** to install Node.js and set up your Wallet.

### Step 2: Set Up the Blockchain (Contracts)

Open a terminal (Command Prompt or PowerShell) and run:

```bash
cd contracts
npm install
```

Now, start a "local blockchain" simulator. This runs on your computer and is super fast for testing.
```bash
npm run chain
```
**Keep this terminal open!** It mimics the real Internet.

Open a **new** terminal window and deploy our contract to this local chain:
```bash
cd contracts
npm run deploy:local
```
You will see a message like: `TruthStamp deployed to: 0x5FbDB...`

### Step 3: Start the Website (Frontend)

Open a **third** terminal window and run:

```bash
cd web
npm install
npm run dev
```

Now, open your browser and go to: **http://localhost:3000**

🎉 You should see the TruthStamp app!

---

## 🌍 deploying to the "Real" Testnet (Coston2)

If you want to show this to friends or submit it to the Hackathon, you need to put it on the public Internet (Flare Coston2 Testnet).

1.  Make sure you followed the [Setup Guide](docs/SETUP.md) to get your Private Key and Coston2 tokens.
2.  In the `contracts` folder, create a file named `.env`.
3.  Add your private key inside: `PRIVATE_KEY=your_key_here`
4.  Run this command:
    ```bash
    npm run deploy:coston2
    ```
5.  Copy the new address (e.g., `0x123...`).
6.  Go to `web/app/stamp/page.tsx` and `web/app/verify/page.tsx` and replace `ContractAddress` with your new address.
7.  Restart your website (`Ctrl+C` then `npm run dev`).

## 🛠️ Commands Cheatsheet

**Contracts Folder:**
*   `npm run chain`: Starts local blockchain.
*   `npm run compile`: Checks your Solidity code for errors.
*   `npm run test`: Runs automated tests.
*   `npm run deploy:local`: Deploys to your local chain.
*   `npm run deploy:coston2`: Deploys to the public Flare testnet.

**Web Folder:**
*   `npm run dev`: Starts the website locally.
*   `npm run build`: Visual check if the site is ready for production.

---

*Built for the Flare Hackathon ☀️*
