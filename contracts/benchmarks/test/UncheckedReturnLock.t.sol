// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {UncheckedReturnVault, BlacklistableToken} from "../src/demos/UncheckedReturnVault.sol";

/// Executable proof for FLARE-XFER-001: deposit -> the token freezes (the
/// triggering condition — no revert, just a returned `false`) -> withdraw
/// "succeeds" (no revert, since the return value is never checked) while
/// the tokens never move -> the vault's internal accounting is now
/// permanently desynced from reality, with no function to reconcile it.
contract UncheckedReturnLockTest is Test {
    UncheckedReturnVault internal vault;
    BlacklistableToken internal token;
    address internal alice = address(0xA11CE);

    function setUp() public {
        token = new BlacklistableToken();
        vault = new UncheckedReturnVault(address(token));
        token.mint(alice, 100 ether);
    }

    function test_depositAndWithdrawWorkNormallyBeforeFreezing() public {
        vm.prank(alice);
        vault.deposit(10 ether);
        assertEq(vault.balances(alice), 10 ether);
        assertEq(token.balanceOf(address(vault)), 10 ether);

        vm.prank(alice);
        vault.withdraw(5 ether);
        assertEq(vault.balances(alice), 5 ether);
        assertEq(token.balanceOf(alice), 95 ether);
    }

    function test_frozenTokenSilentlyFailsAndPermanentlyDesyncsAccounting() public {
        vm.prank(alice);
        vault.deposit(10 ether);
        assertEq(token.balanceOf(address(vault)), 10 ether);

        // Something entirely outside the vault's control freezes the
        // token (a real blacklist/pause mechanism) — the vault has no
        // way to prevent or even detect this in advance.
        token.setFrozen(true);

        // withdraw() does NOT revert — token.transfer's `false` return is
        // never checked.
        vm.prank(alice);
        vault.withdraw(10 ether);

        // The tokens never left the vault — alice's balance is exactly
        // what it was after depositing (90 ether from her original 100),
        // unchanged by the "successful" withdraw() call.
        assertEq(token.balanceOf(address(vault)), 10 ether, "tokens are still physically in the vault");
        assertEq(token.balanceOf(alice), 90 ether, "the withdrawn amount never arrived");
        // ...but the vault's internal ledger now says she has nothing
        // left to withdraw, even after the token unfreezes.
        assertEq(vault.balances(alice), 0, "internal accounting already decremented");

        token.setFrozen(false);
        vm.prank(alice);
        vm.expectRevert(); // arithmetic underflow: balances(alice) is already 0
        vault.withdraw(1);
    }
}
