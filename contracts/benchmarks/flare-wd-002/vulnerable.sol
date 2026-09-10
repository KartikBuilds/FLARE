// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Vulnerable: `unlocked` gates withdrawal but no function ever sets it true.
contract VulnerableLockbox {
    mapping(address => uint256) public balances;
    bool public unlocked;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(unlocked, "locked");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
