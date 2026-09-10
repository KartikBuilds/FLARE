// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Corrected: emergencyWithdraw() is not gated by the pause modifier.
contract CorrectedPausable {
    mapping(address => uint256) public balances;
    address public owner;
    bool public isPaused;

    modifier whenNotPaused() {
        require(!isPaused, "paused");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setPaused(bool value) external {
        require(msg.sender == owner, "not owner");
        isPaused = value;
    }

    function deposit() external payable whenNotPaused {
        balances[msg.sender] += msg.value;
    }

    function emergencyWithdraw() external {
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
