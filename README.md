# TruthStamp 🛡️

**A Digital Notary for the Age of AI.**

TruthStamp helps you prove that a photo, video, or file is **real** and **original**. It uses the **Flare Blockchain** to create a permanent, unchangeable record of your content.

---

## 🐣 For Complete Beginners: What is this?

Imagine you take a photo of a breaking news event. How do you prove you took it *first*, and that nobody edited it?

**TruthStamp** solves this:
1.  **You upload your file.** we create a unique digital fingerprint (called a "Hash").
2.  **We stamp it on the Blockchain.** This is like a public, digital stone tablet. Once written, it can never be changed.
3.  **Proof of Originality.** If someone else tries to upload a cropped or edited version of your photo later, TruthStamp will say: *"Wait! This looks like a copy of [Your Name]'s photo from yesterday."*

---

## 🛠️ The Tech Stack (What we used to build it)

We used modern, industry-standard tools to build this demo.

### 🖥️ Frontend (The Website)
*   **[Next.js 16](https://nextjs.org/)**: The framework used to build the website (React-based). It makes the app fast and SEO-friendly.
*   **[TypeScript](https://www.typescriptlang.org/)**: A version of JavaScript that helps catch errors early.
*   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for styling the beautiful, dark-themed UI.
*   **[Shadcn/UI](https://ui.shadcn.com/)**: A collection of re-usable components (buttons, cards, inputs) that look professional.
*   **[Framer Motion](https://www.framer.com/motion/)**: Used for the smooth animations and transitions you see.
*   **[Wagmi](https://wagmi.sh/) & [Viem](https://viem.sh/)**: The "bridge" libraries that let our website talk to your crypto wallet and the blockchain.

### ⛓️ Backend (The Blockchain)
*   **[Flare Network (Coston2 Testnet)](https://flare.network/)**: The blockchain we use. It's fast, low-cost, and has built-in data verification.
*   **[Solidity](https://soliditylang.org/)**: The programming language for writing "Smart Contracts" (the logic that runs on the blockchain).
*   **[Hardhat](https://hardhat.org/)**: A development environment for compiling, testing, and deploying our smart contracts.

---

## 🎮 Demo Mode Features

Current version includes specific features for presentation stability:

1.  **Strict "Original" Check**: For the demo, we use a special hashing method to ensure new uploads are treated as distinct originals.
2.  **"Derived" Simulation**: To show how we catch fakes, you can upload a file with the **same filename** but slightly modified content. The system will flag it as "Derived".
3.  **Demo Lock**: Stamping is restricted to a specific official sample image (`demo_sample.svg`) to ensure a predictable flow during live presentations.

---

## 🚀 How to Run (Step-by-Step)

### 1. Requirements
*   **Node.js** (Software to run JavaScript).
*   **Metamask Wallet** (Browser Extension) with some **Coston2 Testnet Tokens** (You can get these for free from the Flare Faucet).

### 2. Setup
Clone the project and install dependencies:

```bash
# 1. Download the code
git clone https://github.com/your-username/TruthStamp.git
cd TruthStamp

# 2. Setup the Smart Contracts
cd contracts
npm install
# (Optional) Deploy contracts if needed: 
# npx hardhat run scripts/deploy.js --network coston2

# 3. Setup the Website
cd ../web
npm install
```

### 3. Run It
```bash
# Inside the 'web' folder:
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

*Built for the Flare Network Hackathon.*
