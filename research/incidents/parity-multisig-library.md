# Parity multisig wallet library self-destruct (Ethereum, Nov 2017)

Status: **VERIFIED** (primary post-mortem, EIP text, on-chain state, verified source)
True fund-lock: **YES** (permanent immobilization; no recovery happened, EIP-999 withdrawn)
Proposed FLARE category: **Library Dependencies** (secondary: none needed)

## Summary
Parity multisig wallets (the version redeployed after the July 2017 hack) were thin
proxies that forwarded all logic to one shared `WalletLibrary` contract via
`delegatecall`. The library itself was never initialized, so its own owner set was
empty. A user called `initWallet` directly on the library, became its sole owner, then
called `kill`, which executed `suicide` (selfdestruct) on the library. Every wallet that
depended on it lost its code path for moving funds. Parity's post-mortem reports
"587 wallets holding a total amount of 513,774.16 Ether as well as additional tokens".

## Date
6 November 2017 (Parity post-mortem). Library deployed 20 July 2017 (post-mortem; Solidified write-up).

## Chain
Ethereum mainnet.

## Contract address(es)
- `WalletLibrary`: `0x863DF6BFa4469f3ead0bE8f9F2AAE51c91A907b4` (named in EIP-999).
- On-chain check, 2026-11-16, `eth_getCode` via https://ethereum-rpc.publicnode.com
  returned `0x` (no code: destroyed). `eth_getBalance` returned `0xce029a9aae883`
  wei (small dust, about 0.0036 ETH), i.e. the library itself holds no material funds;
  the locked ETH sits in the 587 wallet proxies.
