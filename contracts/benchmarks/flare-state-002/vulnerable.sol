// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Vulnerable: redeem() only works in Open; lock() moves to Locked with no
/// function moving back to Open.
contract VulnerablePool {
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

    function redeem(uint256 amount) external {
        require(state == State.Open, "not open");
        shares[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
