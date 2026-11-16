# Renzo ezETH depeg (Ethereum, April 2024)

Status: **VERIFIED as an event; NOT a fund-lock**
True fund-lock: **NO** (market depeg/liquidations while withdrawals had not yet been launched by design; no contract logic error immobilized funds)
Proposed FLARE category: **None (exclude from incident list)**. README's "State Transitions" is not supported.

## Summary
Around 23–24 April 2024, ezETH (Renzo's liquid restaking token) traded far below ETH on
DEXs after criticism of Renzo's airdrop allocation. Leveraged ezETH positions on lending
markets were liquidated. Blockworks: "the protocol has yet to enable withdrawals" and
calls it "a problem of illiquidity" rather than insolvency. Renzo had not yet shipped
redemptions; holders could exit only by selling. No source reports a contract bug.

## Date
Late April 2024 (Blockworks implies the week before 30 April 2024). Exact day UNVERIFIED from primary Renzo material.

## Chain
Ethereum mainnet.

## Contract address
ezETH token: `0xbf5495Efe5DB9ce00f80364C8B423567e58d2110` — `symbol()` returns "ezETH"
(eth_call via publicnode RPC, 2026-11-16); Blockscout: `TransparentUpgradeableProxy`,
implementation `0x9bD289b14Dd6E0782aF82eEb3FCfeed4354CDA2C` (`EzEthToken`), verified.

## Verified Solidity source
Yes (Blockscout). Not relevant to a root cause, since no code fault is reported.

## Root cause
Market/liquidity event plus a product state (withdrawals not yet launched). This is not a
code-level fund-lock. Upgradeable admin-controlled contracts could add withdrawals later,
which Renzo did (the Code4rena audit of 30 Apr–8 May 2024 covers the new WithdrawQueue).

## Fund-lock vs exploit
Neither a fund-lock nor an exploit. Strictly excluded.

## Amount
No locked amount. Liquidation totals vary in press (e.g. "$60M in liquidations", AMBCrypto headline); not used. UNVERIFIED.

## Useful by-product: published audit patterns
Code4rena's Renzo report (pre-launch audit, not the incident) contains textbook fund-lock
findings: **H-01 "Withdrawals can be locked forever if recipient is a contract"** (`claim()`
used `transfer()`, 2300 gas) and **H-03 "ETH withdrawals from EigenLayer always fail due to
OperatorDelegator's nonReentrant receive()"**. Both were mitigated before shipping. These
are used in patterns.md as published patterns, not incidents.

## Post-Cancun (EIP-6780)
Not applicable.

## Tool detection
Not applicable (no code fault).

## Sources (accessed 2026-11-16)
- Blockworks: https://www.blockworks.com/news/renzo-liquid-staked-eth
- Code4rena report 2024-04 Renzo: https://code4rena.com/reports/2024-04-renzo
- Blockscout ezETH: https://eth.blockscout.com/api/v2/smart-contracts/0xbf5495Efe5DB9ce00f80364C8B423567e58d2110
- RPC: https://ethereum-rpc.publicnode.com
- Renzo official post-mortem: NOT FOUND in this session.

## Claims the owner must be able to explain
1. Why a depeg with no withdrawals yet is not a fund-lock under FLARE's definition.
2. Why the State Transitions label is dropped.
3. That the Code4rena H-01/H-03 items are audit findings, not incidents.
