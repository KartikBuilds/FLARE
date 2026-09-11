// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Holds cross-chain deposits until the trusted off-chain relayer confirms
/// receipt on the other side and calls release(). If the relayer is ever
/// paused/retired (Relayer.sol) with no replacement path, every deposit
/// already sitting in this contract has no way out — a two-contract
/// missing-recovery / withdrawal-failure pattern modeled on real bridge
/// incidents, not copied from any specific one.
contract Bridge {
    address public relayer;
    mapping(address => uint256) public deposits;

    constructor(address _relayer) {
        relayer = _relayer;
    }

    function deposit() external payable {
        deposits[msg.sender] += msg.value;
    }

    function release(address user, uint256 amount) external {
        require(msg.sender == relayer, "only relayer");
        require(deposits[user] >= amount, "insufficient");
        deposits[user] -= amount;
        payable(user).transfer(amount);
    }
}
