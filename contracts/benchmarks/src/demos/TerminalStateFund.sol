// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Executable version of FLARE-STATE-001: once Closed, withdraw() is
/// permanently disabled with no other exit — matching the shape of the
/// Lido-on-Solana case study (see docs/case-studies), reproduced here on
/// EVM for a runnable demonstration.
contract TerminalStateFund {
    enum State {
        Active,
        Closed
    }

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
        require(state == State.Active, "fund is closed");
        require(balances[msg.sender] >= amount, "insufficient balance");
        balances[msg.sender] -= amount;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "transfer failed");
    }
}
