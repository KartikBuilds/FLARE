# FLARE detectable fund-lock patterns (research step R1, 2026-11-16)

Input: research/incidents/*.md. Verified permanent EVM fund-locks: **Parity** and
**Percent Finance**. Gemholic (temporary, no source), Lido stSOL (Solana, temporary) and
Renzo ezETH (not a lock) give no usable incident, so the categories State Transitions,
Transfer Logic, Withdrawal Failures and Missing Recovery use published patterns.

Each pattern: primary category by the spec §4.2 tie-break; origin; matches; must NOT match;
post-Cancun; existing tool coverage.

---

## P1 — Library Dependencies: value held behind delegatecall to code the holder does not control
Origin: **incident-derived** (Parity, research/incidents/parity-multisig-library.md).

Matches: a contract that can receive ETH (payable function/receive/fallback) or is a token
holder, where **every** function that sends value out (`call{value}`, `transfer`, `send`,
token `transfer`) is reachable only via `delegatecall`, and the delegatecall target is a
constant, immutable, or storage address that the contract cannot replace through its own code,
or whose target contract has a reachable `selfdestruct` or an unguarded/re-callable initializer.

Must NOT match:
- a contract with its own direct withdrawal path that does not go through `delegatecall`;
- a delegatecall router that cannot hold ETH (no payable entry) — spike negative case;
- standard upgradeable proxies (EIP-1967/UUPS) where the implementation is replaceable by an
  admin path that itself does not depend on the target (report lower severity, not a lock).

Post-Cancun: exact selfdestruct-deletes-library path closed on mainnet (EIP-6780); pattern
still applies for re-pointable/empty targets, same-tx create+destroy, and non-6780 chains.

Tools: Slither 0.11.6 tested on Parity library: `suicidal` fires on `kill`; nothing reports
dependent wallets' funds as stuck. Spike (§4.11): stock Slither does not flag the lock.
Aderyn/Mythril/Securify: UNVERIFIED.

## P2 — Library Dependencies (secondary: State Transitions): mandatory external dependency on every exit path, including its own replacement
Origin: **incident-derived** (Percent Finance, research/incidents/percent-finance.md).

Matches: a value-holding contract with a storage address `D` (settable by admin) such that
(a) every withdrawal/redeem function makes an external call through `D` (directly or via an
internal function like `accrueInterest()`) whose failure reverts or returns early, and
(b) the setter that writes `D` *also* calls through `D` before writing it. Then a bad `D`
leaves no exit. Severity higher when the setter validates `D` only with a marker
(`isInterestRateModel()`), not the interface actually used.

Must NOT match:
- setters that write `D` without first calling through `D` (escape hatch exists);
- calls through `D` wrapped in `try/catch` or checked low-level calls with a fallback path;
- `D` immutable and audited code paths with no setter (that is a different risk, not this pattern);
- contracts with an independent emergency withdrawal not depending on `D`.

Tie-break note: owner to confirm Library Dependencies vs State Transitions as primary (see incident file).

Post-Cancun: unaffected.

Tools: Slither 0.11.6 on old Percent pETH source: no relevant detector fires. Aderyn/Mythril/Securify: UNVERIFIED.

## P3 — State Transitions: state machine with an absorbing state that holds funds
Origin: **published-pattern**. Source: spec §4.3 example and the general "excessive
restriction"/state-machine guidance, e.g. Conflux docs "Excessive restriction"
(https://doc.confluxnetwork.org/docs/general/build/smart-contracts/contract-security/excessive-restriction, found via search, not read in full: UNVERIFIED wording).
Percent Finance (P2) is a real-world instance as secondary category.

Matches: an enum/bool state variable `S` gating all asset-sending functions via `require(S == X)`,
where some reachable assignment sets `S` to a value `Y` from which no function (a) sends
assets out under `Y` or (b) can change `S` away from `Y`.

Must NOT match: states with a refund/withdraw function allowed in that state; terminal states
reached only after balances are provably zero (e.g. `Finalized` set inside the last payout);
states that a time-based or admin transition can leave.

Post-Cancun: unaffected.  Tools: no known stock Slither/Aderyn detector; UNVERIFIED for all four.

## P4 — Transfer Logic: fixed-stipend ETH sends (`transfer`/`send`) on the only payout path
Origin: **published-pattern**. Source: Code4rena Renzo 2024-04 report, H-01 "Withdrawals can
be locked forever if recipient is a contract" (https://code4rena.com/reports/2024-04-renzo);
illustrated by Gemholic (temporary, zkSync Era, research/incidents/gemholic.md).
Second sub-pattern (same category, published): ERC20 `transfer`/`transferFrom` return value
ignored while internal accounting is updated — Slither `unchecked-transfer`
("The return value of an external transfer/transferFrom call is not checked", detector metadata in slither 0.11.6).

Matches: the only function(s) moving ETH to a user-chosen or stored recipient use
`.transfer()`/`.send()` (2300 gas) with no alternative path (e.g. pull with `call{value:}`,
or a recipient-change function); severity up if the recipient can be a contract (msg.sender
recorded at deposit, no EOA check).

Must NOT match: `call{value:}` with checked success; `transfer` to a hard-coded EOA/owner
where an alternative recovery exists; `Address.sendValue` (OpenZeppelin).

Post-Cancun: unaffected; risk persists with gas repricing and non-equivalent L2s.
Tools: Slither `unchecked-transfer` covers the ERC20 sub-pattern (not tested here). For the
2300-gas sub-pattern no stock Slither detector identified; Aderyn/Mythril/Securify UNVERIFIED.

## P5 — Withdrawal Failures: one failing recipient or unbounded loop blocks everyone's payout
Origin: **published-pattern**. Sources: Slither `calls-loop` ("Calls inside a loop might lead
to a denial-of-service attack", slither 0.11.6 detector metadata); SWC-113 "DoS with Failed
Call" and SWC-128 "DoS With Block Gas Limit" (registry https://swcregistry.io — pages not
reachable this session, titles UNVERIFIED here); Code4rena Renzo H-03 (ETH withdrawals always
fail because the receiving contract's `receive()` is `nonReentrant` while called in a
nonReentrant flow).

Matches: a withdraw/distribute function that loops over a storage array that grows with
user actions and performs an external value transfer per element with `require(success)`/
`transfer`, and no per-user pull alternative; or a payout that reverts if any single
recipient reverts.

Must NOT match: bounded loops (fixed max length checked on push); pull-payment pattern with
per-user `withdraw()`; loops that record failures and continue.

Post-Cancun: unaffected.  Tools: Slither `calls-loop` (Low) flags calls in loops but not the
lock consequence; not tested here. Aderyn/Mythril/Securify UNVERIFIED.

## P6 — Missing Recovery: receives assets, no outgoing path
Origin: **published-pattern**. Slither `locked-ether`: "Contract with a `payable` function,
but without a withdrawal capacity." (slither 0.11.6, `detectors/attributes/locked_ether.py`;
wiki https://github.com/crytic/slither/wiki/Detector-Documentation#contracts-that-lock-ether).
FLARE extends it to ERC20/ERC721 receivers (e.g. `onERC721Received` implemented, no token-out path).

Matches: payable entry or token-receiving hook; no reachable `call{value}`/`transfer`/`send`/
`selfdestruct`/token transfer of the held asset, including via internal/delegate calls.

Must NOT match: contracts that forward value in the same function; contracts whose value-out
path is in an inherited contract or a known upgradeable implementation; abstract contracts.

Post-Cancun: note that `selfdestruct` still moves balance post-6780, so it still counts as an exit for ETH.
Tools: Slither `locked-ether` covers ETH (stock, mapped per spec §4.1). Token variant: none known; UNVERIFIED.

---

## Summary table
| # | Category (primary) | Origin | Evidence |
|---|---|---|---|
| P1 | Library Dependencies | incident-derived | Parity 2017, verified |
| P2 | Library Dependencies (sec. State Transitions) | incident-derived | Percent Finance 2020, verified on chain |
| P3 | State Transitions | published-pattern | spec + guidance; P2 as secondary instance |
| P4 | Transfer Logic | published-pattern | Code4rena Renzo H-01; Slither unchecked-transfer; Gemholic (temporary) |
| P5 | Withdrawal Failures | published-pattern | Slither calls-loop; SWC-113/128; Code4rena Renzo H-03 |
| P6 | Missing Recovery | published-pattern | Slither locked-ether |

## Claims the owner must be able to explain
1. Why only Parity and Percent Finance count as verified permanent EVM fund-locks.
2. Why Gemholic, Lido stSOL and ezETH are excluded (temporary / Solana / not a lock).
3. What each pattern must NOT match, and why those exclusions keep false alarms down.
4. The open tie-break question for P2 (Library Dependencies vs State Transitions).
5. Which statements about tool coverage were tested (Slither 0.11.6 on Parity and Percent sources) and which are UNVERIFIED.
6. How EIP-6780 changes P1 and P6 and leaves the others unaffected.
