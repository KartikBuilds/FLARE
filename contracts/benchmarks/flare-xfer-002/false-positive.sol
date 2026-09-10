// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// False-positive test: the function offers a call()-based fallback path
/// alongside the fixed-stipend transfer, so a recipient needing more gas
/// still has a way to get paid.
contract DualPathPayer {
    function pay(address payable to, uint256 amount, bool useCall) external {
        if (useCall) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "call failed");
        } else {
            to.transfer(amount);
        }
    }
}
