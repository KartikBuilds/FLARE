// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Executable version of FLARE-LIB-001: the delegatecall target has no
/// access control, so anyone — not just an owner — can repoint it. Unlike
/// FLARE-LIB-002's demo (the library itself gets destroyed), this shows
/// the other half of the same taxonomy category: the vault's *own*
/// unguarded setter is the vulnerability, and repointing it at any
/// incompatible contract (not just a malicious one) permanently strands
/// every subsequent delegatecall-dependent withdrawal.
contract UnprotectedProxyVault {
    address public implementation; // storage slot 0
    mapping(address => uint256) public balances; // storage slot 1

    constructor(address _implementation) {
        implementation = _implementation;
    }

    // No access control at all — this is the vulnerability.
    function setImplementation(address _implementation) external {
        implementation = _implementation;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        (bool ok, ) = implementation.delegatecall(abi.encodeWithSignature("withdraw(uint256)", amount));
        require(ok, "delegatecall failed");
    }
}

/// The legitimate withdrawal logic — storage layout matches
/// UnprotectedProxyVault exactly (same two variables, same order), as any
/// real delegatecall-based logic contract must.
contract WithdrawLogic {
    address public implementation; // unused here, keeps the layout aligned
    mapping(address => uint256) public balances;

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient balance");
        balances[msg.sender] -= amount;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "transfer failed");
    }
}

/// A contract with the same function selector but incompatible logic —
/// stands in for "anyone repointed this at the wrong/broken address,"
/// which needs no malicious intent, just the missing access control.
contract BrokenLogic {
    function withdraw(uint256) external pure {
        revert("incompatible implementation");
    }
}
