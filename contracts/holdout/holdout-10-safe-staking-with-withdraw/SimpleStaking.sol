// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Safe negative control paired with holdout-05: an ordinary staking
/// contract where every staker can always withdraw their own principal.
/// No pause, no library dependency, no unusual transfer pattern — a
/// plain "nothing wrong here" fixture. Should trigger zero findings.
contract SimpleStaking {
    mapping(address => uint256) public staked;
    uint256 public totalStaked;

    function stake() external payable {
        staked[msg.sender] += msg.value;
        totalStaked += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(staked[msg.sender] >= amount, "insufficient");
        staked[msg.sender] -= amount;
        totalStaked -= amount;
        payable(msg.sender).transfer(amount);
    }
}
