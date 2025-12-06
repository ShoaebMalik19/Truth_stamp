# TruthStamp Setup Guide 🛠️

Welcome to **TruthStamp**! This guide will take you from zero to a working decentralized application (dApp) on the Flare Network.

**Target Audience:** Absolute Beginners. No blockchain experience required!

---

## 🏗️ Phase 1: Install Tools

Before we write code, we need to install the software that builds and runs our app.

### 1. Install Node.js (Required)
Node.js is the engine that runs our code.
1.  Go to [Node.js Official Site](https://nodejs.org/).
2.  Download the **LTS (Long Term Support)** version for Windows.
3.  Run the installer and click "Next" through the defaults.
4.  To verify, open a new Terminal (PowerShell or Command Prompt) and type:
    ```bash
    node -v
    npm -v
    ```
    If you see version numbers (e.g., `v18.17.0`), you are good!

---

## 🦊 Phase 2: Set Up MetaMask (Your Wallet)

You need a crypto wallet to interact with the blockchain. This acts as your account.

1.  **Install MetaMask**: Go to [metamask.io](https://metamask.io/) and install the browser extension for Chrome, Firefox, or Edge.
2.  **Create a Wallet**: Follow the steps to create a new wallet.
    *   ⚠️ **IMPORTANT:** Write down your **Secret Recovery Phrase** on paper. NEVER share this with anyone. Anyone with these words can steal all your funds.
3.  **Get Your Address**: Click "Account 1" at the top to copy your address (starts with `0x...`).

---

## ⚡ Phase 3: Configure Flare Testnet (Coston2)

We will use the **Coston2 Testnet**, which is a "playground" version of the Flare Network. The "money" here has no real value.

1.  Open MetaMask.
2.  Click the network dropdown (top left, usually says "Ethereum Mainnet").
3.  Click **Add Network** -> **Add a network manually**.
4.  Fill in these details exactly:
    *   **Network Name**: `Flare Coston2 Testnet`
    *   **New RPC URL**: `https://coston2-api.flare.network/ext/C/rpc`
    *   **Chain ID**: `114`
    *   **Currency Symbol**: `C2FLR`
    *   **Block Explorer URL**: `https://coston2-explorer.flare.network`
5.  Click **Save**. You are now connected to Flare!

---

## 🚰 Phase 4: Get Free Test Tokens (Faucet)

You need "gas" (fake money) to pay for transactions.

1.  Visit the [Flare Faucet](https://faucet.flare.network/coston2).
2.  Paste your wallet address (starts with `0x...`) into the box.
3.  Click **Request C2FLR**.
4.  Wait a few seconds. Check MetaMask; you should now have some C2FLR tokens!

---

## 🔑 Phase 5: Get Your Private Key (For Code)

Your code needs permission to deploy smart contracts on your behalf.

1.  Open MetaMask.
2.  Click the three dots (⋮) next to your account -> **Account Details**.
3.  Click **Show Private Key**.
4.  Enter your password.
5.  **Copy this key**. You will need it in the next step.
    *   🔴 **WARNING:** This key gives full control of your account. Do not share it.

---

## ⚙️ Phase 6: Project Configuration

Now we connect your project to your wallet.

### 1. Smart Contracts Setup
1.  Navigate to the `contracts` folder in VS Code.
2.  Create a new file named `.env`.
3.  Open `.env` and paste this:
    ```env
    PRIVATE_KEY=your_private_key_digits_from_metamask_here
    ```
    *(Replace `your_private_key...` with the actual key you copied in Phase 5).*

### 2. Frontend Setup
1.  Navigate to the `web` folder.
2.  (Optional) If we had backend secrets, we would put them here. For now, our frontend allows it to work out of the box with the default settings.

---

## 🚀 You are ready!
Go back to the main `README.md` file to see how to start the application!
