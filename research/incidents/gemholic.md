# Gemholic / GemstoneIDO 921 ETH stuck on zkSync Era (Apr 2023 – Jun 2024)

Status: **PARTLY VERIFIED** (event, amount, cause and release confirmed by multiple reports quoting Matter Labs; contract address and source UNVERIFIED)
True fund-lock: **NO — temporary freeze** (released after the zkSync Era v24 protocol upgrade, June 2024)
Proposed FLARE category: **Transfer Logic** (as a pattern illustration only; not a benchmark incident)

## Summary
Gemholic sold GEMS tokens through a `GemstoneIDO` contract on zkSync Era and raised about
921 ETH. The contract moved ETH out with Solidity `.transfer()` (2300-gas stipend). On
zkSync Era, which is not EVM-equivalent in gas accounting, the transfer ran out of gas and
reverted, so the ETH could not be withdrawn. Matter Labs said the funds were "safe" and
that it had a solution; the protocol's v24 upgrade (7 June 2024) made the funds
withdrawable, after which the team moved them to Ethereum mainnet and was accused of a
rug pull.

## Date
Stuck: reported 6–7 April 2023 (Web3 Is Going Just Great, Cointelegraph). Released: v24
upgrade, 7 June 2024 (The Block, Cointelegraph).

## Chain
zkSync Era (L2). Not Ethereum mainnet; EVM-compatible at the Solidity level, different VM.

## Contract address(es)
**UNVERIFIED.** None of the sources read gives the address; Cointelegraph links to the
zkSync explorer without naming it. Not guessed.

## Verified Solidity source
**UNVERIFIED** (address unknown). The exact withdrawal function and line are therefore not
quoted. The Coinmonks analysis shows only a generic example (`payable(_address).transfer(1 ether);`),
not the contract's code.

## Code-level root cause (as reported)
`.transfer()` forwards a fixed 2300 gas. zkSync Era's gas metering differs from the EVM
("dynamic and divergent gas measurement", Coinmonks), so the recipient call costs more than
2300 gas and reverts. With no alternative exit path (e.g. `call{value:}`) the ETH was stuck.
Matter Labs also said the contract was deployed to mainnet without testnet testing
(Cointelegraph).

## Fund-lock vs exploit
Temporary freeze. Fixed by a platform (protocol) change, not by the contract. Strictly not
a permanent lock. The later rug-pull allegations concern what the team did with released
funds and are out of scope.

## Amount
921 ETH (Cointelegraph quoting Matter Labs; Web3 Is Going Just Great). USD estimates vary
($1.7M in 2023; $3.3–3.5M in 2024 reporting) and are not used.

## FLARE category (tie-break)
Transfer Logic (precedence 3): the asset-transfer method makes funds unreachable. No higher
category fits (no external library; no state with no exit — the state is fine, the transfer
primitive fails). Withdrawal Failures also fits (a path exists, fails persistently) but is
lower precedence.

## Post-Cancun (EIP-6780)
Not related to selfdestruct; unaffected. The general `.transfer()` / `.send()` 2300-gas
risk remains on Ethereum (gas repricing, contract recipients) and on non-equivalent L2s.

## Tool detection
UNVERIFIED for this contract (no source). For the pattern: Slither 0.11.6 has no detector
named for 2300-gas `transfer` in its default set as far as checked here (not tested);
Aderyn, Mythril, Securify UNVERIFIED.

## Benchmark use
Excluded from the Solidity benchmark: no verified source/address, and not permanent.
Usable as narrative motivation for the Transfer Logic published pattern.

## Sources (accessed 2026-11-16)
- Cointelegraph (Matter Labs statement): https://cointelegraph.com/news/zksync-era-denies-921-eth-stuck-forever-in-smart-contract
- Cointelegraph (v24 release, rug-pull claims): https://cointelegraph.com/news/gemholic-scam-suspected-rug-pull-zksync
- The Block (release 7 June 2024): https://www.theblock.co/news/ecosystems/2024-06-08-gemholic-accused-of-rug-pull-after-moving-3-3-million-in-recently-recovered-funds-vanishing-from-social-media-299161
- Web3 Is Going Just Great: https://www.web3isgoinggreat.com/single/gemholic-raises-921-eth-1-7-million-in-a-token-sale-only-to-realize-funds-are-stuck
- Coinmonks analysis: https://medium.com/coinmonks/gemstoneido-contract-stuck-with-921-eth-an-analysis-of-why-transfer-does-not-work-on-zksync-era-d5a01807227d
- zkSync tweets referenced by W3IGG (not read): https://twitter.com/zksync/status/1644139364270878720, https://twitter.com/zksync/status/1644459406828924934

## Claims the owner must be able to explain
1. Why this is a temporary freeze, not a permanent fund-lock.
2. Why `.transfer()` failed on zkSync Era but works on Ethereum for EOAs.
3. Why the address and code are UNVERIFIED and the incident is excluded from the benchmark.
4. Why the category is Transfer Logic rather than Withdrawal Failures.
