import hre from "hardhat";
import fs from "fs";

async function main() {
    console.log("----------------------------------------------------");
    console.log("🚀 Deploying TruthStamp System (Flare/Coston2 Architecture)...");

    // --- 1. Deploy Mock Dependencies ---
    // In a real mainnet environment, these contracts (FDC, FTSO) already exist on the network.
    // For local testing on Coston2, we deploy "Mock" versions if we can't access the real ones easily 
    // or want full control.

    // Deployment: Mock Flare Data Connector
    const MockFDC = await hre.ethers.getContractFactory("MockFDC");
    const mockFDC = await MockFDC.deploy();
    await mockFDC.waitForDeployment();
    const fdcAddress = await mockFDC.getAddress();
    console.log("✅ MockFDC deployed to:", fdcAddress);

    // Deployment: Mock Flare Time Series Oracle
    const MockFTSO = await hre.ethers.getContractFactory("MockFTSO");
    const mockFTSO = await MockFTSO.deploy();
    await mockFTSO.waitForDeployment();
    const ftsoAddress = await mockFTSO.getAddress();
    console.log("✅ MockFTSO deployed to:", ftsoAddress);

    // --- 2. Deploy Main TruthStamp Contract ---
    // This connects our logic to the Flare ecosystem (via the addresses above).
    const TruthStamp = await hre.ethers.getContractFactory("TruthStamp");

    // Constructor Argument 1: FDC Address
    // Constructor Argument 2: FTSO Address
    const truthStamp = await TruthStamp.deploy(fdcAddress, ftsoAddress);
    await truthStamp.waitForDeployment();

    const address = await truthStamp.getAddress();
    console.log("----------------------------------------------------");
    console.log("✅ TruthStamp deployed successfully!");
    console.log("📍 Contract Address:", address);
    console.log("🔗 FDC Address:", fdcAddress);
    console.log("🔗 FTSO Address:", ftsoAddress);
    console.log("----------------------------------------------------");

    // Save the address to a file so our frontend can read it later (if built to do so)
    fs.writeFileSync('deployment_address.txt', address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
