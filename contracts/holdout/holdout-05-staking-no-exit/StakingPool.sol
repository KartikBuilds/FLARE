// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// A staking pool with no user-facing withdrawal path at all — not "no
/// rescue for an unsupported asset" (FLARE-REC-001's dev fixture shape)
/// but a total absence of any exit for the pool's *primary* asset. The
/// only balance-reducing function is owner-only and burns funds rather
/// than returning them to anyone.
contract StakingPool {
    address public owner;
    mapping(address => uint256) public staked;
    uint256 public totalStaked;

    constructor() {
        owner = msg.sender;
    }

    function stake() external payable {
        staked[msg.sender] += msg.value;
        totalStaked += msg.value;
    }

    // Intended as a slashing mechanism for misbehaving stakers — but there
    // is no corresponding function anywhere that lets a staker recover
    // their own principal under normal (non-slashed) conditions.
    function slash(address staker) external {
        require(msg.sender == owner, "only owner");
        uint256 amount = staked[staker];
        staked[staker] = 0;
        totalStaked -= amount;
        // Funds remain locked in this contract — never forwarded anywhere.
    }
}
