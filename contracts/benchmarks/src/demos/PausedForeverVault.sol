// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Executable version of FLARE-REC-002: pausing was meant to stop normal
/// *operation* during an incident, but the same `whenNotPaused` modifier
/// also gates the emergency exit — so the one moment a recovery path is
/// most needed (the contract is paused, presumably because something is
/// wrong) is exactly when it's unavailable.
contract PausedForeverVault {
    mapping(address => uint256) public balances;
    address public owner;
    bool public isPaused;

    modifier whenNotPaused() {
        require(!isPaused, "paused");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setPaused(bool value) external {
        require(msg.sender == owner, "not owner");
        isPaused = value;
    }

    function deposit() external payable whenNotPaused {
        balances[msg.sender] += msg.value;
    }

    // Meant as the emergency exit — but gated by the same flag as normal
    // operation, so it provides no protection during an actual emergency.
    function emergencyWithdraw() external whenNotPaused {
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "transfer failed");
    }
}
