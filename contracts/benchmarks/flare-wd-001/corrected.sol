// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Corrected: the guard checks the caller has sufficient balance instead.
contract CorrectedVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
