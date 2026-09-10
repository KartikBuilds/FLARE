// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IERC20X1 {
    function transfer(address to, uint256 amount) external returns (bool);
}

/// Vulnerable: the ERC-20 transfer's return value is ignored.
contract VulnerableSweeper {
    function sweep(IERC20X1 token, address to, uint256 amount) external {
        token.transfer(to, amount);
    }
}
