// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Corrected: Consumer can migrate to a new library if the current one is
/// ever destroyed.
contract Lib2 {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function destroy() external {
        require(msg.sender == owner, "not owner");
        selfdestruct(payable(owner));
    }
}

contract MigratableConsumer {
    address public owner;
    address public lib;

    constructor(address _lib) {
        owner = msg.sender;
        lib = _lib;
    }

    function migrateLibrary(address newLib) external {
        require(msg.sender == owner, "not owner");
        lib = newLib;
    }

    function execute(bytes calldata data) external {
        lib.delegatecall(data);
    }
}
