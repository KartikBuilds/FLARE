// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// A bool-flag pause pattern (not FLARE-STATE-001's dev fixture, which
/// uses an enum) — the owner can pause() but the contract has no
/// unpause() anywhere, so once paused, withdraw() is permanently
/// unreachable while the contract still holds every depositor's balance.
contract PausableVault {
    address public owner;
    bool public paused;
    mapping(address => uint256) public balances;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function pause() external {
        require(msg.sender == owner, "only owner");
        paused = true;
    }

    function withdraw(uint256 amount) external {
        require(!paused, "paused");
        require(balances[msg.sender] >= amount, "insufficient");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
