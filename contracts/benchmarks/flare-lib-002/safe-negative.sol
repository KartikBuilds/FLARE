// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Safe negative control: no selfdestruct anywhere, and Consumer only uses
/// ordinary internal calls — no delegatecall.
contract Lib3 {
    uint256 public value;

    function setValue(uint256 v) external {
        value = v;
    }
}

contract PlainConsumer {
    Lib3 public lib;

    constructor(Lib3 _lib) {
        lib = _lib;
    }

    function relay(uint256 v) external {
        lib.setValue(v);
    }
}
