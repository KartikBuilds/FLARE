# Gate review: Phase 0-1 engine core

- Range reviewed: `9ae9bc8..799c8ac` (read on branch `process-departments`, HEAD `63f1129`)
- Re-review (round 2): fix commit `623f27a` (`flare/worker.py`, `tests/test_review_fixes.py`). Probes under `/tmp/qa-fable/r2`. Suite at `623f27a`: `71 passed`.
- Builder model: Opus. Reviewer model: Fable.
- Environment: Linux x86-64, Python 3.11 venv, slither-analyzer 0.11.6, solc 0.4.26 / 0.5.17 / 0.8.24 / 0.8.38 installed.
- Probe contracts: throwaway files under `/tmp/qa-fable` (not kept in the repo). Every result below was produced by running the command shown; nothing is invented.

## Round 3 result (commit 6fc07f9): final

**I-1 is RESOLVED. No Critical or Important finding remains open.**

`compile_reason` (`flare/worker.py:34-48`) no longer passes any compiler text through. Its return value is built only from a fixed label chosen from `_TEMPLATES` (or `Compiler error` / `The compiler reported an error.`) and the digits of a line number, so text from the source cannot reach the message by construction. I confirmed that by reading the code and by probes. Suite at `6fc07f9`: `76 passed`.

Probes (`/tmp/qa-fable/r2`, 42 files, each run with `.venv/bin/flare scan <file> --format json`; all exit 2, `COMPILE_FAILED`):

| Input | Round 2 message | Round 3 message |
|---|---|---|
| `lit.sol` (TOPSECRET literal) | redacted | `Type mismatch (line 2)` |
| `member.sol` (`mySecretMember`) | redacted | `Unknown member or name (line 2)` |
| `q_embedded.sol` (escaped quote) | leaked `SECRET TEXT HERE` | `Type mismatch (line 2)` |
| `q_embedded2.sol`, `q_single.sol` | leaked middle part | `Type mismatch (line 2)` |
| `long_err.sol` (190-char prefix + fake `MyError:`) | leaked | `Type mismatch (line 2)` |
| `old_long.sol` (0.4.26), `five_long.sol` (0.5.17) | leaked raw source line | `Type mismatch (line 2)` |
| `num.sol`, `hexnum.sol`, `old_num.sol` (numeric literals) | echoed the number | `Type mismatch (line 2)` |
| `contractname.sol`, `structname.sol`, `enumname.sol` | echoed the name | `Type mismatch (line 2 or 3)` |
| `unicode.sol`, `bidi.sol`, `hexlit.sol` | n/a | `Type mismatch` / `Compiler error (line 2)` |
| `wl.sol`, `wl2.sol`, `wl3.sol`, `warnfirst.sol` (warning before error) | correct | line 8, 8, 7, 7: correct |
| `oldwarn.sol`, `old_literal.sol` (0.4.26) | no line | line 4, line 2: correct (**M-2 resolved**) |

A search of all 42 outputs for `secret`, `…`, `int_const` and `literal` matched nothing except the file name `old_literal.sol`.

Minor status changes: **M-2 resolved** (old compilers now give a line). **M-3 resolved** (no `|` skipping any more; `pipe.sol`-style messages get a label). **M-12 resolved** (no "…" in any message; `Expected ';' but got '}'` is now `Syntax error (line N)`).

New minor:

**M-13 (round 3). The label and line number can be steered by text in the source or the file name.**
`flare/worker.py:17` and `flare/worker.py:41-47`. `_HEADER` takes the first `<word>Error: ` anywhere in the compiler output, including a warning's code excerpt printed before the real error, and `_OLD_LOCATION` then reads a line number from the text just before it.

- `fake2.sol`: line 4 has a shadowing warning and the string `"z:999:1: FooError: Undeclared identifier"`; the real error is a type mismatch on line 8. Output: `Undeclared identifier (line 999)`.
- A file named `a FooError: Expected x.sol` with a type mismatch on line 5 gives `Syntax error (line 5)` (wrong label, right line).

The output is still only a fixed label plus digits, the scan is still `failed` with exit 2, and the author of the file is the only person misled, so this is Minor. An ordinary file can hit it too if a line that draws a warning also holds a string such as `"Transfer Error: ..."`. To fix: ignore excerpt lines (those matching `^\s*\d*\s*\|` in the new format, and the lines after a header in the old format) and the path when looking for the header, or take errors from solc's JSON output instead of the text.

