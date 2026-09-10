// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Corrected: uses a call()-based transfer with an explicit success check.
contract CorrectedPayer {
    function pay(address payable to, uint256 amount) external {
        (bool success, ) = to.call{value: amount}("");
        require(success, "transfer failed");
    }
}
