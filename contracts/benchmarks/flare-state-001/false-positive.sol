// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// False-positive test: Closed is reachable, but reopen() transitions
/// back to Active — the state is not truly one-way/terminal.
contract ReversibleFund {
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

    function reopen() external {
        state = State.Active;
    }

    function withdraw(uint256 amount) external {
        require(state == State.Active, "closed");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
