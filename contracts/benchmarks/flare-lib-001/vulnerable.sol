// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Vulnerable: anyone can repoint the delegatecall target.
contract VulnerableProxy {
    address public implementation;

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function setImplementation(address _implementation) external {
        implementation = _implementation;
    }

    function execute(bytes calldata data) external {
        implementation.delegatecall(data);
    }
}
