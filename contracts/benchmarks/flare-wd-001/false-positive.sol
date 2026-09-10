// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// False-positive test: checks a *different* address against address(0) —
/// a legitimate "not yet initialized" guard, not an impossible
/// msg.sender condition.
contract InitGuardVault {
    mapping(address => uint256) public balances;
    address public beneficiary;

    function setBeneficiary(address _beneficiary) external {
        require(beneficiary == address(0), "already set");
        beneficiary = _beneficiary;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