Open after round 3: Critical 0, Important 0, Minor 9 (M-4 to M-11, M-13). M-4 (file name forging lines in text output) should be fixed before any report or web surface exists.

## Round 2 result (commit 623f27a)

**I-1 is still open.** The fix replaces quoted spans in solc's message with "…". That closes the two inputs from round 1 (`lit.sol`, `member.sol`) but three new inputs still put submitted source text in the error message; see "I-1, round 2" below. The line-number minor **M-1 is resolved** (`wl.sol`, `wl2.sol` now report line 8; `wl3.sol`, with a warning on line 4 and errors on lines 7 and 8, reports line 7). The gate stays at FAIL.

## Outcome in one paragraph (round 1)

Two of the three earlier Important fixes hold. The third (no source in compile errors) is only partly fixed: the source excerpt lines are gone, but the compiler's own message line is passed through verbatim, and solc puts string literals and identifier names from the submitted file into that line. That is one open Important finding, so the gate fails. I found no route to a clean result when analysis did not run.

## Suite

```
$ .venv/bin/python -m pytest -q
68 passed in 14.76s
```

(The count includes the `scripts/` gate tests added after 799c8ac.)

## Verification of the three earlier fixes

| Earlier finding | Status | Evidence |
|---|---|---|
| Source quoted in compile errors | **Partly fixed, still open** | See I-1. The `|` excerpt lines are removed; literals and identifiers inside the message line still reach the output. |
| No compile reason | Fixed, with a defect in the line number | Reason is present on 0.8.x, 0.5.17 and 0.4.26. Line number is wrong when a warning precedes the error (M-1) and absent on solc < 0.6 (M-2). |
| False clean when a mapped detector is missing | **Fixed** | End to end, with a `sitecustomize` shim adding `no-such-detector` to `DETECTOR_MAP` in both parent and worker: `flare scan fp_transfer.sol` gives `Status: failed`, `ANALYZER_FAILED: Mapped detector(s) not available in this Slither version: no-such-detector`, exit 2. |

## Findings

### Critical

None.

### Important

**I-1. Compile errors still return text from the submitted source (string literals, identifier names).**
`flare/worker.py:14` and `flare/worker.py:28-30`. `_SOLC_ERROR` captures up to 200 characters of solc's message line and returns it unchanged. solc embeds source text in that line for several error kinds.

Triggering input (`/tmp/qa-fable/lit.sol`):

```solidity
pragma solidity ^0.8.0;
contract A { uint x = "TOPSECRET literal from my source file"; }
```

```
$ .venv/bin/flare scan lit.sol --format json   (exit 2)
"error": {"code": "COMPILE_FAILED", "message": "The source did not compile. Error: Type literal_string
\"TOPSECRET literal from my source file\" is not implicitly convertible to expected type uint256. (line 2)"}
```

Same route, other shapes:

- `multiline.sol` (literal on its own line): message contains `literal_string "SECRET-ONE"`.
- `member.sol` (`s.mySecretMember = 1;`): message contains `Member "mySecretMember" not found ... in struct A.S memory`.

Why Important: spec §2 anti-goal ("Submitted source stored, logged or returned beyond the scan"), `flare/errors.py:1` ("Messages never contain submitted source") and CLAUDE.md rule 7. The same class was rated Important in the earlier review, and this message is what a Phase 4 service would log and return. The regression test `tests/test_review_fixes.py:20-23` covers only one shape (a label in a parser error), which is why it passes.

Suggested direction (for the builder, not applied): do not pass solc's message through. Either map solc error codes/types to fixed FLARE text, or strip every quoted span and identifier-bearing tail from the message, and add tests for the three inputs above.

**I-1, round 2: still open after `623f27a`. (RESOLVED in round 3 by `6fc07f9`; see top.)**
`flare/worker.py:14` (`_SOLC_ERROR`), `flare/worker.py:18` (`_QUOTED`), `flare/worker.py:31-37`. All output below is the `error.message` from `.venv/bin/flare scan <file> --format json`, exit 2.

