import { expect } from "chai";
import hre from "hardhat";

describe("TruthStamp", function () {
    let truthStamp;
    let mockFDC;
    let mockFTSO;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await hre.ethers.getSigners();

        // Deploy Mocks
        const MockFDC = await hre.ethers.getContractFactory("MockFDC");
        mockFDC = await MockFDC.deploy();

        const MockFTSO = await hre.ethers.getContractFactory("MockFTSO");
        mockFTSO = await MockFTSO.deploy();

        // Deploy TruthStamp
        const TruthStamp = await hre.ethers.getContractFactory("TruthStamp");
        truthStamp = await TruthStamp.deploy(await mockFDC.getAddress(), await mockFTSO.getAddress());
    });

    it("Should create a new stamp successfully", async function () {
        const contentHash = hre.ethers.id("Unique Content");
        const pHash = hre.ethers.id("Perceptual Hash");

        await truthStamp.createStamp(
            contentHash,
            pHash,
            hre.ethers.ZeroHash,
            "http://example.com",
            "meta",
            hre.ethers.ZeroHash,
            "0x"
        );

        const result = await truthStamp.verifyContent(contentHash);
        expect(result.exists).to.equal(true);
        expect(result.owner).to.equal(owner.address);
        expect(result.matchType).to.equal(0n); // 0 = ORIGINAL
    });

    it("Should detect duplicate stamps", async function () {
        const contentHash = hre.ethers.id("Duplicate Content");
        const pHash = hre.ethers.id("Perceptual Hash");

        await truthStamp.createStamp(
            contentHash,
            pHash,
            hre.ethers.ZeroHash,
            "http://example.com",
            "meta",
            hre.ethers.ZeroHash,
            "0x"
        );

        await expect(
            truthStamp.createStamp(
                contentHash,
                pHash,
                hre.ethers.ZeroHash,
                "http://example.com",
                "meta",
                hre.ethers.ZeroHash,
                "0x12"
            )
        ).to.be.revertedWith("DUPLICATE: Content already stamped.");
    });

    it("Should valid derived content", async function () {
        const parentHash = hre.ethers.id("Parent Content");
        const pHash = hre.ethers.id("Visual Hash");

        // 1. Create Parent
        await truthStamp.createStamp(
            parentHash,
            pHash,
            hre.ethers.ZeroHash,
            "http://parent.com",
            "meta",
            hre.ethers.ZeroHash,
            "0x"
        );

        const childHash = hre.ethers.id("Child Content");

        // 2. Create Child pointing to Parent
        await truthStamp.createStamp(
            childHash,
            pHash, // Same visual hash
            parentHash,
            "http://child.com",
            "meta",
            hre.ethers.ZeroHash,
            "0x"
        );

        const result = await truthStamp.verifyContent(childHash);
        expect(result.matchType).to.equal(1n); // 1 = DERIVED
        expect(result.derivedFrom).to.equal(parentHash);
    });
});
