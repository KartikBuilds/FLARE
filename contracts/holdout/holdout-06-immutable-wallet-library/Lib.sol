// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// The shared logic library every Wallet delegates to. Unlike
/// FLARE-LIB-002's dev fixture (where the vulnerability is the *proxy*
/// exposing an unprotected selfdestruct on itself), here the destructible
/// code lives in a separate library contract that multiple wallets could
/// share — closer to the real Parity multisig incident's shape, built
/// originally rather than copied.
contract Lib {
    // No access control: anyone can destroy this shared library.
    function kill() external {
        selfdestruct(payable(msg.sender));
    }

    function computeShare(uint256 total, uint256 parts) external pure returns (uint256) {
        return total / parts;
    }
}
