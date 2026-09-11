// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IERC20Like {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// Executable version of FLARE-XFER-001: withdraw() calls
/// token.transfer(...) without checking the boolean it returns. A
/// standards-compliant-but-defensive token (e.g. one with a blacklist)
/// can return `false` instead of reverting on failure — this contract
/// proceeds exactly as if the transfer succeeded either way.
contract UncheckedReturnVault {
    IERC20Like public immutable token;
    mapping(address => uint256) public balances;

    constructor(address _token) {
        token = IERC20Like(_token);
    }

    function deposit(uint256 amount) external {
        require(token.transferFrom(msg.sender, address(this), amount), "deposit transfer failed");
        balances[msg.sender] += amount;
    }

    function withdraw(uint256 amount) external {
        balances[msg.sender] -= amount;
        // Return value ignored — the vulnerability.
        token.transfer(msg.sender, amount);
    }
}

/// A token that behaves normally until frozen, then silently returns
/// false instead of reverting — modeling a real, standards-permitted
/// blacklist/pause mechanism some deployed ERC-20s actually have.
contract BlacklistableToken {
    mapping(address => uint256) public balanceOf;
    bool public frozen;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function setFrozen(bool value) external {
        frozen = value;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        if (frozen) return false;
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (frozen) return false;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
