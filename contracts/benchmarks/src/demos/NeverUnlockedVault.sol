// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Executable version of FLARE-WD-002: withdraw() requires `unlocked` to
/// be true, but no function anywhere in the contract ever sets it —
/// unlike FLARE-WD-001 (an impossible *value* comparison), the guard
/// variable itself is a perfectly satisfiable bool that simply has no
/// code path that ever flips it.
contract NeverUnlockedVault {
    bool public unlocked;
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(unlocked, "locked");
        require(balances[msg.sender] >= amount, "insufficient balance");
        balances[msg.sender] -= amount;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "transfer failed");
    }
}
