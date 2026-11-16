# Percent Finance ("Perfect Finance") interest-rate-model mismatch (Ethereum, Nov 2020)

Status: **VERIFIED** (on-chain balances, verified source, on-chain call simulation, contemporaneous reporting)
True fund-lock: **YES** (permanent; old markets still revert and still hold the assets on 2026-11-16)
Proposed FLARE category: **Library Dependencies** (secondary: State Transitions; tertiary fit: Withdrawal Failures) — ambiguity recorded below

## Name resolution
The project is **Percent Finance** (PercentFinance), a Compound fork. "Perfect Finance"
is a misnaming that appears in The Block's headline; The Block's body mostly says
"Percent Finance" (and once "the Perfect Finance team"). CoinDesk and Forklog say
PercentFinance / Percent Finance. On-chain token names are "Percent Ether", "Percent USD
Coin", "Percent Wrapped BTC". The README's "Perfect Finance" entry should be renamed.

The README lists it as "Withdrawal Failures"; the conflicting description is resolved
below by the code: it is a dependency-induced permanent revert of every path.

## Summary
On 4 Nov 2020 the operator switched the USDC, WBTC and ETH markets of old cToken
contracts (Compound code compiled with solc 0.5.8) to a newer interest-rate model
(compiled with 0.5.16). The old cToken decodes `getBorrowRate` as returning two values
`(uint, uint)`; the new model returns one `uint`. Every call to `accrueInterest()` now
reverts, and every user path (mint, redeem, borrow, repay, liquidate) and the admin
setter that could undo the change call `accrueInterest()` first. The markets are bricked.

## Date
4 November 2020 (Forklog; CoinDesk "Nov. 4").

## Chain
Ethereum mainnet.

## Contract addresses (old, frozen markets)
Found via Blockscout search; matched to reported amounts by on-chain balances (2026-11-16):

| Market | Address | Contract / compiler | Underlying held 2026-11-16 | Reported |
|---|---|---|---|---|
| pETH (old) | `0x7b4a7FD41c688A7CB116534E341e44126eF5a0fd` | `CEther`, 0.5.8 | 313.711 ETH (`coin_balance`, Blockscout) | 313 ETH |
| pUSDC (old) | `0x0f69f08f872F366AD8EDdE03DAE8812619A17536` | `CErc20`, 0.5.8 | 446,813.365329 USDC (`balanceOf` on USDC via RPC) | 446K USDC |
| pWBTC (old) | `0xA5AeA6Ca2c82a058F4c495b5fB46bE4B045cCa95` | `CErc20`, 0.5.8 | 28.01596776 WBTC (`balanceOf` on WBTC via RPC) | 28 WBTC |

`interestRateModel()` (selector 0xf3fdb15a) on chain: pETH -> `0xa4a5a4e04e0dfe6c792b3b8a71e818e263ed8678`
(Blockscout-verified `WhitePaperInterestRateModelEth`, solc 0.5.16); pUSDC ->
`0x60a5d5a4499f227ee75f82946e3146b6a55531ee`; pWBTC -> `0x1f6d784f1001d9d406031869919a076c23bc210a`
(the latter two not individually inspected: UNVERIFIED that they share the one-value signature).
Newer markets (`0x45F157b3...` pETH, `0xF5D1F052...` / `0xE6642CB9...` pUSDC, 0.5.16 delegators) are
replacements and are not the locked ones.

