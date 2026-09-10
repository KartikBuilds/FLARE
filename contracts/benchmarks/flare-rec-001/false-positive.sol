// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// False-positive test: accepts ETH and already has a function whose name
/// matches the rescue-detector's keyword ("recoverStuckETH").
contract SelfRescuingVault {
    mapping(address => uint256) public balances;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function recoverStuckETH(address to, uint256 amount) external {
        require(msg.sender == owner, "not owner");
        payable(to).transfer(amount);
    }
}
