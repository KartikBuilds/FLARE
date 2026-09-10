// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IERC20X3 {
    function transfer(address to, uint256 amount) external returns (bool);
}

/// False-positive test: the return value is captured in a variable and
/// checked on the following line, rather than inline — still checked, just
/// not in the same statement as the call.
contract CapturedResultSweeper {
    function sweep(IERC20X3 token, address to, uint256 amount) external {
        bool ok = token.transfer(to, amount);
        require(ok, "transfer failed");
    }
}
