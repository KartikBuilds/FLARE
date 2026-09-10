// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract Simple {
    address public owner;
    mapping(address => uint256) public balances;

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

    function destroyContract() external {
        require(msg.sender == owner, "not owner");
        selfdestruct(payable(owner));
    }
}
