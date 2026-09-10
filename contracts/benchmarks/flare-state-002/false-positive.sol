// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// False-positive test: the enum declares a Locked state and redeem()
/// requires Open, but no function anywhere ever actually transitions state
/// to Locked — the "one-way transition" this detector looks for never
/// happens, so redeem() is not actually at risk.
contract UnreachableStatePool {
    enum State { Open, Locked }
    State public state;
    mapping(address => uint256) public shares;

    constructor() {
        state = State.Open;
    }

    function deposit() external payable {
        shares[msg.sender] += msg.value;
    }

    function redeem(uint256 amount) external {
        require(state == State.Open, "not open");
        shares[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
