// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {NeverUnlockedVault} from "../src/demos/NeverUnlockedVault.sol";

/// Executable proof for FLARE-WD-002: deposit -> `unlocked` starts false
/// and no function anywhere ever sets it true -> withdraw is unreachable
/// no matter how much time passes or how many transactions are sent.
contract NeverUnlockedLockTest is Test {
    NeverUnlockedVault internal vault;
    address internal alice = address(0xA11CE);

    function setUp() public {
        vault = new NeverUnlockedVault();
        vm.deal(alice, 10 ether);
    }

    function test_depositSucceedsWhileLocked() public {
        vm.prank(alice);
        vault.deposit{value: 2 ether}();
        assertFalse(vault.unlocked());
        assertEq(vault.balances(alice), 2 ether);
    }

    function test_withdrawStaysUnreachableNoMatterHowMuchTimePasses() public {
        vm.prank(alice);
        vault.deposit{value: 2 ether}();

        vm.prank(alice);
        vm.expectRevert("locked");
        vault.withdraw(1 ether);

        // Advance a large amount of time/blocks — proving this isn't a
        // timelock that eventually opens, just a flag nothing ever sets.
        vm.warp(block.timestamp + 365 days);
        vm.roll(block.number + 2_000_000);

        vm.prank(alice);
        vm.expectRevert("locked");
        vault.withdraw(1 ether);

        assertFalse(vault.unlocked(), "no code path in this contract ever sets it true");
        assertEq(address(vault).balance, 2 ether, "the deposit never leaves the contract");
    }
}
