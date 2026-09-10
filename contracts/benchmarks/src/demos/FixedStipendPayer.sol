// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Executable version of FLARE-XFER-002 — matches the Gemholic case study's
/// mechanism (a fixed-gas-stipend transfer failing against a recipient
/// whose own logic needs more than 2300 gas), reproduced here with a
/// storage-writing receiver instead of a different execution chain, since
/// that's a reliable way to exceed the stipend on any EVM.
contract FixedStipendPayer {
    mapping(address => uint256) public owed;

    function credit(address to) external payable {
        owed[to] += msg.value;
    }

    /// The vulnerable path: forwards a fixed ~2300 gas stipend with no
    /// fallback.
    function payOut(address payable to) external {
        uint256 amount = owed[to];
        owed[to] = 0;
        to.transfer(amount);
    }

    /// The corrected path: call()-based, checked, no stipend limit.
    function payOutSafely(address payable to) external {
        uint256 amount = owed[to];
        owed[to] = 0;
        (bool sent, ) = to.call{value: amount}("");
        require(sent, "payout failed");
    }
}

/// A recipient whose receive() does real work — more than 2300 gas of it —
/// the way a smart-contract wallet or a proxy with its own bookkeeping
/// commonly does.
contract GasHungryReceiver {
    uint256 public receivedCount;
    mapping(uint256 => uint256) public log;

    receive() external payable {
        receivedCount += 1;
        // A handful of cold SSTOREs reliably exceeds a 2300 gas stipend.
        for (uint256 i = 0; i < 5; i++) {
            log[receivedCount * 10 + i] = block.number + i;
        }
    }
}
