// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IFDC
 * @notice Interface for Flare Data Connector (simplified for demo)
 */
interface IFDC {
    function verifyAttestation(bytes32 _attestationId, bytes32 _dataHash, bytes calldata _proof) external view returns (bool);
}

/**
 * @title IFTSO
 * @notice Interface for Flare Time Series Oracle (simplified)
 */
interface IFTSO {
    function getCurrentPriceWithDecimals(string memory _symbol) external view returns (uint256 price, uint256 timestamp, uint256 decimals);
}

/**
 * @title TruthStamp
 * @dev A Proof-of-Existence dApp on Flare Network.
 * Integrates FDC for content provenance and FTSO for trusted timestamping.
 */
contract TruthStamp {
    struct Stamp {
        bytes32 contentHash;      // SHA-256 hash of the content
        string sourceUrl;         // URL where content was found
        address owner;            // Who submitted this proof
        uint256 ftsoTimestamp;    // Trusted timestamp from FTSO
        bytes32 attestationId;    // FDC Attestation round/ID
        bool isVerified;          // Final verification status
        string metadata;          // Additional JSON metadata
    }

    // Contracts
    address public fdcContract;
    address public ftsoContract;

    // State
    mapping(bytes32 => Stamp) public stamps; // contentHash -> Stamp
    mapping(string => bytes32) public urlToHash; // sourceUrl -> contentHash

    event NewTruthStampCreated(
        bytes32 indexed contentHash,
        string sourceUrl,
        address indexed owner,
        uint256 indexed ftsoTimestamp
    );

    constructor(address _fdc, address _ftso) {
        fdcContract = _fdc;
        ftsoContract = _ftso;
    }

    /**
     * @notice Create a new stamp with FDC proof.
     * @param _contentHash The calculated hash of the digital content.
     * @param _sourceUrl The URL where the content lives.
     * @param _metadata Additional JSON metadata.
     * @param _attestationId The ID returned by the FDC request.
     * @param _proof Merkle proof from FDC.
     */
    function createStamp(
        bytes32 _contentHash,
        string memory _sourceUrl,
        string memory _metadata,
        bytes32 _attestationId,
        bytes calldata _proof
    ) public {
        require(stamps[_contentHash].ftsoTimestamp == 0, "Content already stamped");

        // 1. Verify Verification (FDC)
        bool fdcValid = false;
        if (fdcContract != address(0)) {
            // In a real environment, we call the FDC contract.
            // For this demo, valid proof is non-empty.
            try IFDC(fdcContract).verifyAttestation(_attestationId, _contentHash, _proof) returns (bool valid) {
                fdcValid = valid;
            } catch {
                // If call fails, check if proof is just non-empty for MVP
                 fdcValid = _proof.length > 0;
            }
        } else {
             // Allow simple stamping if FDC not configured (dev mode)
             fdcValid = true; 
        }

        require(fdcValid, "FDC Attestation Failed");

        // 2. Get Trusted Time (FTSO)
        uint256 trustedTime = block.timestamp;
        if (ftsoContract != address(0)) {
            try IFTSO(ftsoContract).getCurrentPriceWithDecimals("FLR") returns (uint256, uint256 _ts, uint256) {
                if (_ts > 0) trustedTime = _ts;
            } catch {}
        }

        // 3. Store State
        Stamp memory newStamp = Stamp({
            contentHash: _contentHash,
            sourceUrl: _sourceUrl,
            owner: msg.sender,
            ftsoTimestamp: trustedTime,
            attestationId: _attestationId,
            isVerified: true,
            metadata: _metadata
        });

        stamps[_contentHash] = newStamp;
        urlToHash[_sourceUrl] = _contentHash;

        emit NewTruthStampCreated(_contentHash, _sourceUrl, msg.sender, trustedTime);
    }

    /**
     * @notice Verify content by hash.
     */
    function verifyContent(bytes32 _contentHash) public view returns (
        bool exists,
        uint256 timestamp,
        address owner,
        string memory sourceUrl,
        bool isVerified
    ) {
        Stamp memory s = stamps[_contentHash];
        if (s.ftsoTimestamp == 0) return (false, 0, address(0), "", false);
        return (true, s.ftsoTimestamp, s.owner, s.sourceUrl, s.isVerified);
    }

    /**
     * @notice Verify content by URL.
     */
    function verifyUrl(string memory _url) public view returns (
        bool exists,
        uint256 timestamp,
        address owner,
        bytes32 contentHash
    ) {
        bytes32 h = urlToHash[_url];
        if (h == bytes32(0)) return (false, 0, address(0), bytes32(0));
        Stamp memory s = stamps[h];
        return (true, s.ftsoTimestamp, s.owner, h);
    }
}
