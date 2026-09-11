// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// Safe negative control paired with holdout-04: the same ERC-20 vault
/// shape, but every transfer's return value is checked and reverts on
/// failure — a non-reverting-on-failure token can no longer desync this
/// vault's accounting. Should trigger zero findings.
contract SafeTokenVault {
    IERC20 public immutable token;
    mapping(address => uint256) public balances;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function depositToken(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "transferFrom failed");
        balances[msg.sender] += amount;
    }

    function withdrawToken(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient");
        balances[msg.sender] -= amount;
        require(token.transfer(msg.sender, amount), "transfer failed");
    }
}
