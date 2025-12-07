const hre = require("hardhat");

async function main() {
    const contractAddress = "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f";
    const TruthStamp = await hre.ethers.getContractFactory("TruthStamp");
    const truthStamp = await TruthStamp.attach(contractAddress);

    const [deployer] = await hre.ethers.getSigners();
    console.log("Testing with account:", deployer.address);

    const MOCK_PROOF = "0x123456";
    const MOCK_ATTESTATION_ID = "0x" + "1".repeat(64); // random bytes32

    // Test Case 1: Create ORIGINAL Stamp
    // Content A, PHash X
    const contentHashA = hre.ethers.id("Content A " + Date.now()); // Ensure unique
    const pHashX = hre.ethers.id("Perceptual X");

    console.log("\n--- Test Case 1: Stamping ORIGINAL ---");
    console.log("Content Hash:", contentHashA);
    console.log("Perceptual Hash:", pHashX);

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
        console.log("✅ Original Stamp Minter");

        // Verify
        let result = await truthStamp.verifyContent(contentHashA);
        console.log("Verification Result:", result);
        console.log("Is Original? (MatchType 0):", result.matchType === 0n);
        if (result.matchType !== 0n) console.error("❌ FAILED: Should be ORIGINAL");

    } catch (e) {
        console.error("❌ Failed to mint original:", e);
    }

    // Test Case 2: Create DERIVED Stamp
    // Content B, PHash X (Same as A)
    // We expect the contract to link it to A if we provide A as potential parent
    const contentHashB = hre.ethers.id("Content B " + Date.now());

    console.log("\n--- Test Case 2: Stamping DERIVED ---");
    console.log("Content Hash:", contentHashB);
    console.log("Perceptual Hash:", pHashX);
    console.log("Potential Parent:", contentHashA);

    try {
        let tx = await truthStamp.createStamp(
            contentHashB,
            pHashX,
            contentHashA, // Point to A
            "http://test.com/derived",
            "metadata_derived",
            MOCK_ATTESTATION_ID,
            MOCK_PROOF
        );
        await tx.wait();
        console.log("✅ Derived Stamp Minter");

        // Verify
        let result = await truthStamp.verifyContent(contentHashB);
        console.log("Is Derived? (MatchType 1):", result.matchType === 1n);
        console.log("Derived From Correctly?", result.derivedFrom === contentHashA);

        if (result.matchType !== 1n || result.derivedFrom !== contentHashA) {
            console.error("❌ FAILED: Should be DERIVED from A");
        }

    } catch (e) {
        console.error("❌ Failed to mint derived:", e);
    }

    // Test Case 3: Create DUPLICATE Stamp
    // Content A (Again)
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
        if (e.message.includes("DUPLICATE")) {
            console.log("✅ Correctly REVERTED with Duplicate error.");
        } else {
            // Hardhat error messages can be nested
            if (e.toString().includes("DUPLICATE")) {
                console.log("✅ Correctly REVERTED with Duplicate error.");
            } else {
                console.log("✅ Reverted (Expected), but message differed or was generic:", e.message);
            }
        }
    }

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
