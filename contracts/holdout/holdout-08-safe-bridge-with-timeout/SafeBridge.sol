// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// Safe negative control paired with holdout-02: the same relayer-gated
/// release pattern, but with a timeout-based self-service fallback — if
/// the relayer never confirms within the window, the depositor can always
/// reclaim their own funds directly. Should trigger zero findings.
contract SafeBridge {
    address public relayer;
    uint256 public constant CLAIM_WINDOW = 7 days;

    struct Deposit {
        uint256 amount;
        uint256 depositedAt;
        bool released;
    }

    mapping(address => Deposit) public deposits;

    constructor(address _relayer) {
        relayer = _relayer;
    }

    function deposit() external payable {
        deposits[msg.sender] = Deposit({amount: msg.value, depositedAt: block.timestamp, released: false});
    }

    function release(address user) external {
        require(msg.sender == relayer, "only relayer");
        Deposit storage d = deposits[user];
        require(!d.released, "already released");
        d.released = true;
        payable(user).transfer(d.amount);
    }

    // Always reachable once the window elapses, regardless of whether the
    // relayer is still operating — no dependency on a third party for the
    // depositor's own funds indefinitely.
    function claimAfterTimeout() external {
        Deposit storage d = deposits[msg.sender];
        require(!d.released, "already released");
        require(block.timestamp >= d.depositedAt + CLAIM_WINDOW, "window not elapsed");
        d.released = true;
        payable(msg.sender).transfer(d.amount);
    }
}