- Individual wallet addresses: not enumerated here. Etherscan has a "parity-bug" label
  page (https://etherscan.io/accounts/label/parity-bug) but Etherscan was not reachable
  from this session (HTTP 403). UNVERIFIED list.
- Attacker/owner address named by Solidified: `0xae7168deb525862f4fee37d987a971b385b96952`
  (secondary source, not independently checked on-chain).

## Verified Solidity source
Yes. Blockscout serves verified source for the library address
(https://eth.blockscout.com/api/v2/smart-contracts/0x863DF6BFa4469f3ead0bE8f9F2AAE51c91A907b4):
contract name `WalletLibrary`, compiler `0.4.10+commit.f0d539ae`. (Blockscout's
`verified_at` is 2026-08-11, i.e. the verification was imported/re-done later; the
bytecode match is Blockscout's claim, not re-checked here because the code is no longer
on chain.) An earlier, pre-July-fix version of the same file is in the Parity repo at
https://raw.githubusercontent.com/openethereum/parity-ethereum/4d08e7b0aec46443bf26547b17d10cb302672835/js/src/contracts/snippets/enhanced-wallet.sol
(no `only_uninitialized` modifier: that is the July-2017-vulnerable version, not the November one).

## Code-level root cause
Excerpts from the Blockscout-verified source (line numbers from that file):

```solidity
107: function initMultiowned(address[] _owners, uint _required) only_uninitialized {
215: modifier only_uninitialized { if (m_numOwners > 0) throw; _; }
219: function initWallet(address[] _owners, uint _required, uint _daylimit) only_uninitialized {
225: function kill(address _to) onlymanyowners(sha3(msg.data)) external {
226:   suicide(_to);
```

Wallet proxy side (same file, `Wallet` contract): the fallback forwards to the library,
`_walletLibrary.delegatecall(msg.data);`, with `_walletLibrary` a hard-coded constant.

Mechanism:
1. The July fix (`only_uninitialized`) protects each *wallet's* storage, but the library's
   own storage had `m_numOwners == 0`, so `initWallet` on the library succeeded.
2. As sole owner with `required = 1`, the caller satisfied `onlymanyowners` and `kill`
   ran `suicide`, deleting library code.
3. Each wallet's withdrawal path (`execute`/`confirm`) existed only in the library. After
   deletion, `delegatecall` into an account with no code succeeds and does nothing, so
   wallets could still receive ETH (payable fallback with `msg.value > 0` branch) but
   could never send it. The proxy's target is a constant: no re-pointing possible.

## Fund-lock vs exploit
True fund-lock. Nothing was stolen; the funds remain in the wallets and are immobile due
to a logic/design error (uninitialized shared library + reachable selfdestruct +
immutable delegatecall target). The only recovery proposal (EIP-999, state change by
hard fork) is marked **Withdrawn** on eips.ethereum.org.

## Amount
513,774.16 ETH plus tokens, 587 wallets: Parity post-mortem (Medium, paritytech).
USD figures in press (e.g. "$160 million", "$172 million") vary by date; not used.

## FLARE category (tie-break)
**Library Dependencies** (precedence 1): the lock originates in an external library
contract that could be killed, reached by `delegatecall`. This is the spec's canonical
example (§4.2, §4.3). It would also look like "Withdrawal Failures" (path exists but
fails) but precedence 1 wins; not recorded as secondary because the withdrawal failure
is purely a consequence of the dependency.

## Post-Cancun (EIP-6780)
EIP-6780: outside the creation transaction, "SELFDESTRUCT does not delete any data
(including storage keys, code, or the account itself)"; it only moves the balance.
So on Ethereum mainnet after Cancun the exact "kill the library" step would no longer
delete the library code and the wallets would keep working. The **broader pattern still
applies**: value-holding contracts whose only exit logic lives behind `delegatecall`
into code they do not control (upgradeable or re-initializable implementations, an
implementation that can be re-pointed to a broken/empty address, a target created and
destroyed in one transaction, or chains that have not adopted EIP-6780).

## Tool detection
- **Slither 0.11.6 (tested, 2026-11-16)** on the Blockscout-verified source, compiled with
  solc 0.4.26 (the local closest version; 0.4.10 not installed). Two assembly lines had to
  be patched in a scratch copy to compile on 0.4.26 (`jumpi(invalidJumpLabel, ...)` ->
  `if iszero(...) { revert(0,0) }`; `delegatecall(...)` wrapped in `pop(...)`); the
  library functions above were untouched. Result: `suicidal` fired on
  `WalletLibrary.kill(address)` ("allows anyone to destruct the contract"), plus
  `low-level-calls`, `unchecked-lowlevel`, `reentrancy-eth`, style detectors. No
  detector states that *other contracts' funds* become stuck; `unprotected-upgrade` did
  not fire (it keys on the Initializable/initializer pattern). The spike (§4.11) found
  the same gap on a Parity-pattern wallet.
- **Aderyn, Mythril, Securify:** UNVERIFIED (not installed/tested in this session).

## Sources (accessed 2026-11-16)
- Parity post-mortem: https://medium.com/paritytech/a-postmortem-on-the-parity-multi-sig-library-self-destruct-63daca3a4cf7
- EIP-999 (library address, Withdrawn status): https://eips.ethereum.org/EIPS/eip-999
- EIP-6780: https://eips.ethereum.org/EIPS/eip-6780
- Verified source (Blockscout API): https://eth.blockscout.com/api/v2/smart-contracts/0x863DF6BFa4469f3ead0bE8f9F2AAE51c91A907b4
- Parity repo, earlier wallet source: https://raw.githubusercontent.com/openethereum/parity-ethereum/4d08e7b0aec46443bf26547b17d10cb302672835/js/src/contracts/snippets/enhanced-wallet.sol
- On-chain RPC (eth_getCode / eth_getBalance): https://ethereum-rpc.publicnode.com
- OpenZeppelin on the July 2017 hack (wallet fallback delegatecall excerpt): https://www.openzeppelin.com/news/on-the-parity-wallet-multisig-hack-405a8c12e8f7
- Solidified write-up (deployment date, attacker tx summary): https://medium.com/solidified/parity-hack-how-it-happened-and-its-aftermath-9bffb2105c0
- GitHub issue #6995 (original report): https://github.com/openethereum/parity-ethereum/issues/6995 — NOT READ (blocked in this session)

## Claims the owner must be able to explain
1. Why the July fix (`only_uninitialized`) did not protect the library itself.
2. Why wallets could still receive ETH after the library died, but not send it.
3. Why this is a fund-lock and not theft (no funds moved to the attacker).
4. Why EIP-6780 closes the exact 2017 path on mainnet, and why the pattern is still relevant.
5. What Slither's `suicidal` finding says and what it does not say (other contracts' funds).
6. Why the amount is quoted in ETH (513,774.16) and not a USD figure.
