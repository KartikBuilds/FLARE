// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// Accepts arbitrary ERC-20 deposits and lets depositors withdraw later.
/// Neither transferFrom's nor transfer's boolean return value is checked —
/// a non-reverting-on-failure token (there are real ones) silently fails
/// here, and the vault's internal accounting proceeds as if the transfer
/// succeeded, permanently desyncing recorded vs. actual balances.
contract TokenVault {
    IERC20 public immutable token;
    mapping(address => uint256) public balances;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function depositToken(uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
    }

    function withdrawToken(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient");
        balances[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
    }
}
