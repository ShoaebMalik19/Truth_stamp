// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockFDC {
    function verifyAttestation(bytes32, bytes32, bytes calldata _proof) external pure returns (bool) {
        // Return true if proof is not empty
        return _proof.length > 0;
    }
}

contract MockFTSO {
    function getCurrentPriceWithDecimals(string memory) external view returns (uint256, uint256, uint256) {
        // Return dummy price and current block timestamp
        return (1000000, block.timestamp, 5);
    }
}
