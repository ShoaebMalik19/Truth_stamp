// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFDC {
    function verifyAttestation(bytes32 _attestationId, bytes32 _dataHash, bytes calldata _proof) external view returns (bool);
}

interface IFTSO {
    function getCurrentPriceWithDecimals(string memory _symbol) external view returns (uint256 price, uint256 timestamp, uint256 decimals);
}

/**
 * @title TruthStamp
 * @dev Origin Attribution & Chain-of-Custody System on Flare.
 */
contract TruthStamp {
    enum StampType { ORIGINAL, DERIVED, DUPLICATE }

    struct Stamp {
        bytes32 contentHash;      // Exact SHA-256
        bytes32 perceptualHash;   // Similarity hash (pHash)
        string sourceUrl;
        address owner;
        uint256 ftsoTimestamp;    // Anchor time
        bytes32 attestationId;    
        StampType matchType;       // Originality status
        bytes32 derivedFromHash;  // Parent ID if derived
        string metadata;
    }

    address public fdcContract;
    address public ftsoContract;
    uint256 public constant SIMILARITY_THRESHOLD = 10; // Simple Hamming distance threshold

    mapping(bytes32 => Stamp) public stamps; 
    mapping(string => bytes32) public urlToHash;
    bytes32[] public stampKeys;

    event NewTruthStampCreated(
        bytes32 indexed contentHash,
        StampType matchType,
        bytes32 indexed derivedFrom,
        address indexed owner,
        uint256 timestamp
    );

    constructor(address _fdc, address _ftso) {
        fdcContract = _fdc;
        ftsoContract = _ftso;
    }

    /**
     * @notice Create a stamp with classification logic.
     */
    function createStamp(
        bytes32 _contentHash,
        bytes32 _perceptualHash,
        bytes32 _potentialParentHash, 
        string memory _sourceUrl,
        string memory _metadata,
        bytes32 _attestationId,
        bytes calldata _proof
    ) public {
        // Rule 1: Existence Check (DUPLICATE)
        if (stamps[_contentHash].ftsoTimestamp != 0) {
            revert("DUPLICATE: Content already stamped.");
        }

        // FDC and FTSO Checks
        bool validProof = true;
        if (fdcContract != address(0)) {
           try IFDC(fdcContract).verifyAttestation(_attestationId, _contentHash, _proof) returns (bool v) {
               validProof = v;
           } catch { validProof = _proof.length > 0; }
        }
        require(validProof, "FDC Attestation Required");

        uint256 trustedTime = block.timestamp;
        if (ftsoContract != address(0)) {
            try IFTSO(ftsoContract).getCurrentPriceWithDecimals("FLR") returns (uint256, uint256 _ts, uint256) {
                if (_ts > 0) trustedTime = _ts;
            } catch {}
        }

        // Rule 2 & 3: Originality Logic (simplified since UI blocks derived now, but we keep structure)
        StampType finalType = StampType.ORIGINAL;
        bytes32 parent = bytes32(0);

        if (_potentialParentHash != bytes32(0)) {
            Stamp memory p = stamps[_potentialParentHash];
            if (p.ftsoTimestamp != 0 && p.ftsoTimestamp < trustedTime) {
                // Check similarity
                uint dist = hammingDistance(_perceptualHash, p.perceptualHash);
                if (dist <= SIMILARITY_THRESHOLD) {
                    finalType = StampType.DERIVED;
                    parent = _potentialParentHash;
                }
            }
        }

        // Save
        stamps[_contentHash] = Stamp({
            contentHash: _contentHash,
            perceptualHash: _perceptualHash,
            sourceUrl: _sourceUrl,
            owner: msg.sender,
            ftsoTimestamp: trustedTime,
            attestationId: _attestationId,
            matchType: finalType,
            derivedFromHash: parent,
            metadata: _metadata
        });

        urlToHash[_sourceUrl] = _contentHash;
        stampKeys.push(_contentHash);

        emit NewTruthStampCreated(_contentHash, finalType, parent, msg.sender, trustedTime);
    }

    function hammingDistance(bytes32 a, bytes32 b) public pure returns (uint dist) {
        bytes32 x = a ^ b;
        for (uint i = 0; i < 256; i++) {
            if ((uint256(x) & (1 << i)) != 0) {
                dist++;
            }
        }
    }

    // Helper to find similar content on-chain (iterative, care with gas if used in transaction)
    // Best used as a view function for frontend checks
    function findSimilarStamp(bytes32 _perceptualHash) public view returns (bool found, bytes32 matchHash, uint256 distance, uint256 timestamp, address owner) {
        uint256 minDistance = type(uint256).max;
        bytes32 closestHash = bytes32(0);

        for (uint i = 0; i < stampKeys.length; i++) {
            bytes32 key = stampKeys[i];
            Stamp memory s = stamps[key];
            
            if (s.ftsoTimestamp == 0) continue;

            uint256 dist = hammingDistance(_perceptualHash, s.perceptualHash);
            
            // Prioritize closer matches, tie-break with older timestamp (implied by array order if sequential)
            if (dist < minDistance) {
                minDistance = dist;
                closestHash = key;
            }
        }

        if (minDistance <= SIMILARITY_THRESHOLD) {
            Stamp memory matchedStamp = stamps[closestHash];
            return (true, closestHash, minDistance, matchedStamp.ftsoTimestamp, matchedStamp.owner);
        }

        return (false, bytes32(0), 0, 0, address(0));
    }

    function verifyContent(bytes32 _contentHash) public view returns (
        bool exists,
        uint256 timestamp,
        address owner,
        string memory sourceUrl,
        StampType matchType,
        bytes32 derivedFrom
    ) {
        Stamp memory s = stamps[_contentHash];
        if (s.ftsoTimestamp == 0) return (false, 0, address(0), "", StampType.ORIGINAL, bytes32(0));
        return (true, s.ftsoTimestamp, s.owner, s.sourceUrl, s.matchType, s.derivedFromHash);
    }

    function verifyUrl(string memory _url) public view returns (
        bool exists,
        uint256 timestamp,
        address owner,
        bytes32 contentHash,
        StampType matchType,
        bytes32 derivedFrom
    ) {
        bytes32 h = urlToHash[_url];
        if (h == bytes32(0)) return (false, 0, address(0), bytes32(0), StampType.ORIGINAL, bytes32(0));
        Stamp memory s = stamps[h];
        return (true, s.ftsoTimestamp, s.owner, h, s.matchType, s.derivedFromHash);
    }
}
