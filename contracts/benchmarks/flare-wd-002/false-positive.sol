// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// False-positive test: withdraw() requires `!paused` — a negated guard
/// that defaults to *open* (paused starts false), the opposite polarity of
/// the vulnerable pattern. `paused` is also explicitly settable to true
/// elsewhere, so this isolates the test to the negation-handling logic
/// specifically. Must not be flagged.
contract PausableLockbox {
    mapping(address => uint256) public balances;
    bool public paused;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function pause() external {
        require(msg.sender == owner, "not owner");
        paused = true;
    }

    function unpause() external {
        require(msg.sender == owner, "not owner");
        paused = false;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        require(!paused, "paused");
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
