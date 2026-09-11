// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Safe negative control paired with holdout-03: the same pause pattern,
/// but correctly implemented — a real unpause(), plus an owner-gated
/// emergency rescue that always works regardless of pause state. Should
/// trigger zero findings from the FLARE registry.
contract GuardedVault {
    address public owner;
    bool public paused;
    mapping(address => uint256) public balances;

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function pause() external onlyOwner {
        paused = true;
    }

    function unpause() external onlyOwner {
        paused = false;
    }

    function withdraw(uint256 amount) external {
        require(!paused, "paused");
        require(balances[msg.sender] >= amount, "insufficient");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    // Works even while paused — deliberately not blocked by the pause
    // flag, so a stuck pause state still has a working exit.
    function emergencyWithdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
