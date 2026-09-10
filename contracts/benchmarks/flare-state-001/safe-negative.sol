// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Safe negative control: no payable function exists, so no assets can
/// ever enter regardless of state.
contract SafeRegistry {
    enum State { Active, Closed }
    State public state;
    mapping(address => uint256) public credits;

    function close() external {
        state = State.Closed;
    }

    function withdraw(uint256 amount) external {
        require(state == State.Active, "closed");
        credits[msg.sender] -= amount;
    }
}
