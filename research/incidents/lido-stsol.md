# Lido on Solana stSOL withdrawal blockage (Solana, Mar–Apr 2024) — case study only

Status: **PARTLY VERIFIED** (event and amount from multiple reports quoting the operator P2P; program-level root cause UNVERIFIED)
True fund-lock: **NO — temporary freeze** (P2P reported a fix and CLI withdrawals by 3 April 2024; a web withdrawal UI followed in Jan 2025)
Proposed FLARE category: **Not applicable / Unclassified** for FLARE (Solana, not Solidity). README's "Missing Recovery" is not supported by evidence.

## Summary
Lido on Solana was sunset (announced Oct 2023; web unstaking UI removed Feb 2024). On
30 March 2024 the operator P2P reported a bug blocking stSOL withdrawals. P2P's Pavel
Pavlov said it was "suspected to be associated with alterations in the Rent-Exempt Split
logic" and that "The current implementation uses the split function in the withdrawal
process". By 3 April 2024 P2P said it had fixed the issue with an updated maintainer bot
and that stSOL could be withdrawn via CLI (Cointelegraph update).

## Date
30 March 2024 (reported) – 3 April 2024 (fix reported).

## Chain
Solana. FLARE cannot scan Solana programs (Rust); case study only (spec §5).

## Program address
UNVERIFIED (not given in the sources read; Lido docs pages read do not state it).

## Source availability
Rust (Solido), not Solidity. Lido docs reference Solido CLI v2.1.0 (https://docs.lido.fi/guides/solana-manual-withdrawal-cli). Code-level cause not inspected.

## Root cause
UNVERIFIED at code level. Reported as suspected: withdrawals use a stake-account `split`,
and a change in rent-exempt rules for split stake accounts made that step fail. The fix
was operational (maintainer bot update), not a stated program change — UNVERIFIED.
A separate usability issue (no web UI after sunset) was not a contract fault.

## Fund-lock vs exploit
Temporary freeze. Not theft, not permanent.

## Amount
About 112,000 stSOL, "over $24 million", held by 31,000+ wallets (DL News; Cointelegraph says
31,588 holders per Solscan). This is the total stSOL outstanding, i.e. exposure, not a
confirmed locked amount.

## FLARE category
Not mapped: outside FLARE's scope. If forced by analogy it would be Withdrawal Failures
(a withdrawal path exists but failed persistently because of an environment change), not
Missing Recovery (a withdrawal path existed). Recorded as Unclassified per spec §4.2.

## Post-Cancun (EIP-6780)
Not applicable (Solana).

## Tool detection
Not applicable; Slither/Aderyn/Mythril/Securify analyse EVM/Solidity only.

## Sources (accessed 2026-11-16)
- Cointelegraph: https://cointelegraph.com/news/24-million-staked-sol-stuck-lido-smart-contract-bug
- DL News: https://www.dlnews.com/articles/defi/lido-stsol-holders-stuck-after-code-bug-blocks-withdrawals/
- Lido blog (Jan 2025 withdrawal UI): https://blog.lido.fi/simplifying-stsol-withdrawals/
- Lido docs, manual CLI withdrawal: https://docs.lido.fi/guides/solana-manual-withdrawal-cli

## Claims the owner must be able to explain
1. Why this is a temporary freeze, not a permanent lock.
2. Why "Missing Recovery" is the wrong label (a withdrawal path existed).
3. Why it is excluded from the benchmark (Solana, no Solidity).
4. Why the $24M figure is exposure, not a measured locked amount.
