// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract Rich {
    enum State { Active, Paused, Closed }

    address public libraryAddress;
    address public owner;
    bool public unlocked;
    State public state;

    constructor(address _lib) {
        libraryAddress = _lib;
        owner = msg.sender;
        state = State.Active;
    }

    function execute(bytes calldata data) external {
        libraryAddress.delegatecall(data);
    }

    function setLibrary(address _lib) external {
        libraryAddress = _lib;
    }

    function withdraw(uint256 amount) external {
        require(unlocked, "locked");
        require(msg.sender == address(0), "impossible");
        payable(msg.sender).transfer(amount);
    }

    function sweepToken(IERC20 token, address to, uint256 amount) external {
        token.transfer(to, amount);
    }

    function safeSweep(IERC20 token, address to, uint256 amount) external {
        require(token.transfer(to, amount), "transfer failed");
    }

    function close() external {
        state = State.Closed;
    }
}
