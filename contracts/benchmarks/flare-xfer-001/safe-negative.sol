// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Safe negative control: no transfer/transferFrom calls anywhere.
contract SafeCounter {
    uint256 public count;

    function increment() external {
        count += 1;
    }
}
