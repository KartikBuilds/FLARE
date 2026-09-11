// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Holds the address a router contract will delegatecall into. Structurally
/// different from FLARE-LIB-001's dev fixture (a single self-contained
/// proxy) — the vulnerable setter lives in a *separate* contract from the
/// one that performs the delegatecall.
contract Registry {
    address public executor;

    constructor(address _executor) {
        executor = _executor;
    }

    // No access control at all — anyone can repoint every router that
    // trusts this registry.
    function setExecutor(address _executor) external {
        executor = _executor;
    }
}
