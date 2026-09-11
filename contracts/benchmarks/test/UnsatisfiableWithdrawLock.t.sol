// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {UnsatisfiableWithdrawVault} from "../src/demos/UnsatisfiableWithdrawVault.sol";

/// Executable proof for FLARE-WD-001: deposit -> the only withdrawal
/// function's guard condition can never be satisfied by any real caller
/// -> the deposit has no exit, from the very first block.
contract UnsatisfiableWithdrawLockTest is Test {
    UnsatisfiableWithdrawVault internal vault;
    address internal alice = address(0xA11CE);

    function setUp() public {
        vault = new UnsatisfiableWithdrawVault();
        vm.deal(alice, 10 ether);
    }

    function test_depositSucceeds() public {
        vm.prank(alice);
        vault.deposit{value: 2 ether}();
        assertEq(vault.balances(alice), 2 ether);
        assertEq(address(vault).balance, 2 ether);
    }

    function test_noRealCallerCanEverSatisfyTheWithdrawGuard() public {
        vm.prank(alice);
        vault.deposit{value: 2 ether}();

        vm.prank(alice);
        vm.expectRevert("not authorized");
        vault.withdraw(1 ether);

        // Not specific to Alice: no possible msg.sender for a real
        // transaction is ever the zero address, so this isn't "wrong
        // caller," it's "no caller can ever be right."
        address bob = address(0xB0B);
        vm.deal(bob, 1 ether);
        vm.prank(bob);
        vm.expectRevert("not authorized");
        vault.withdraw(0);

        assertEq(vault.balances(alice), 2 ether, "balance recorded but permanently unreachable");
        assertEq(address(vault).balance, 2 ether, "the deposit never leaves the contract");
    }
}
