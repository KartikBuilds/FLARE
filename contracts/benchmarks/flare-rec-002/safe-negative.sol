// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Safe negative control: no pause mechanism exists at all.
contract SafeVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function emergencyWithdraw() external {
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
