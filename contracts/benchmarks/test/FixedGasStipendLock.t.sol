// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {FixedStipendPayer, GasHungryReceiver} from "../src/demos/FixedStipendPayer.sol";

/// Executable proof for FLARE-XFER-002: a fixed-gas-stipend transfer to a
/// recipient with nontrivial receive() logic reverts every time, while the
/// call()-based path to the same recipient succeeds.
contract FixedGasStipendLockTest is Test {
    FixedStipendPayer internal payer;
    GasHungryReceiver internal receiver;

    function setUp() public {
        payer = new FixedStipendPayer();
        receiver = new GasHungryReceiver();
        vm.deal(address(this), 10 ether);
    }

    function test_fixedStipendTransferFailsAgainstAGasHungryReceiver() public {
        payer.credit{value: 1 ether}(address(receiver));
        assertEq(payer.owed(address(receiver)), 1 ether);

        // .transfer()'s 2300 gas stipend is not enough for the receiver's
        // storage writes — the payout reverts, and the credited amount is
        // stuck in accounting limbo (already zeroed as "owed" would be in
        // a naive implementation, or — as here — the whole call reverts,
        // leaving `owed` untouched but permanently unpayable via this path).
        vm.expectRevert();
        payer.payOut(payable(address(receiver)));

        assertEq(receiver.receivedCount(), 0, "the receiver never actually got paid");
    }

    function test_callBasedPayoutSucceedsForTheSameReceiver() public {
        payer.credit{value: 1 ether}(address(receiver));

        payer.payOutSafely(payable(address(receiver)));

        assertEq(receiver.receivedCount(), 1, "the receiver's logic ran to completion");
        assertEq(address(receiver).balance, 1 ether);
        assertEq(payer.owed(address(receiver)), 0);
    }
}
