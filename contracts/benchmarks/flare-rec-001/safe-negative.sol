// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Safe negative control: this contract never accepts value at all, so
/// there is nothing to rescue.
contract PureRegistry {
    mapping(address => string) public names;

    function setName(string calldata name) external {
        names[msg.sender] = name;
    }
}
