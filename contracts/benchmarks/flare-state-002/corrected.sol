// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Corrected: unlock() transitions Locked back to Open.
contract CorrectedPool {
    enum State { Open, Locked }
    State public state;
    mapping(address => uint256) public shares;

    constructor() {
        state = State.Open;
    }

    function deposit() external payable {
        shares[msg.sender] += msg.value;
    }

    function lock() external {
        state = State.Locked;
    }

    function unlock() external {
        state = State.Open;
    }

    function redeem(uint256 amount) external {
        require(state == State.Open, "not open");
        shares[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
