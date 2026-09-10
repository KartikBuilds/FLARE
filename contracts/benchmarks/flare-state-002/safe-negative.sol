// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Safe negative control: redeem() has no state-variable guard at all.
contract SafePool {
    mapping(address => uint256) public shares;

    function deposit() external payable {
        shares[msg.sender] += msg.value;
    }

    function redeem(uint256 amount) external {
        require(shares[msg.sender] >= amount, "insufficient");
        shares[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
