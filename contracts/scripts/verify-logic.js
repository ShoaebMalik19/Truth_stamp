import hre from "hardhat";

// This script simulates a full usage cycle of the TruthStamp contract.
// It is useful for verifying that your smart contract logic works as expected BEFORE connecting the frontend.

async function main() {
    // 1. Setup: Get the deployed contract
    // Replace this with your actual deployed address if running against Testnet
    const contractAddress = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";
    const TruthStamp = await hre.ethers.getContractFactory("TruthStamp");
    const truthStamp = await TruthStamp.attach(contractAddress);

    const [deployer] = await hre.ethers.getSigners();
    console.log("Testing with account:", deployer.address);

    // Mock Data for inputs
    const MOCK_PROOF = "0x123456";
    const MOCK_ATTESTATION_ID = "0x" + "1".repeat(64); // random bytes32

    // --- Test Case 1: Create ORIGINAL Stamp ---
    // We create a stamp for "Content A". Since it's new, it should be marked ORIGINAL.
    const contentHashA = hre.ethers.id("Content A " + Date.now()); // Ensure unique
    const pHashX = hre.ethers.id("Perceptual X");

    console.log("\n--- Test Case 1: Stamping ORIGINAL ---");
    console.log("Content Hash:", contentHashA);

    try {
        let tx = await truthStamp.createStamp(
            contentHashA,
            pHashX,
            hre.ethers.ZeroHash, // No parent known
            "http://test.com/original",
            "metadata_original",
            MOCK_ATTESTATION_ID,
            MOCK_PROOF
        );
        await tx.wait();
        console.log("✅ Original Stamp Minted");

        // Verify it was saved correctly
        let result = await truthStamp.verifyContent(contentHashA);
        if (result.matchType === 0n) { // 0 = ORIGINAL
            console.log("✅ Verified as ORIGINAL");
        } else {
            console.error("❌ FAILED: Should be ORIGINAL");
        }

    } catch (e) {
        console.error("❌ Failed to mint original:", e);
    }

    // --- Test Case 2: Create DERIVED Stamp ---
    // We create "Content B", but say it is derived from "Content A".
    // It shares the same "Perceptual Hash" (visual likeness), so it should be allowed as a DERIVATIVE.
    const contentHashB = hre.ethers.id("Content B " + Date.now());

    console.log("\n--- Test Case 2: Stamping DERIVED ---");
    console.log("Content Hash:", contentHashB);
    console.log("Potential Parent:", contentHashA);

    try {
        let tx = await truthStamp.createStamp(
            contentHashB,
            pHashX,
            contentHashA, // Point to A as the parent
            "http://test.com/derived",
            "metadata_derived",
            MOCK_ATTESTATION_ID,
            MOCK_PROOF
        );
        await tx.wait();
        console.log("✅ Derived Stamp Minted");

        // Verify
        let result = await truthStamp.verifyContent(contentHashB);
        // 1 = DERIVED
        if (result.matchType === 1n && result.derivedFrom === contentHashA) {
            console.log("✅ Verified as DERIVED from Parent");
        } else {
            console.error("❌ FAILED: Should be DERIVED from A");
        }

    } catch (e) {
        console.error("❌ Failed to mint derived:", e);
    }

    // --- Test Case 3: Create DUPLICATE Stamp ---
    // We try to stamp "Content A" AGAIN. This should fail because it already exists.
    console.log("\n--- Test Case 3: Stamping DUPLICATE ---");
    try {
        let tx = await truthStamp.createStamp(
            contentHashA,
            pHashX,
            hre.ethers.ZeroHash,
            "http://test.com/duplicate",
            "metadata_duplicate",
            MOCK_ATTESTATION_ID,
            MOCK_PROOF
        );
        await tx.wait();
        console.error("❌ FAILED: Should have reverted as DUPLICATE");
    } catch (e) {
        if (e.message.includes("DUPLICATE") || e.toString().includes("DUPLICATE")) {
            console.log("✅ Correctly REVERTED with Duplicate error.");
        } else {
            console.log("✅ Reverted (Expected), but message differed:", e.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
