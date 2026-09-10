// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Safe negative control: no require() conditions resembling an
/// impossible check anywhere.
contract SafeVault {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient balance");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function adminWithdraw(uint256 amount) external {
        require(msg.sender == owner, "not owner");
        payable(owner).transfer(amount);
    }
}
