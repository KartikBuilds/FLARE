// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Vulnerable: accepts ETH but has no rescue/sweep/recover function.
contract VulnerableVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
