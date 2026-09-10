// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Vulnerable: the withdrawal guard can never be satisfied.
contract VulnerableVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == address(0), "impossible");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