## Verified Solidity source
Yes, for the old pETH (Blockscout: https://eth.blockscout.com/api/v2/smart-contracts/0x7b4a7FD41c688A7CB116534E341e44126eF5a0fd)
and the new model (https://eth.blockscout.com/api/v2/smart-contracts/0xa4a5a4e04e0dfe6c792b3b8a71e818e263ed8678).
Old pUSDC and pWBTC are reported verified by Blockscout (`is_smart_contract_verified: true`); source not inspected line by line.

## Code-level root cause
Old cToken (pETH source, line numbers from the Blockscout file):

```solidity
788:  function getBorrowRate(uint cash, uint borrows, uint reserves) external view returns (uint, uint);
1395: function accrueInterest() public returns (uint) {
1399:     (vars.opaqueErr, vars.borrowRateMantissa) = interestRateModel.getBorrowRate(getCashPrior(), totalBorrows, totalReserves);
1578: function redeemInternal(uint redeemTokens) internal nonReentrant returns (uint) {
1579:     uint error = accrueInterest();
2295: function _setInterestRateModel(InterestRateModel newInterestRateModel) public returns (uint) {
2296:     uint error = accrueInterest();
```

New model (Blockscout-verified source): `function getBorrowRate(uint cash, uint borrows, uint reserves) public view returns (uint)`.

Mechanism:
1. The new model returns 32 bytes; the 0.5.8 caller ABI-decodes 64 bytes and reverts.
   Confirmed on chain: `getBorrowRate(1,0,0)` on the new model returns a single word
   (`0x00..00`), and `eth_call` of `accrueInterest()` (selector 0xa6afed95) on old pETH
   returned `execution reverted` (2026-11-16).
2. `mintInternal`, `redeemInternal`, `redeemUnderlyingInternal`, `repayBorrowInternal`
   (and borrow/liquidate, same template) all call `accrueInterest()` first, so all revert.
3. The only way out, `_setInterestRateModel`, also calls `accrueInterest()` first, so
   the admin cannot switch back. `_setInterestRateModelFresh`'s only compatibility check
   is `isInterestRateModel()`, a marker that both versions satisfy; it never checks the
   `getBorrowRate` return shape.
4. The cToken is not upgradeable (plain `CEther`/`CErc20`, no delegator), so no code fix.

## Fund-lock vs exploit
True fund-lock. No attacker; an operator configuration change into an incompatible
dependency produced a state with no exit. Assets are still in the contracts six years later
(balances above). Reporting at the time: CoinDesk says the ETH has no practical recovery
path; USDC/WBTC recovery would require the token issuers (Centre, BitGo) to act off-chain,
which is outside the contract. Partial remediation (new markets, repayment schemes) was
discussed; whether any user was later compensated is UNVERIFIED and does not change the
on-chain lock.

## Amount
- On chain 2026-11-16: 313.711 ETH, 446,813.365329 USDC, 28.01596776 WBTC (sources above).
- Reported 2020: 446K USDC, 28 WBTC, 313 ETH, about $1M (CoinDesk, The Block); Forklog says about $966,000.
- Official Percent Finance post-mortem: NOT FOUND (only a 4 Nov 2020 @PercentFinance tweet is referenced by Forklog; not read).

## FLARE category (tie-break) — ambiguity recorded
- **Library Dependencies (primary, precedence 1):** the lock originates in an external
  contract (the interest-rate model) that every exit path must call and whose interface
  changed. The dependency is mutable (admin setter) and has no interface check.
- **State Transitions (secondary):** setting `interestRateModel` moves the contract into a
  state from which no function, including the setter itself, can exit. This is arguably
  the more precise description; if the owner reads "Library Dependencies" as only
  delegatecall/selfdestruct cases (as the §4.3 example suggests), this becomes primary.
  **Owner decision needed.**
- Withdrawal Failures (fits but lower precedence): redeem exists but fails persistently.

## Post-Cancun (EIP-6780)
Unaffected: no selfdestruct involved. The pattern (mandatory external call on every exit
path, including the path that replaces the dependency) applies on any EVM chain today.

## Tool detection
- **Slither 0.11.6 (tested 2026-11-16)** on the old pETH verified source, compiled with
  solc 0.5.17 (0.5.8 not installed locally). Detectors fired: `incorrect-equality`(26),
  `naming-convention`, `dead-code`, `reentrancy-events/benign/no-eth`, `uninitialized-local`,
  `erc20-interface`, `solc-version`, `missing-zero-check`, `unindexed-event-address`.
  **None identifies the lock.** Note: the bug is a cross-contract ABI mismatch that only
  appears with the deployed model; single-file static analysis of the cToken alone cannot
  see it. What is statically detectable is the *structural* precondition (see patterns.md).
- **Aderyn, Mythril, Securify:** UNVERIFIED (not tested).

## Sources (accessed 2026-11-16)
- CoinDesk: https://www.coindesk.com/percentfinance-buggy-code-froze-1m-ethereum-tokens/
- The Block: https://www.theblock.co/post/83792/user-funds-perfect-finance-frozen-code-error
- Forklog: https://forklog.com/en/percent-finance-token-plunged-after-1m-of-user-funds-were-locked/
- Blockscout search: https://eth.blockscout.com/api/v2/search?q=Percent%20Ether (and `Percent%20USDC`, `Percent%20Wrapped`)
- Old pETH source/address: https://eth.blockscout.com/api/v2/smart-contracts/0x7b4a7FD41c688A7CB116534E341e44126eF5a0fd and https://eth.blockscout.com/api/v2/addresses/0x7b4a7FD41c688A7CB116534E341e44126eF5a0fd
- New rate model source: https://eth.blockscout.com/api/v2/smart-contracts/0xa4a5a4e04e0dfe6c792b3b8a71e818e263ed8678
- On-chain RPC (`balanceOf`, `interestRateModel`, `accrueInterest` simulation): https://ethereum-rpc.publicnode.com
- USDC token `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`, WBTC token `0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599` (balanceOf targets)

## Claims the owner must be able to explain
1. Why the project is Percent Finance, not "Perfect Finance", and where the wrong name comes from.
2. How the three addresses were tied to the incident (balances matching reported amounts, compiler 0.5.8, old CEther/CErc20).
3. Why a one-value vs two-value return makes every call revert (ABI decoding in the old caller).
4. Why the admin could not just set the old model back (`_setInterestRateModel` calls `accrueInterest` first).
5. Why the primary category is Library Dependencies under the tie-break, and the open question about State Transitions.
6. Why Slither does not find it, and what part FLARE can detect statically.
