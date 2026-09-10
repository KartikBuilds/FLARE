// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IERC20X2 {
    function transfer(address to, uint256 amount) external returns (bool);
}

/// Corrected: the return value is required to be true.
contract CorrectedSweeper {
    function sweep(IERC20X2 token, address to, uint256 amount) external {
        require(token.transfer(to, amount), "transfer failed");
    }
}
