// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Vulnerable: Consumer depends on Lib via delegatecall; Lib can be
/// destroyed, and Consumer has no way to repoint at a replacement.
contract Lib {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function destroy() external {
        require(msg.sender == owner, "not owner");
        selfdestruct(payable(owner));
    }
}

contract Consumer {
    address public lib;

    constructor(address _lib) {
        lib = _lib;
    }

    function execute(bytes calldata data) external {
        lib.delegatecall(data);
    }
}
