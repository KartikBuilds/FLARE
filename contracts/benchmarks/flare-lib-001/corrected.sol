// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Corrected: the setter is access-controlled.
contract CorrectedProxy {
    address public owner;
    address public implementation;

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address _implementation) {
        owner = msg.sender;
        implementation = _implementation;
    }

    function setImplementation(address _implementation) external onlyOwner {
        implementation = _implementation;
    }

    function execute(bytes calldata data) external {
        implementation.delegatecall(data);
    }
}
