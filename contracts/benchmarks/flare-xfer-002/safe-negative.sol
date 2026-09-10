// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IERC20X4 {
    function transfer(address to, uint256 amount) external returns (bool);
}

/// Safe negative control: only an ERC-20 transfer, no native ETH transfer.
contract SafeTokenPayer {
    function pay(IERC20X4 token, address to, uint256 amount) external {
        require(token.transfer(to, amount), "transfer failed");
    }
}
