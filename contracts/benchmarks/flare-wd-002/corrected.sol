// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Corrected: an owner-gated unlock() function can set `unlocked = true`.
contract CorrectedLockbox {
    mapping(address => uint256) public balances;
    bool public unlocked;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function unlock() external {
        require(msg.sender == owner, "not owner");
        unlocked = true;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(unlocked, "locked");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
