import hre from "hardhat";
import fs from "fs";

async function main() {
    console.log("----------------------------------------------------");
    console.log("🚀 Deploying TruthStamp System (Flare/Coston2 Architecture)...");

    // 1. Deploy Mock FDC
    const MockFDC = await hre.ethers.getContractFactory("MockFDC");
    const mockFDC = await MockFDC.deploy();
    await mockFDC.waitForDeployment();
    console.log("✅ MockFDC deployed to:", await mockFDC.getAddress());

    // 2. Deploy Mock FTSO
    const MockFTSO = await hre.ethers.getContractFactory("MockFTSO");
    const mockFTSO = await MockFTSO.deploy();
    await mockFTSO.waitForDeployment();
    console.log("✅ MockFTSO deployed to:", await mockFTSO.getAddress());

    // 3. Deploy TruthStamp with links
    const TruthStamp = await hre.ethers.getContractFactory("TruthStamp");
    // Pass the addresses of the mocks
    const truthStamp = await TruthStamp.deploy(await mockFDC.getAddress(), await mockFTSO.getAddress());
    await truthStamp.waitForDeployment();

    const address = await truthStamp.getAddress();
    console.log("----------------------------------------------------");
    console.log("✅ TruthStamp deployed successfully!");
    console.log("📍 Contract Address:", address);
    console.log("🔗 FDC Address:", await mockFDC.getAddress());
    console.log("🔗 FTSO Address:", await mockFTSO.getAddress());
    console.log("----------------------------------------------------");

    fs.writeFileSync('deployment_address.txt', address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