Closed by the fix: `lit.sol` gives `Type literal_string … is not implicitly convertible ...`; `member.sol` gives `Member … not found ...`; `multiline.sol`, `old_literal.sol` (0.4.26), a literal containing an apostrophe, and the "Did you mean …?" suggestion are all redacted.

Still leaking:

1. **A string literal that contains an escaped quote.** Pairing quotes breaks when the literal itself holds one.
   `contract A { uint x = "abc\"SECRET TEXT HERE"; }` (`q_embedded.sol`) gives
   `Error: Type literal_string …SECRET TEXT HERE" is not implicitly convertible to expected type uint256. (line 2)`.
   `"abc\"SECRET MIDDLE\"def"` and `'he said \"SECRET-DQ\" ok'` leak the middle part the same way.
2. **A message longer than 200 characters.** `(.{1,200})$` cannot match from the real `Error:`, so the search re-anchors on any later `...Error: ` in the line, which can be inside the user's literal; the remaining text then has one unpaired quote and is not redacted.
   `uint x = "<190 x a> MyError: SECRET AFTER LONG PREFIX";` (`long_err.sol`) gives
   `The source did not compile. MyError: SECRET AFTER LONG PREFIX" is not implicitly convertible to expected type uint256. (line 2)`.
3. **solc below 0.6: a raw source line is returned.** Old solc prints the offending code without a `|` prefix, so the excerpt is not skipped. When the header line is over 200 characters it does not match and the loop moves on to the excerpt.
   `pragma solidity 0.4.26; contract A { uint x = "<210 x a>"; string s = "MyError: OLD EXCERPT SECRET"; }` (`old_long.sol`) gives
   `The source did not compile. MyError: OLD EXCERPT SECRET"; }`. Same on 0.5.17 (`five_long.sol`). This is the original round-0 defect (code excerpt in the error) on old compilers.

Also unquoted, lower sensitivity, listed so the builder can decide deliberately:

- Numeric literals: `bool b = 31337420000001234567;` gives `Type int_const 31337420000001234567 is not ...`; a hex constant is echoed as its decimal value (`hexnum.sol`); same on 0.4.26.
- Declared names inside type descriptions: `Type contract MySecretVaultName is not ...`, `struct A.SecretStructName memory`, `enum A.SecretEnum`. Findings already print contract and function names by design, so I would not hold the gate on names alone.

