// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// False-positive test: Lib is destructible and Consumer delegatecalls to
/// it, but Consumer already has an upgrade function — the name matches the
/// migration-detector's keyword, so this must NOT be flagged.
contract Lib4 {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function destroy() external {
        require(msg.sender == owner, "not owner");
        selfdestruct(payable(owner));
    }
}

contract UpgradableConsumer {
    address public owner;
    address public lib;

    constructor(address _lib) {
        owner = msg.sender;
        lib = _lib;
    }

    function upgradeImplementation(address newLib) external {
        require(msg.sender == owner, "not owner");
        lib = newLib;
    }

    function execute(bytes calldata data) external {
        lib.delegatecall(data);
    }
}
