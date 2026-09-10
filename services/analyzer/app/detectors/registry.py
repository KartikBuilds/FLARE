from __future__ import annotations

from pathlib import Path

from app.detectors.base import Detector, build_source_map
from app.detectors.lib_001_unprotected_delegatecall import UnprotectedDelegatecallDetector
from app.detectors.lib_002_destructible_dependency import DestructibleDependencyDetector
from app.detectors.rec_001_no_rescue_path import NoRescuePathDetector
from app.detectors.rec_002_pause_disables_recovery import PauseDisablesRecoveryDetector
from app.detectors.state_001_terminal_state_locks_assets import TerminalStateLocksAssetsDetector
from app.detectors.state_002_one_way_transition import OneWayTransitionDetector
from app.detectors.wd_001_unsatisfiable_condition import UnsatisfiableConditionDetector
from app.detectors.wd_002_unreachable_branch import UnreachableWithdrawalBranchDetector
from app.detectors.xfer_001_unchecked_return import UncheckedTransferReturnDetector
from app.detectors.xfer_002_fixed_gas_stipend import FixedGasStipendTransferDetector
from app.schemas.finding import Finding
from app.schemas.ir import ProjectIR

DETECTOR_CLASSES: list[type[Detector]] = [
    UnprotectedDelegatecallDetector,
    DestructibleDependencyDetector,
    UnsatisfiableConditionDetector,
    UnreachableWithdrawalBranchDetector,
    NoRescuePathDetector,
    PauseDisablesRecoveryDetector,
    TerminalStateLocksAssetsDetector,
    OneWayTransitionDetector,
    UncheckedTransferReturnDetector,
    FixedGasStipendTransferDetector,
]


def get_detectors() -> list[Detector]:
    return [cls() for cls in DETECTOR_CLASSES]


def run_all_detectors(ir: ProjectIR, files: list[Path]) -> list[Finding]:
    source_map = build_source_map(files)
    findings: list[Finding] = []
    for detector in get_detectors():
        # A single detector's unexpected failure must not take down the
        # whole run — every other detector still gets to report.
        try:
            findings.extend(detector.run(ir, source_map))
        except Exception:  # noqa: BLE001 — deliberately broad, see above
            continue
    return findings
