// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Corrected: withdrawAfterClose() remains available once Closed.
contract CorrectedFund {
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
        require(state == State.Active, "not active");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function withdrawAfterClose(uint256 amount) external {
        require(state == State.Closed, "still active");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
