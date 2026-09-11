// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Executable version of FLARE-WD-001: withdraw() is guarded by a
/// condition that can never be true for any real transaction — no
/// externally-originated call can ever have msg.sender == address(0), so
/// this branch is dead code that permanently blocks every withdrawal.
contract UnsatisfiableWithdrawVault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == address(0), "not authorized");
        require(balances[msg.sender] >= amount, "insufficient balance");
        balances[msg.sender] -= amount;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "transfer failed");
    }
}
