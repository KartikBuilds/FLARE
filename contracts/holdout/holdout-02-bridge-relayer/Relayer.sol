// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// The trusted off-chain-confirmation relayer for Bridge.sol. Once
/// disabled, it can never be re-enabled or replaced — and Bridge.sol has
/// no fallback exit for deposits once this happens, since Bridge only
/// accepts release() calls from this exact address.
contract Relayer {
    address public owner;
    bool public disabled;

    constructor() {
        owner = msg.sender;
    }

    function disable() external {
        require(msg.sender == owner, "only owner");
        disabled = true;
    }

    // In production this would also submit the actual release
    // transaction to Bridge after off-chain confirmation; omitted here
    // since the fixture's point is what happens to Bridge once this
    // contract stops operating, not the confirmation logic itself.
    function confirmReceipt() external view returns (bool) {
        require(!disabled, "relayer disabled");
        return true;
    }
}