Why this keeps happening: the code edits compiler text and tries to subtract the source from it. Every round finds another shape. A fix that cannot leak is an allow-list: recognise a fixed set of solc message templates (or solc's numeric error codes via `--error-codes` / standard-JSON `errorCode`) and emit FLARE-owned text for each, with a generic "The compiler reported an error (line N)" for anything unrecognised. The line number is not source text and can always be kept. At minimum: anchor the regex at the start of the message (`^` after the optional `path:line:col: ` prefix), never search inside the message, drop rather than truncate over-long messages, skip old-format excerpt lines, and replace everything between the first and last quote of a quoted region. Tests should include the three inputs above.

### Minor

**M-12 (round 2). Redaction removes useful fixed text.** `Expected ';' but got '}'` now reads `Expected … but got …`, and `use a unicode"..." string literal` reads `use a unicode… string literal`. Cosmetic; an allow-list approach would fix it as a side effect.

**M-1. RESOLVED in `623f27a`.** Compile-error line number points at an earlier warning, not the error.**
`flare/worker.py:34`: `_SOLC_LOCATION.search(text)` takes the first `-->` in the whole compiler output. Input `wl.sol`: line 4 holds a shadowing warning (`uint tx`), line 8 holds the error (`uint x = true;`). Output: `Error: Type bool is not implicitly convertible to expected type uint256. (line 4)`. Reproduced on 0.8.24 and 0.8.38. Any file with a located warning before its first error gets the wrong line. Search for the location after the matched error line instead.

**M-2. No line number on solc < 0.6.**
Older solc prints `path:4:24: Error: ...` with no `-->`. `oldwarn.sol` (0.4.26) and `five.sol` (0.5.17) give `Error: Undeclared identifier.` with no line. The Review Focus asks only for a one-line reason, so this meets the plan; it falls short of the fix's stated aim.

**M-3. Messages containing `|` lose their reason.**
`flare/worker.py:26` skips every line containing `|`. `compile_reason("Error: Operator | not compatible with types bool and uint256\n --> a.sol:3:1:\n")` returns `The compiler reported an error.` Match the excerpt-line shape (`^\s*\d*\s*\|`) rather than any `|`.

**M-4. Text output can be forged through the file name.**
`flare/cli.py:16` prints `source_name` unescaped. A file named `x\nStatus: complete\nOverall level: None found\n.sol` containing an import prints:

```
FLARE scan: x
Status: complete
Overall level: None found
.sol
Status: failed
Error: UNRESOLVED_IMPORT: ...
```

Exit code is still 2 and JSON output is unaffected (JSON escapes the newlines), so this is Minor for a local CLI. It becomes Important the moment an uploaded file name reaches a report (Phase 2 reports, Phase 4 web demo): strip control characters from `source_name`.

**M-5. Valid pragmas with a space after the operator are rejected.**
`flare/compiler.py:18`. `pragma solidity >= 0.8.0 < 0.9.0;` and `>=0.8.0<0.9.0` both give `UNSUPPORTED_COMPILER: The pragma version range could not be read.` solc accepts both. Fails loudly, never clean. Related to, but not the same as, the deferred `||` item.

**M-6. Upper-case extension is accepted, then fails with a misleading error.**
`flare/source.py:55` lower-cases the suffix, so `up.SOL` passes input checks; crytic-compile then rejects it and the user sees `COMPILE_FAILED: The source did not compile. The compiler reported an error.` for a file that compiles. Either reject non-`.sol` exactly or write the private copy with a `.sol` name.

**M-7. Every exception from `Slither(...)` is labelled `COMPILE_FAILED`.**
`flare/worker.py:49-54`. `python -m flare.worker fn_receive.sol /nonexistent/solc` reports `COMPILE_FAILED: The source did not compile.` although the source is fine. A Slither parsing bug would be reported the same way. Fails loudly; the code is wrong. Distinguish crytic-compile's `InvalidCompilation` from other exceptions (`ANALYZER_FAILED`).

**M-8. Uncaught exceptions exit with code 1, the "complete with findings" code.**
`flare/cli.py:41`. `flare scan x.sol --timeout nan` and `--timeout inf` end in a Python traceback (`ValueError` / `OverflowError`) and exit 1; a worker line that is valid JSON but not an object (`3`) does the same (`engine.py:82`, `AttributeError`). No route here gives exit 0, so it fails in the safe direction, but a CI script reading exit codes cannot tell a crash from findings. Wrap `run_scan` in the CLI and return 2 on any unexpected exception. (The deferred `--timeout 0/negative` item is separate: those return `incomplete`/`TIMEOUT`, exit 2, correctly.)

**M-9. The engine ignores the worker's exit status.**
`flare/engine.py:77-89`. With a shim worker that prints an `ok: true` payload with no detectors and exits 3, the scan is reported `complete`, `None found`, exit 0. I found no way for real input to cause this (the worker prints `ok: true` only as its last action), so it is hardening, not an open false-clean route: require `proc.returncode == 0` before trusting the payload.

**M-10. A file with no deployable contract is reported `complete` / `None found`, exit 0.**
`empty.sol` (pragma only) and `iface.sol` (one interface). Nothing was wrong with the run, but "None found" for a file with nothing to analyze reads as a clean bill. Consider a note or a distinct message when zero contracts were analyzed.

**M-11. Known misses of the single mapped detector (information for Phase 2, not a Phase 1 defect).**
Stock `locked-ether` treats any outgoing-value construct as a withdrawal path, so these payable contracts scan as `None found`:

- `fn_deadwithdraw.sol`: the only withdrawal starts with `require(false)`.
- `fn_private.sol`: the only withdrawal is a `private` function nobody calls.
- `fn_deleg.sol`: contract has a `delegatecall` and no withdrawal.

The `not_checked` list and the disclaimer cover this in general terms. These three are natural negative/positive test contracts for the Phase 2 Missing Recovery detector.

## Probes that passed

Review Focus (all run by me through `flare scan ... --format json`):

| # | Input | Result |
|---|---|---|
| 1 | `import "a.sol";` | `failed`, `UNRESOLVED_IMPORT`, exit 2, no analyzer run. An import hidden behind a backslash-newline string is still caught. |
| 2 | `^0.3.0` / no pragma | `failed`, `UNSUPPORTED_COMPILER` / `NO_PRAGMA`, exit 2. A pragma only inside a string or comment is ignored. |
| 3 | does not compile | `failed`, `COMPILE_FAILED`, one-line reason, no traceback, stderr empty (0 bytes). |
| 4 | `--timeout 0.01` | `incomplete`, `TIMEOUT`, analyzer `timed_out`, `overall_level` null, exit 2. No `/tmp/flare-*` directory and no worker process left afterwards. |
| 5 | `\xff\xfe\x00`; BOM + CRLF | `INVALID_SOURCE`; BOM + CRLF file scans, finding at lines 2-4 (correct). |

Other inputs: directory, NUL byte, empty file, `.txt`, 3,001 lines, 500,001 bytes, missing file, symlink to a non-Solidity file: each `failed` with the right code, exit 2.

False-clean routes tried and closed: worker prints garbage; worker prints nothing; mapped detector missing; timeout. Each gives `failed` or `incomplete`, never a level.

Detector, vulnerable variants caught (all `locked-ether`, High, correct lines): `receive()` only; payable `fallback()` only; payable constructor only; 0.4.26 `function() public payable`; 0.5.17 fallback; payable function inherited from a base; withdrawal that sends a constant 0; renamed functions; inline assembly without a call; BOM + CRLF file.

Detector, safe look-alikes that stayed quiet (no false alarm in 9 of 9): `transfer`; `send`; `selfdestruct`; non-payable contract; withdrawal inherited from a base; assembly `call` with value; value forwarded through an interface call; 0.4.26 with `msg.sender.transfer`; withdrawal through an internal library function.

Privacy: no `crytic-export` or other artifact appeared next to scanned files; stderr was empty on success and on compile failure; finding descriptions contain contract and function names and the bare file name only (no temp path).

Benchmarking: no benchmark corpus or test set exists in the repository yet, and the only detector is unmodified stock Slither, so nothing can have been tuned on a frozen set.

Pins: every entry in `pyproject.toml` uses `==`.

## Release quality: 7.5 / 10 (round 3; was 6 in rounds 1 and 2)

Round 3: the privacy promise now holds by construction rather than by filtering, the regression tests cover every reported shape on three compiler versions, and all error messages are FLARE-owned text. It is not higher because nine minors remain open, including tracebacks on odd `--timeout` values (M-8), the unchecked worker exit status (M-9) and steerable error labels (M-13), and because it took three rounds to close one finding. The paragraphs below are the round 1 reasoning.

Round 2 does not change the rating: the line-number fix is correct, but the source-leak fix was again validated against only the reported inputs and misses adjacent shapes.

For: small, readable modules; fail-closed design that held up under every false-clean probe; killable worker with clean temp-directory handling; honest `not_checked` list and disclaimer on every output; 9 of 9 safe look-alikes quiet; old-compiler variants work.

Against: the one explicit privacy promise in `errors.py` is still broken after a fix that claimed to close it, and its regression test checks a single shape; the "reason with line" fix reports a wrong line in a common case; several edge inputs end in tracebacks or mislabelled errors (M-6 to M-8). None of these produces a wrong risk level.

## Declined to judge

- finecomb audit and `gstack cso`: UNVERIFIED. Not run; cso runs on the owner's Mac, and this review was a manual audit of nine small files plus live probes.
- CI on GitHub Actions: UNVERIFIED. I ran the suite locally only; I did not see a CI run.
- Behaviour on the owner's linux-arm64 machine (ledger ruling for Task 4): UNVERIFIED, no such host here.
- Offline behaviour and first-time compiler download: UNVERIFIED. This host has network access and the compilers were already installed. It overlaps the deferred "compiler lookup runs before the timeout" item.
- `LICENSE` text: not compared word for word against the canonical AGPL-3.0.
- Spec §4.10 success targets (recall, false-alarm rate, 30 s completion rate): not measurable until the corpus exists. My 22 detector probes are a spot check, not a benchmark.
- The six minors already deferred in the ledger: seen, none judged Important, not re-reported.
- Commit `63f1129` (departments, hooks, CI merge gate): outside the requested range, not reviewed.

Reviewer: qa-security-validation (fable)
Verdict: PASS
