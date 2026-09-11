// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {PausedForeverVault} from "../src/demos/PausedForeverVault.sol";

/// Executable proof for FLARE-REC-002: deposit -> owner pauses (the
/// triggering transition) -> the "emergency" exit fails for the exact
/// same reason normal withdrawal would -> no recovery exists as long as
/// the contract stays paused, which nothing forces the owner to undo.
contract PausedForeverLockTest is Test {
    PausedForeverVault internal vault;
    address internal owner = address(0xC0FFEE);
    address internal alice = address(0xA11CE);

    function setUp() public {
        vm.prank(owner);
        vault = new PausedForeverVault();
        vm.deal(alice, 10 ether);
    }

    function test_emergencyWithdrawWorksBeforePause() public {
        vm.prank(alice);
        vault.deposit{value: 2 ether}();

        vm.prank(alice);
        vault.emergencyWithdraw();

        assertEq(vault.balances(alice), 0);
        assertEq(alice.balance, 10 ether);
    }

    function test_pausingBlocksTheEmergencyExitItWasSupposedToProvide() public {
        vm.prank(alice);
        vault.deposit{value: 2 ether}();
        assertEq(address(vault).balance, 2 ether);

        vm.prank(owner);
        vault.setPaused(true);

        // The one function named "emergency" is unavailable at exactly
        // the moment a real emergency (whatever caused the pause) would
        // call for it.
        vm.prank(alice);
        vm.expectRevert("paused");
        vault.emergencyWithdraw();

        assertEq(vault.balances(alice), 2 ether, "balance recorded but unreachable while paused");
        assertEq(address(vault).balance, 2 ether, "the deposit never leaves the contract");

        // Nothing about this contract forces the owner to ever unpause —
        // recovery depends entirely on a single external actor's future
        // decision, not on any guarantee in the contract itself.
        assertTrue(vault.isPaused());
    }
}
