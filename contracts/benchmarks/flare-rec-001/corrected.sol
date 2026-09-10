// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IERC20Rec {
    function transfer(address to, uint256 amount) external returns (bool);
}

/// Corrected: an owner-gated rescue function can recover stray tokens.
contract CorrectedVault {
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

    function rescueTokens(IERC20Rec token, address to, uint256 amount) external {
        require(msg.sender == owner, "not owner");
        require(token.transfer(to, amount), "transfer failed");
    }
}
