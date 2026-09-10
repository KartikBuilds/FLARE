// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Vulnerable: fixed-gas-stipend native transfer with no call() fallback.
contract VulnerablePayer {
    function pay(address payable to, uint256 amount) external {
        to.transfer(amount);
    }
}
