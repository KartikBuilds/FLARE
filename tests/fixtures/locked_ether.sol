// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Accepts ETH but has no way to send it out: funds are locked forever.
contract DonationBox {
    mapping(address => uint256) public donated;

    function donate() external payable {
        donated[msg.sender] += msg.value;
    }
}
