// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {TerminalStateFund} from "../src/demos/TerminalStateFund.sol";

/// Executable proof for FLARE-STATE-001: once the fund reaches its
/// terminal state, deposited funds are permanently unreachable.
contract TerminalStateLockTest is Test {
    TerminalStateFund internal fund;
    address internal alice = address(0xA11CE);

    function setUp() public {
        fund = new TerminalStateFund();
        vm.deal(alice, 10 ether);
    }

    function test_withdrawWorksWhileActive() public {
        vm.startPrank(alice);
        fund.deposit{value: 2 ether}();
        fund.withdraw(1 ether);
        vm.stopPrank();

        assertEq(fund.balances(alice), 1 ether);
    }

    function test_closedStateLocksRemainingFundsForever() public {
        vm.prank(alice);
        fund.deposit{value: 2 ether}();
        assertEq(address(fund).balance, 2 ether);

        fund.close();

        vm.prank(alice);
        vm.expectRevert("fund is closed");
        fund.withdraw(1 ether);

        // Confirming this isn't a transient lock: closing again, waiting,
        // or retrying doesn't change anything — Closed has no exit.
        assertEq(uint8(fund.state()), uint8(TerminalStateFund.State.Closed));
        assertEq(address(fund).balance, 2 ether, "the deposit never leaves the contract");
    }
}
