// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {WithdrawLibrary, VaultUsingLibrary} from "../src/demos/LibraryDestructionVault.sol";

/// FLARE-LIB-002's *static* condition (a delegatecall dependency with a
/// reachable selfdestruct and no migration path) is unchanged from the
/// Parity incident this detector was built from. But reproducing it as a
/// literal, executable "destroy the library, watch withdraw() fail" demo
/// does **not** hold on current tooling — this file documents exactly why,
/// with a real (passing) test, rather than silently deleting the demo or
/// asserting something false.
///
/// Since the Dencun upgrade (EIP-6780, March 2024), `selfdestruct` only
/// deletes an account's code when called in the *same transaction* that
/// created it — a later-transaction selfdestruct (Parity's actual
/// scenario, and this demo's) now only transfers the account's ETH
/// balance and leaves its code in place. Foundry's local EVM correctly
/// implements this, regardless of the configured `evm_version` (see
/// foundry.toml — this option no longer reverts this specific opcode
/// behavior). See docs/LIMITATIONS.md for the detector-level implication.
contract LibraryDestructionLockTest is Test {
    WithdrawLibrary internal lib;
    VaultUsingLibrary internal vault;
    address internal alice = address(0xA11CE);

    function setUp() public {
        lib = new WithdrawLibrary();
        vault = new VaultUsingLibrary(address(lib));
        vm.deal(alice, 10 ether);
    }

    function test_withdrawWorksBeforeLibraryIsDestroyed() public {
        vm.prank(alice);
        vault.deposit{value: 1 ether}();
        assertEq(vault.balances(alice), 1 ether);

        vm.prank(alice);
        vault.withdraw(1 ether);
        assertEq(alice.balance, 10 ether);
    }

    function test_postCancunSelfdestructNoLongerClearsCodeAcrossTransactions() public {
        vm.prank(alice);
        vault.deposit{value: 1 ether}();
        assertEq(address(vault).balance, 1 ether);

        uint256 ownerBalanceBefore = lib.owner().balance;
        lib.destroy();

        // The library's ETH balance still moves...
        assertEq(lib.owner().balance, ownerBalanceBefore, "library held no ETH of its own to move");
        // ...but per EIP-6780, its code is NOT removed by a later-tx selfdestruct.
        assertGt(address(lib).code.length, 0, "code remains post-Cancun (EIP-6780)");

        // Consequently, the delegatecall-based withdraw still succeeds —
        // this specific mechanism no longer bricks the vault on a chain
        // running Cancun rules or later.
        vm.prank(alice);
        vault.withdraw(1 ether);
        assertEq(alice.balance, 10 ether, "withdraw succeeded despite the 'destroyed' library");
    }
}
