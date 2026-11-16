"""Which analyzer detectors count as fund-lock findings (spec §4.1).

A built-in detector is listed here only with a written justification.
"""

# detector -> (fund-lock category, severity)
DETECTOR_MAP: dict[str, tuple[str, str]] = {
    # Slither: "Contracts that lock ether". The contract can receive ETH but
    # has no function that sends ETH out: the definition of Missing Recovery.
    "locked-ether": ("Missing Recovery", "High"),
}
