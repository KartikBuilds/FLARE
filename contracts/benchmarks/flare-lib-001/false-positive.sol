// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// False-positive test: delegatecalls to an address, but that address is
/// only ever set once in the constructor — there is no setter at all, so
/// it cannot be an "unprotected setter" (there is no setter).
contract ImmutableTargetProxy {
    address public implementation;

    constructor(address _implementation) {
        implementation = _implementation;
    }

    function execute(bytes calldata data) external {
        implementation.delegatecall(data);
    }
}
