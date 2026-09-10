// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Vulnerable: once Closed, no function can withdraw — Closed is terminal
/// (last enum value) and every exit function explicitly excludes it.
contract VulnerableFund {
    enum State { Active, Closed }
    State public state;
    mapping(address => uint256) public balances;

    constructor() {
        state = State.Active;
    }

    function deposit() external payable {
        require(state == State.Active, "not active");
        balances[msg.sender] += msg.value;
    }

    function close() external {
        state = State.Closed;
    }

    function withdraw(uint256 amount) external {
        require(state == State.Active, "closed");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
