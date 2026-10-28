# FLARE --- Fund-Lock Assessment and Risk Evaluation

> **Document purpose:** This README is the main introduction and
> engineering reference for FLARE. It explains the problem, intended
> product, research objectives, current prototype status, proposed
> workflow, testing strategy, and delivery plan.
>
> **Important status notice:** The repository reviewed for this document
> is a prototype skeleton. Some files exist but have known defects; some
> endpoints return sample data; analysis integrations, persistence,
> isolation, and deployment are not yet verified. This document does not
> claim that the target product is already working or production-ready.

## How to read this README

Status labels are used throughout:

-   **Current / prototype:** described in the reviewed repository, but
    may be incomplete or untested.
-   **Planned:** a required or proposed capability that has not been
    demonstrated as implemented.
-   **Pending decision:** conflicting or missing information must be
    resolved before implementation.
-   **Verified:** supported by executed tests, inspected evidence, or a
    reproducible result. Do not use this label merely because code
    exists.

This README describes both the current prototype and the intended
product. Whenever they differ, the difference is called out explicitly.

------------------------------------------------------------------------

## 1. Project Overview

### 1.1 What is FLARE?

**FLARE** stands for **Fund-Lock Assessment and Risk Evaluation**. It is
intended to be a tool that examines Solidity smart-contract source code
for design and logic patterns that may make funds permanently
inaccessible.

A smart contract is a program deployed to a blockchain. It may hold
tokens or other assets and define the rules for moving those assets. If
a contract has a serious logic error, users may be unable to withdraw or
recover funds. This is called a **fund-lock**: the assets can remain
on-chain but there is no valid route to access them.

FLARE aims to combine established static-analysis tools with a
fund-lock-specific classification and explanation layer. It should help
a developer understand: - what a tool reported; - which fund-lock
category the finding may belong to; - what code or evidence supports the
finding; - why the pattern matters; - what change or review may reduce
the risk; and - what the analysis did **not** check.

FLARE is a research and triage aid. It is **not** a substitute for a
professional audit, formal verification, or expert review. A low score
or empty report does not prove a contract is safe.

### 1.2 A simple example

Imagine a contract that accepts deposits but has no valid withdrawal
path after a particular state change. A developer submits the Solidity
source to FLARE. The intended workflow is:

1.  FLARE validates the input and rejects files outside the documented
    limits.
2.  Supported analysis tools inspect the source without executing the
    contract.
3.  FLARE converts tool-specific output into a common finding format.
4.  Evidence-backed rules classify applicable findings into fund-lock
    categories.
5.  A documented scoring method summarizes the assessed risk.
6.  The result explains the finding, its evidence, uncertainty, and
    possible remediation.
7.  The system retains only the permitted scan metadata and result data;
    source-code handling follows the approved privacy design.
8.  The developer can export a report when report generation is
    implemented.

This is the intended product flow, **not a claim that every step
currently works**. In the reviewed prototype, some scan results are
sample data and the analysis worker, queue, persistence, and
source-deletion workflow are not connected.

### 1.3 The problem FLARE investigates

Established smart-contract tools detect many important classes of bugs,
but their outputs may not directly answer the research question: *How
well do these tools identify patterns that can make funds inaccessible?*
FLARE investigates whether a dedicated fund-lock taxonomy and
evidence-linked explanations can improve how those findings are
organized and communicated.

The claim that FLARE detects more fund-lock issues than existing tools
is a **research hypothesis**, not an established result. It must be
tested using a documented benchmark and reported with its limitations.

### 1.4 Intended users

  -----------------------------------------------------------------------
  User                                Intended benefit
  ----------------------------------- -----------------------------------
  Independent smart-contract          An additional pre-deployment review
  developer                           without assuming that a scan
                                      replaces an audit

  Junior auditor or security          Faster triage through categorized
  researcher                          findings and traceable evidence

  Researcher or evaluator             A reproducible way to examine
                                      fund-lock incidents and compare
                                      tool behavior

  Governance participant reviewing a  Potential future use for reviewing
  proposed upgrade                    relevant contract changes; not a
                                      confirmed MVP feature
  -----------------------------------------------------------------------

These are intended user groups from the product requirements, not
evidence of existing customers.

### 1.5 Product principles

-   **Evidence before claims:** findings, benchmark results, and
    incident descriptions must be traceable.
-   **Real analysis only:** mock results must never be presented as
    actual analyzer output.
-   **Visible uncertainty:** unclassified findings, tool failures, and
    coverage limits must be reported.
-   **Privacy by design:** source-code handling must match the
    documented and tested policy.
-   **Reproducibility:** tool versions, settings, inputs, and raw
    outputs must be recorded for research.
-   **Small verified increments:** each development phase has acceptance
    criteria and tests.
-   **Honest scope:** FLARE reports what it checked and does not promise
    that a contract is safe.

------------------------------------------------------------------------

## 2. Objectives and Requirements

### 2.1 Approved MRP research objectives

The five research objectives must be preserved in the accepted proposal
and traced to implementation or research evidence.

  -----------------------------------------------------------------------
  ID                      Research objective      Evidence expected
  ----------------------- ----------------------- -----------------------
  RO1                     Study real fund-lock    Case studies,
                          incidents and their     primary-source
                          root causes             citations, and
                                                  documented root-cause
                                                  analysis

  RO2                     Develop a taxonomy of   Defined categories,
                          fund-lock patterns      subcategories,
                                                  inclusion criteria, and
                                                  examples

  RO3                     Reproducibly compare    Pinned tool versions,
                          established             exact commands, raw
                          security-analysis tools outputs, labels, and
                                                  repeatable metrics

  RO4                     Design a detection and  Architecture,
                          risk-assessment         implementation, test
                          pipeline                fixtures, and
                                                  evaluation

  RO5                     Produce traceable       Recommendations linked
                          recommendations and     to patterns, evidence,
                          prevention guidance     and testable checklist
                                                  items
  -----------------------------------------------------------------------

The detailed wording in the accepted MRP proposal remains authoritative.
If this summary differs from that document, update this table from the
accepted proposal rather than silently changing the objective.

### 2.2 Incident case studies

The current project materials identify five candidate incidents. Their
descriptions, amounts, category assignments, and source availability
must be checked against primary evidence before publication.

  -------------------------------------------------------------------------
  Candidate         Ecosystem         Candidate         Verification
  incident                            category in       requirement
                                      project materials 
  ----------------- ----------------- ----------------- -------------------
  Parity multisig   Ethereum          Library           Verify affected
  library incident                    Dependencies      contract/version,
                                                        root cause, and
                                                        reported amount

  Lido stSOL        Solana            Missing Recovery  Verify the exact
  incident                                              incident, affected
                                                        program, and
                                                        whether it is
                                                        comparable to
                                                        Solidity/EVM cases

  Gemholic incident zkSync            Transfer Logic    Verify source
                                                        version, transfer
                                                        behavior, and root
                                                        cause

  ezETH incident    Ethereum          State Transitions Verify the root
                                                        cause and whether
                                                        the case is
                                                        properly classified
                                                        as a fund-lock

  Perfect Finance   Ethereum          Withdrawal        Resolve conflicting
  incident                            Failures          descriptions in the
                                                        project materials
                                                        using primary
                                                        evidence
  -------------------------------------------------------------------------

**Important scope note:** the MVP is intended to analyze Solidity/EVM
source. A Solana incident may be useful as a research case study but
does not imply that FLARE can scan Rust/Solana programs.

For each incident, record the primary source, access date, affected
contract address and chain, source version or commit, root-cause
evidence, reported loss or locked amount, license/source availability,
and the reasoning for its category. Do not publish unverified amounts as
established facts.

### 2.3 Functional requirements

The product requirements identify the following target capabilities.
Their current implementation status must be checked separately.

  -----------------------------------------------------------------------
  ID                      Requirement             Acceptance evidence
  ----------------------- ----------------------- -----------------------
  FR-01                   Accept Solidity pasted  Valid input yields a
                          into the interface,     real result; invalid
                          uploaded as `.sol`, or  input yields a clear
                          fetched from a          error
                          supported verified      
                          contract address        

  FR-02                   Enforce input limits    Boundary tests prove
                          (project materials      oversized input is
                          specify 500 KB and      rejected before
                          3,000 lines)            analysis

  FR-03                   Run supported analyzers Isolation, network
                          in an isolated,         restriction, timeout,
                          resource-limited        and resource-limit
                          environment             tests pass

  FR-04                   Map supported findings  Every classification is
                          to the five approved    traceable to a rule and
                          fund-lock categories    evidence; unknown
                                                  findings remain visibly
                                                  unclassified

  FR-05                   Produce a documented    Formula, weights, edge
                          risk score and level    cases, and limitations
                                                  are documented and
                                                  tested

  FR-06                   Provide per-finding     Each recommendation
                          recommendations         links to a defined
                                                  checklist or guidance
                                                  item

  FR-07                   Export a PDF report     Generated report
                                                  matches stored result
                                                  data and includes the
                                                  disclaimer

  FR-08                   Publish a benchmark     Results are generated
                          comparison              from reproducible
                                                  experiments, not
                                                  hand-entered
                                                  illustrative values

  FR-09                   Publish recommendations Public content is
                                                  traceable to the RO5
                                                  research output

  FR-10                   Fetch verified source   Clear handling for
                          by contract address, if unsupported chains,
                          retained in the         unverified contracts,
                          approved scope          and provider failure

  FR-11                   Enforce the approved    Automated tests prove
                          scan rate limit         the limit and reset
                                                  behavior

  FR-12                   Delete source according Tests verify
                          to the approved privacy temporary-file cleanup
                          lifecycle               and absence of source
                                                  in storage, logs,
                                                  responses, and
                                                  monitoring
  -----------------------------------------------------------------------

The PRD proposes a 30-second analysis timeout for supported contracts
under 500 lines. This is a target to validate, not a guarantee for every
contract.

### 2.4 Capstone requirements

Project materials identify academic deliverables including: - a
functioning project demonstration and deployment evidence, subject to
the approved architecture; - ten Agile/Scrum or SDLC diagrams aligned
with the college coordinator's rubric; - architecture, API, data model,
workflow, sequence, activity, and deployment documentation as required
by the rubric; - a structured Capstone report and traceability to the
project requirements.

**Pending:** obtain and check the official college rubric. Do not assume
a generic set of ten diagrams automatically satisfies the evaluator's
requirements.

Project documents identify 31 March 2027 as a final academic deadline;
confirm dates against the latest official instructions. Any earlier
internal target is a planning milestone, not a replacement for the
official deadline.

### 2.5 Product targets versus measured results

The project materials list target metrics such as scan time, precision,
recall, uptime, and unhandled errors. These must be presented as
**targets until measured**.

For every published metric, record: - the exact test dataset and number
of cases; - ground-truth labels and how they were established; - tool
versions and settings; - measurement procedure and script; - result,
date, and limitations.

Do not claim a target has been met merely because a test was planned or
a table exists.

------------------------------------------------------------------------

## 3. Features and Scope

### 3.1 Intended MVP features

-   Solidity source input by paste or `.sol` upload.
-   Verified-source lookup by address only if supported by the approved
    architecture and implementation.
-   Real static analysis using the approved tools.
-   Normalized findings with tool, detector, source location, and
    evidence.
-   Rule-based classification into the five fund-lock categories.
-   Documented risk score and category breakdown.
-   Evidence-linked recommendations.
-   Report export.
-   Public benchmark and recommendations pages.
-   Anonymous scans if confirmed by the final privacy and deployment
    design.
-   Automated tests, CI, monitoring, and release checks appropriate to
    the selected architecture.

### 3.2 Out of scope for the initial MVP

The PRD places the following outside the MVP: - native Solana/Rust and
Vyper analysis; - formal verification integrations; - fuzzing
integrations; - user accounts and persistent user scan history; -
real-time monitoring of deployed contracts; - general exploit detection
as a broad promise (for example, comprehensive reentrancy or
oracle-manipulation detection); - a mobile application.

A case study about a non-EVM incident does not add that chain to
supported product inputs.

### 3.3 Possible future work

Potential later directions include additional chain support, team
dashboards, a CI/CD API, portfolio monitoring, and other integrations.
These are future ideas, not commitments for the first release. They must
not delay the locked MVP work unless formally approved.

### 3.4 Known limitations

-   The taxonomy is a research artifact that must be validated, not
    assumed correct.
-   A small incident set limits how broadly benchmark results can be
    generalized.
-   Static analysis can miss issues and can report false positives.
-   Source code may be unavailable, incomplete, or different from
    deployed bytecode.
-   A score compresses complex evidence and must not be interpreted as a
    probability of loss unless statistically calibrated.
-   Free hosting services may impose limits or change their terms; if
    cloud hosting is approved, portability and provider limits must be
    considered.
-   The current prototype contains incomplete or sample-data behavior.
    See Section 7 for the status described by the reviewed repository.

------------------------------------------------------------------------

## 4. System Architecture

### 4.1 Architecture decision that must be resolved

The project records available for this README contain conflicting
architecture directions:

-   one target design describes a cloud-hosted Next.js frontend, FastAPI
    API, Redis queue, isolated Docker worker, PostgreSQL service, and
    external source lookup;
-   the earlier FLARE execution baseline describes a local-first design
    with isolated analysis and no cloud fallback or public scanning.

These designs have different privacy, security, deployment, and
operational consequences. **Do not silently combine them.** Before
implementing infrastructure or treating deployment diagrams as final,
the project owner must confirm which approved baseline governs. Record
the decision and rationale in an architecture decision record.

The component descriptions below explain the intended responsibilities.
Any provider-specific deployment is conditional on that decision.

### 4.2 Logical components

  -----------------------------------------------------------------------
  Component               Responsibility          Status in reviewed
                                                  prototype
  ----------------------- ----------------------- -----------------------
  User interface          Accept source, show     Prototype exists; not
                          scan state, display     verified as a complete
                          findings and            workflow
                          recommendations         

  API                     Validate requests,      Prototype exists; some
                          manage scan lifecycle,  endpoints return sample
                          return consistent       data
                          errors, expose results  

  Scan coordinator/queue  Manage work and prevent Planned; not connected
                          requests from blocking  
                          the API                 

  Isolated analysis       Run approved            Planned; not
  worker                  static-analysis tools   implemented
                          under strict limits     

  Analyzer adapters       Invoke tools and        Real integration not
                          convert their outputs   verified
                          into a common structure 

  Pattern engine          Apply versioned,        Prototype or planned;
                          evidence-backed rules   rules unvalidated
                          to normalized findings  

  Risk assessment         Calculate score and     Formula requires
                          level from documented   approval and testing
                          rules                   

  Database                Store permitted scan    Schema exists but was
                          metadata and results    reported to have SQL
                                                  defects

  Report generator        Render a report from    Planned
                          stored result data      

  Source lookup client    Retrieve verified       Planned
                          source from a supported 
                          provider                

  Monitoring and          Detect service errors   Planned; configuration
  operational checks      and availability        not verified
                          problems                
  -----------------------------------------------------------------------

### 4.3 Trust boundaries

The API and analysis worker have different responsibilities. The API
should validate and coordinate; the worker processes untrusted source in
a restricted environment. The worker must not receive secrets or
unrestricted network access. The exact isolation mechanism must be
selected and tested against the approved architecture.

The submitted Solidity source is data to be inspected, not a program
that FLARE should deploy or execute. Static analyzers may parse or
process source and compiler artifacts, so their execution environment
still needs resource and filesystem restrictions.

### 4.4 Result integrity

A finding should retain enough provenance to explain how it was
produced: - scan identifier and timestamp; - analyzer name and
version; - detector identifier and raw-output reference; - source
location when available; - normalized finding type and severity; -
classification rule identifier and version; - evidence and
recommendation references; - status indicating complete, partial,
failed, or timed out analysis.

A result must never conceal an analyzer failure by returning an
ordinary-looking score. If some tools fail, FLARE must report which
tools ran and whether the result is partial.

------------------------------------------------------------------------

## 5. Visual Diagrams

The following diagrams describe the **logical target workflow**, not
proof that the system is implemented. Provider-specific deployment
remains pending until the architecture decision in Section 4.1 is
resolved.

### 5.1 Beginner overview: what the user does

``` mermaid
flowchart TD
    A["Developer provides Solidity source"] --> B["FLARE validates the input"]
    B --> C["Static-analysis tools inspect the source"]
    C --> D["FLARE normalizes tool findings"]
    D --> E["Evidence-backed rules classify findings"]
    E --> F["Risk assessment summarizes the evidence"]
    F --> G["Developer reviews findings and limitations"]
    G --> H["Recommendations and report, when implemented"]
    B -->|Invalid input| I["Clear validation error"]
    C -->|Tool failure or timeout| J["Clear failed or partial result"]
```

### 5.2 Logical system architecture

``` mermaid
flowchart LR
    U["Developer"] --> UI["Frontend"]
    UI --> API["API and scan coordinator"]
    API --> V["Validation and policy checks"]
    V --> Q["Job handoff / queue"]
    Q --> W["Isolated analysis worker"]
    W --> S["Slither adapter"]
    W --> A["Aderyn adapter"]
    S --> N["Finding normalization"]
    A --> N
    N --> R["Versioned classification rules"]
    R --> RS["Risk assessment"]
    RS --> DB[("Permitted scan metadata and results")]
    DB --> API
    API --> UI
    UI --> U
    RS --> REP["Report generator"]
    REP --> DB
```

### 5.3 Scan data flow

``` mermaid
flowchart TD
    SRC["Raw source supplied by user"] --> LIMIT["Size, line-count, and format checks"]
    LIMIT -->|Rejected| ERR["Validation error; no analysis"]
    LIMIT -->|Accepted| TEMP["Temporary worker input"]
    TEMP --> TOOL["Static analyzer output"]
    TOOL --> RAW["Preserve permitted raw output / evidence"]
    RAW --> NORMAL["Normalize and deduplicate findings"]
    NORMAL --> CLASS["Apply versioned rules"]
    CLASS --> UNCLASS["Keep unsupported findings visibly unclassified"]
    CLASS --> SCORE["Calculate score using documented formula"]
    UNCLASS --> RESULT["Assemble result and limitations"]
    SCORE --> RESULT
    RESULT --> STORE["Persist permitted result fields"]
    TEMP --> CLEAN["Delete temporary source according to policy"]
```

### 5.4 Scan lifecycle and failure paths

``` mermaid
stateDiagram-v2
    [*] --> Submitted
    Submitted --> Rejected: Invalid input or limit exceeded
    Submitted --> Accepted: Input valid
    Accepted --> Queued: Work accepted
    Queued --> Running: Worker starts
    Running --> Completed: Required analyzers finish
    Running --> Partial: Some usable output, another analyzer failed
    Running --> TimedOut: Time limit reached
    Running --> Failed: No usable output or fatal error
    Partial --> ResultStored: Partial result and limitations saved
    Completed --> ResultStored: Result saved
    TimedOut --> ResultStored: Only if safe, meaningful partial output exists
    TimedOut --> Failed: No usable output
    Failed --> ErrorReturned: Clear error returned
    Rejected --> [*]
    ResultStored --> ResultReturned
    ErrorReturned --> [*]
    ResultReturned --> [*]
```

### 5.5 Research workflow

``` mermaid
flowchart TD
    I["Select candidate incident"] --> SRC["Verify primary sources and exact contract"]
    SRC --> LABEL["Document root cause and ground-truth label"]
    LABEL --> RUN["Run pinned analyzers with recorded settings"]
    RUN --> RAW["Store raw outputs and tool versions"]
    RAW --> RULES["Apply taxonomy and classification rules"]
    RULES --> METRICS["Calculate metrics from labeled cases"]
    METRICS --> REVIEW["Review errors, false positives, and limitations"]
    REVIEW --> REPRO["Reproduce results from a clean checkout"]
    REPRO --> PUB["Publish only measured, qualified claims"]
```

### 5.6 Deployment diagram

**Pending architecture decision:** do not treat a cloud-provider diagram
as approved until the local-first versus cloud-hosted conflict in
Section 4.1 is resolved. Once resolved, replace or qualify the following
conceptual deployment map with the selected design.

``` mermaid
flowchart TB
    REPO["Version-controlled repository"] --> CI["Automated checks"]
    CI -->|Checks pass| ART["Build artifacts"]
    ART --> API["API runtime"]
    ART --> WORKER["Restricted analysis worker"]
    API --> DB[("Result storage")]
    API --> Q["Queue or coordinator"]
    Q --> WORKER
    USER["Developer"] --> UI["Frontend"]
    UI --> API
    API --> OBS["Logs and monitoring with source redaction"]
```

### 5.7 Diagram interpretation

-   The **frontend** collects input and presents results; it should not
    decide whether an analyzer finding is valid.
-   The **API** validates and coordinates; it should not run untrusted
    analysis with unrestricted privileges.
-   The **worker** runs the tools in a constrained environment.
-   The **normalizer and rules engine** convert tool output into
    consistent, traceable findings.
-   The **risk assessment** summarizes evidence using a documented
    formula.
-   The **database** stores only fields allowed by the approved
    retention and privacy policy.
-   The **research pipeline** is separate from the user-facing scan
    flow: it creates reproducible evidence for evaluating FLARE.

------------------------------------------------------------------------

## 6. Technology Stack

The following stack appears in the PRD/prototype direction. It is not a
final architecture approval while Section 4.1 remains unresolved.

  -------------------------------------------------------------------------
  Technology              Intended purpose        Status / decision
  ----------------------- ----------------------- -------------------------
  Next.js and React       Web interface           Present in prototype; UI
                                                  not fully verified

  TypeScript              Frontend type safety    Used by frontend
                                                  prototype

  Tailwind CSS            Interface styling       Present in prototype

  FastAPI and Python      API and orchestration   Prototype exists

  Uvicorn                 Run FastAPI             Intended server

  Pydantic                Validate API data       Intended
                          structures              

  Slither                 Solidity static         Required candidate; real
                          analysis                integration not verified

  Aderyn                  Solidity static         Required candidate; real
                          analysis                integration not verified

  Mythril                 Research comparison     Benchmark use proposed
                          tool                    

  Securify                Research comparison     Benchmark use proposed;
                          tool                    installation and
                                                  availability must be
                                                  verified

  Docker or another       Restrict worker         Planned; security
  approved isolation      execution               controls require tests
  mechanism                                       

  PostgreSQL              Structured result       Target data store; schema
                          storage                 needs correction

  Redis                   Queue/rate limiting if  Planned; architecture
                          cloud/queue             dependent
                          architecture is         
                          approved                

  PDF library             Report export           Pending selection and
                                                  validation

  GitHub Actions          CI checks               Workflow file
                                                  placement/configuration
                                                  needs verification

  Sentry / uptime monitor Operational visibility  Planned; privacy
                          if approved             scrubbing required
  -------------------------------------------------------------------------

### 6.1 Dependency and configuration issues recorded in the prototype review

The reviewed README identifies the following issues that must be
verified and resolved before relying on setup instructions: -
`backend/requirements.txt` includes an `asyncio` dependency entry that
may conflict with Python's standard library. - `httpx` is duplicated in
the dependency list. - Analyzer tools and PDF libraries may have
system-level dependencies and have not been verified together. - A
workflow file appears to be outside the standard `.github/workflows/`
directory. - The database schema reportedly contains inline index syntax
that PostgreSQL rejects. - Deployment configuration files have not been
verified against the target providers. - Dependency versions and lock
files need a reproducible installation strategy.

Do not assume these issues are fixed until the relevant commands and
tests have actually run.

### 6.2 Cost and portability

The project aims to avoid mandatory paid services. A free-tier label
does not guarantee a provider will remain free or meet the product's
performance and privacy needs. Provider selection must follow the
approved architecture, current terms, and security review. The product
should avoid unnecessary coupling to one hosting provider where
practical.

### 6.3 Licensing

Review the licenses of analyzer tools and third-party contract sources
before distribution or hosted use. The repository's own license is a
pending decision and must not be guessed. Record the selected license
and any attribution obligations.

------------------------------------------------------------------------

## 7. Repository Structure

### 7.1 Current structure reported by the reviewed README

The reviewed README describes the repository as a staging location
rather than a verified, functioning application. It reports these files
and caveats:

``` text
FLARE/
├── README.md
├── .env.example
├── .github-workflows-deploy.yml   # Reported outside the standard workflow directory
├── backend/
│   ├── app.py                     # Prototype; sample findings
│   └── requirements.txt           # Reported dependency issues
├── frontend/
│   ├── package.json               # Not verified as installed/built
│   └── app/
│       ├── globals.css
│       ├── layout.tsx
│       ├── page.tsx               # Prototype; some placeholders
│       ├── benchmark/page.tsx     # Illustrative values reported
│       └── recommendations/page.tsx
├── docker/
│   └── Dockerfile                 # Reported to build API image, not worker
├── supabase-schema.sql            # Reported SQL syntax defect
├── render.yaml                    # Provider format not verified
├── vercel.json                    # Build settings not verified
└── DEPLOYMENT.md                  # Written before deployment was attempted
```

**This is a report of the supplied README's repository inventory, not a
fresh filesystem inspection.** Recheck it against the actual repository
before treating it as current.

### 7.2 Possible future structure

The following is a proposed organization, not a statement that these
paths already exist. Adapt it to the approved architecture rather than
creating directories just to match the diagram.

``` text
FLARE/
├── backend/
│   ├── app/                  # API routes, models, configuration
│   ├── engine/               # Analyzer adapters, normalization, rules, scoring
│   ├── worker/               # Restricted scan entry point
│   └── tests/
│       ├── unit/
│       ├── integration/
│       ├── golden/
│       ├── privacy/
│       └── failure/
├── rules/
│   └── rules.yaml            # Versioned rules with evidence references
├── benchmark/
│   ├── contracts/            # Source references and case-study notes
│   ├── raw/                  # Original analyzer outputs
│   ├── results/              # Generated, reproducible tables
│   └── run_benchmark.py
├── frontend/
├── db/                       # Schema and migrations, if database is approved
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── TAXONOMY.md
│   ├── SECURITY.md
│   ├── DECISIONS.md
│   └── UAT.md
├── .github/workflows/
├── .env.example
└── README.md
```

### 7.3 Repository organization principles

-   Keep application code, research data, raw tool outputs, and
    documentation clearly separated.
-   Keep raw benchmark outputs immutable; generate result tables from
    scripts.
-   Version the classification rules and risk formula.
-   Never commit secrets, `.env` files, or source samples without
    appropriate licensing and approval.
-   Keep planned paths labeled as planned until created.
-   Prefer small modules with tests over one large API file containing
    all responsibilities.

------------------------------------------------------------------------

## 8. Backend Development Plan

The development order below is **locked**. Do not reorder it casually.
Each phase has a defined goal and exit criteria. If a blocker requires a
change, record the reason and obtain explicit approval before changing
the order.

### Phase 1 --- Backend foundation

**Purpose:** establish a reliable backend base before building the
analysis features.

**Scope** - Project structure and module boundaries. - Configuration and
environment-variable validation. - Database schema and migrations if the
approved architecture uses a database. - Written API contracts and
consistent request/response models. - Input validation and safe error
handling. - Structured logging that does not expose submitted source. -
Initial health checks and CI checks. - Unit tests for each module as it
is implemented.

**Exit criteria** - The backend starts with valid configuration and
fails clearly when required configuration is missing. -
Schema/migrations apply cleanly to a fresh database, if applicable. -
API request and response shapes are documented and validated. -
Malformed and oversized input is rejected before analysis. - Error
responses use one documented format. - Tests prove source text is not
written to logs. - CI runs the documented checks successfully.

### Phase 2 --- Core analysis engine

**Purpose:** replace sample behavior with real, evidence-backed
analysis.

**Scope** - Integrate the approved real analyzer tools. - Record
analyzer versions, command arguments, exit codes, stdout/stderr
handling, and duration. - Normalize findings into a stable internal
schema. - Create versioned classification rules with evidence
references. - Preserve findings that do not match a rule as
unclassified. - Define and document the risk formula, weights,
thresholds, and critical-case behavior. - Create known-positive,
known-negative, fixed, malformed, and edge-case fixtures. - Run research
benchmarks with reproducible configurations.

**Exit criteria** - Real analyzer output is used; sample findings cannot
appear as real results. - Parser tests cover normal, empty, malformed,
and partial tool output. - Every classification is traceable to a rule
and evidence. - Unknown findings remain visible rather than being
silently discarded. - Risk scoring has boundary tests and a documented
rationale. - Benchmark tables can be regenerated from saved raw
outputs. - Claims about accuracy are limited to the dataset and
methodology.

### Phase 3 --- Backend security and reliability

**Purpose:** protect the service and its host while processing untrusted
source.

**Scope** - Isolated analysis execution under the approved
architecture. - No unnecessary network access, secrets, or host
permissions in the worker. - CPU, memory, process, file-size, and
wall-clock limits. - Safe temporary-file creation and cleanup. - Source
privacy across logs, database, API responses, monitoring, and reports. -
Rate limiting where required by the approved design. - Defined handling
for tool crashes, timeouts, interrupted work, database errors, queue
errors, and concurrent scans. - Dependency and configuration review.

**Exit criteria** - Isolation controls are demonstrated by tests, not
just configuration claims. - Timeout and resource-limit tests pass. -
Temporary source cleanup is tested for success and failure paths. - A
known source string is absent from persisted records, logs, error
responses, and monitoring payloads. - Failure modes return a clear
failure or accurately labeled partial result. - No error path silently
produces a normal-looking success score. - Remaining risks are
documented and explicitly accepted or fixed.

### Phase 4 --- Complete backend integration

**Purpose:** verify the complete backend workflow before full frontend
development.

**Scope** - Connect validation, scan orchestration, analyzers,
normalization, classification, scoring, persistence, result retrieval,
and report generation. - Implement and test the approved API contract. -
Verify scan status transitions and idempotent/error behavior where
relevant. - Test report consistency with stored result data. - Test
integration with all approved dependencies.

**Exit criteria** - A real contract can be submitted through the API and
produces a traceable result. - Stored results can be retrieved and match
the completed scan. - Invalid, failed, timed-out, and partial scans have
documented API behavior. - Report generation works or is explicitly
identified as outside the current release scope. - API and integration
tests pass from a clean environment. - No sample findings are returned
by the production scan path. - Backend acceptance evidence is recorded.

### Phase 5 --- Frontend development

**Purpose:** build the user experience against a verified backend
contract.

**Scope** - Input flow for supported source types. - Input limits and
clear validation feedback. - Scan progress and completed/partial/failed
states. - Findings, evidence, category breakdown, risk explanation, and
recommendations. - Explicit tool coverage and limitations. - Benchmark
and recommendations pages, using measured results only. - Report export
and privacy/disclaimer information. - Accessible and understandable
error states.

**Exit criteria** - The interface uses real API responses for real scan
flows. - Loading, empty, validation, rate-limit, timeout,
partial-result, and server-error states are tested. - Source code and
analyzer output are rendered safely as text. - No illustrative benchmark
numbers are presented as measured. - UI tests and production build
checks pass.

### Phase 6 --- End-to-end verification and release

**Purpose:** establish that the complete product is fit for its declared
release scope.

**Scope** - End-to-end tests from source submission to result and
report. - Regression, security-boundary, privacy, and failure-mode
tests. - Installation and deployment verification under the approved
architecture. - Performance and load tests sized to the expected use. -
Monitoring/health checks where applicable. - User acceptance testing and
feedback. - Final documentation, MRP evidence, Capstone traceability,
and release notes.

**Exit criteria** - Critical and high-severity defects are fixed or
explicitly documented as release blockers/accepted risks. - Release
tests pass from a clean setup. - Research results reproduce from the
repository. - Privacy statements match tested behavior. - The deployed
or locally distributable artifact matches the approved architecture. -
Known limitations and unsupported cases are visible to users. - Academic
deliverables have traceable evidence.

### 8.1 Work that may run alongside engineering

Research source verification, taxonomy literature review, and
preparation of academic documentation can proceed alongside development
where they do not violate dependencies. This parallel research work does
not change the six-phase engineering order. Keep research tasks in a
separate workstream rather than reusing the phase numbers.

------------------------------------------------------------------------

## 9. Analysis Methodology

### 9.1 What the analysis is meant to do

FLARE is intended to analyze source code using static-analysis tools,
then add a fund-lock-specific interpretation layer. It does not execute
the submitted contract and does not prove that a contract is safe.

The pipeline is: 1. Validate source and supported input format. 2. Run
approved analyzers in the restricted environment. 3. Capture tool status
and output. 4. Normalize findings into a common schema. 5. Apply
versioned, evidence-backed rules. 6. Keep unclassified findings visible.
7. Calculate a risk summary using the approved formula. 8. Link findings
to evidence and recommendations. 9. Return a complete, partial, or
failed result with coverage details.

### 9.2 Candidate five-category taxonomy

The current PRD materials identify these categories. They are a research
taxonomy to validate, not proven universal categories.

  --------------------------------------------------------------------------
  Category                Intended meaning        Validation questions
  ----------------------- ----------------------- --------------------------
  Library Dependencies    Funds or functionality  Does the dependency
                          depend on an            failure actually block
                          external/library        asset recovery? Is the
                          component that can      pattern represented by
                          become unavailable or   reliable evidence?
                          unusable                

  Missing Recovery        No valid migration,     Is recovery truly
                          emergency exit, or      impossible, or merely
                          recovery path exists    delayed/administratively
                          when normal operation   controlled?
                          fails                   

  State Transitions       Contract state changes  Which state transition
                          create an invalid or    causes the lock? Can the
                          unreachable state with  state be reversed?
                          no valid exit           

  Transfer Logic          Transfer handling or    Does the behavior cause a
                          token-interface         real fund-lock, or is it a
                          assumptions can cause   broader token-handling
                          assets or accounting to bug?
                          become inconsistent or  
                          inaccessible            

  Withdrawal Failures     The withdrawal path     Is the failure persistent,
                          fails or becomes        and what exact condition
                          unreachable under a     prevents withdrawal?
                          defined condition       
  --------------------------------------------------------------------------

The definitions, boundaries, severity weights, subcategories, and
incident mappings must be justified using incident evidence and test
cases. If a case does not fit a category, record the ambiguity instead
of forcing a label.

### 9.3 Analyzer roles

-   **Slither:** candidate primary Solidity static analyzer; integration
    and version must be verified.
-   **Aderyn:** candidate additional Solidity analyzer; integration and
    version must be verified.
-   **Mythril and Securify:** candidate comparison tools in the research
    plan. Their installability, compatibility, licensing, and exact role
    must be verified before committing to the benchmark.

Do not imply all tools are integrated into the user-facing MVP merely
because they are listed for research comparison.

### 9.4 Finding normalization

A normalized finding should include, where available: - analyzer name
and version; - detector identifier; - severity reported by the original
tool; - source file and line range; - concise description; -
raw-output/evidence reference; - rule identifier and version, if
classified; - category and confidence/qualification, if the method
defines one; - recommendation reference; - classification status:
classified, unclassified, or not applicable.

Do not discard original tool metadata when converting it. Preserve
enough information to trace a FLARE finding back to the analyzer's
output.

### 9.5 Risk score

The PRD calls for a score from 0 to 100 and levels such as Low, Medium,
High, and Critical. The formula, category weights, aggregation method,
thresholds, and treatment of a Critical finding are **pending until
formally approved and tested**.

A risk score must be described as a rule-based summary unless research
establishes a statistically calibrated interpretation. It must not be
presented as the probability of losing funds. Show the categories and
evidence behind the score, and explain that missing detections or
incomplete analysis can make the score misleading.

### 9.6 Recommendations

Each recommendation should include: - the relevant fund-lock pattern; -
the condition or code pattern that triggered it; - the evidence or rule
reference; - a concrete action for the developer to review; - any caveat
where the recommendation depends on context; - a link to the
corresponding RO5 prevention checklist item.

Recommendations must not be generic text detached from the actual
finding.

### 9.7 Benchmark methodology

The benchmark must be reproducible: 1. Freeze the candidate contracts
and source references. 2. Document whether each contract/source version
is usable and licensed for the intended purpose. 3. Define ground-truth
labels with supporting evidence. 4. Pin tool versions and exact
commands/settings. 5. Run each tool in the documented environment. 6.
Save raw output without manual editing. 7. Normalize and classify
outputs using a versioned process. 8. Calculate metrics using a script.
9. inspect false positives, false negatives, and tool failures. 10.
Re-run from a clean checkout and compare generated results.

Definitions: - **Recall** = true positive findings divided by all known
positive cases/findings under the defined labeling method. -
**Precision** = true positive findings divided by all findings reported
as positive under the same method.

The exact unit of analysis (contract, vulnerability instance, or
finding) must be defined before calculating these metrics. Do not mix
definitions across tools.

Five incidents are a small sample. Report sample size and uncertainty;
do not generalize beyond what the dataset supports.

------------------------------------------------------------------------

## 10. Database and API Documentation

### 10.1 Data model principles

The final schema depends on the approved architecture. If result
persistence is retained, the model should store only the fields required
for results, traceability, rate limiting, and research---not the
submitted source.

A possible logical model is:

  -----------------------------------------------------------------------
  Entity                  Purpose                 Candidate fields
  ----------------------- ----------------------- -----------------------
  Scan                    One submitted analysis  scan ID, timestamps,
                          request                 source hash, status,
                                                  risk summary, analyzer
                                                  versions, duration

  Finding                 One normalized tool     finding ID, scan ID,
                          finding                 detector, analyzer,
                                                  location, category,
                                                  severity, rule ID,
                                                  evidence reference

  Rule                    Versioned               rule ID, version,
                          classification rule     category, matching
                                                  criteria, evidence
                                                  citation,
                                                  recommendation ID

  Recommendation          Prevention guidance     recommendation ID,
                                                  checklist reference,
                                                  guidance text, evidence
                                                  reference

  Benchmark run           Reproducible research   run ID, tool versions,
                          execution               dataset version,
                                                  configuration, output
                                                  reference, metrics

  Rate-limit record       Abuse-control metadata  limited identifier or
                          if required             hash, window,
                                                  count/expiry
  -----------------------------------------------------------------------

This is a logical proposal, not confirmation that these tables exist.
Avoid duplicating derived data unless there is a documented reason.
Source code should not be stored in the result database under the
intended privacy model.

### 10.2 API contract

The exact endpoint paths and response schemas must be finalized during
Phase 1. The following are prototype paths reported in the existing
documentation, not a frozen API contract.

  --------------------------------------------------------------------------
  Method and path            Reported prototype      Intended behavior
                             behavior                
  -------------------------- ----------------------- -----------------------
  `POST /scan`               Validates some input    Accept a supported
                             and returns sample      request and
                             findings                initiate/complete real
                                                     analysis according to
                                                     the API design

  `GET /results/{scan_id}`   Returns fixed sample    Retrieve the
                             data for IDs            corresponding permitted
                                                     result or return not
                                                     found

  `GET /recommendations`     Static content          Return approved RO5
                                                     guidance

  `GET /benchmark`           Illustrative values     Return reproducible,
                                                     measured benchmark
                                                     results with dataset
                                                     details

  `GET /health`              Basic status/time       Report service health
                             response                without exposing
                                                     secrets; dependency
                                                     checks depend on design

  `GET /`                    Endpoint listing        Keep a documented root
                                                     response or redirect to
                                                     API documentation
  --------------------------------------------------------------------------

Planned report and address-lookup endpoints must be specified only after
the interface and architecture are approved.

### 10.3 Request and response design

A scan request may accept source text or a file, but the exact schema is
pending. The API contract must define: - supported input modes and
mutual exclusivity; - maximum bytes and lines; - validation errors; -
scan ID and lifecycle/status behavior; - complete, partial, rejected,
timed-out, and failed outcomes; - finding schema and evidence fields; -
rate-limit behavior; - result retention and retrieval rules; - API
versioning and compatibility expectations.

Do not copy sample values into production responses. Any examples
included in API documentation must be explicitly marked as examples.

### 10.4 Error format

Use one consistent error envelope. A proposed shape is:

``` json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "The submitted source exceeds the permitted size.",
    "request_id": "example-request-id"
  }
}
```

This is a **proposed example**, not a verified response from the
prototype. The final contract should map input rejection, missing
results, rate limits, dependency failures, timeouts, and unexpected
errors to documented status codes and error codes. Do not return raw
stack traces, internal paths, credentials, or submitted source in error
messages.

### 10.5 Persistence and source lifecycle

The source lifecycle must be specified precisely: - where source is
received; - when it is copied to temporary storage; - which component
can read it; - when cleanup runs; - what happens on timeout, process
crash, cancellation, or host restart; - which result fields are retained
and for how long; - whether source hashes, IP-derived identifiers, or
external contract addresses are stored; - what is included in logs,
monitoring events, and reports.

A statement such as "source is deleted after scanning" is not sufficient
until the lifecycle is tested on both success and failure paths.

------------------------------------------------------------------------

## 11. Security and Privacy

### 11.1 Threat model

FLARE processes untrusted source and tool output. Relevant risks
include: - resource exhaustion from unusually complex input; -
parser/analyzer crashes or vulnerabilities; - attempts to access files
or environment data outside the worker; - accidental network access from
the worker; - source leakage through logs, errors, database rows,
analytics, or monitoring; - denial of service from repeated requests; -
unsafe rendering of source text in the browser; - misleading results
caused by partial analysis or stale rules; - secret exposure through
repository or CI configuration.

### 11.2 Worker isolation

The PRD's proposed worker controls include: - no unnecessary network
access; - read-only filesystem except controlled temporary storage; -
CPU and memory limits; - a hard wall-clock timeout; - no API credentials
or database credentials in the worker; - no execution of the submitted
contract; - cleanup of temporary files.

Project materials propose example limits of one CPU, 512 MB memory, and
30 seconds. These are proposed settings to validate against analyzer
behavior and product targets, not proof of effective isolation. The
exact controls must match the approved local/cloud architecture and be
tested.

### 11.3 Source privacy

The intended policy is to avoid storing submitted source in the results
database, logs, error responses, monitoring payloads, or generated
reports. If the product claims that source is deleted after a scan,
tests must verify: - normal success; - analyzer failure; - timeout; -
worker termination; - database failure after analysis; - retry or
duplicate-job behavior; - temporary storage cleanup after restart, where
applicable.

The contract hash and findings may still be sensitive in context.
Document what is retained, why it is retained, and for how long.

### 11.4 Logging and monitoring

Logs should contain request/scan identifiers, component, status, timing,
and sanitized error codes---not source code or full request bodies.
Monitoring integrations must be configured to redact sensitive request
data. Test this configuration rather than relying on defaults.

### 11.5 Rate limiting and abuse controls

The PRD proposes a limit of five scans per IP per hour. Confirm the
exact policy, identifier handling, window semantics, and response
behavior in Phase 1/3. IP addresses can be personal data; any hashing or
retention design requires a privacy review and must not be described as
automatically compliant merely because the identifier is hashed.

### 11.6 Browser safety

Treat source code, filenames, analyzer messages, and external metadata
as untrusted text. Render them as text, not executable HTML. Apply
appropriate content-security and cross-origin policies for the chosen
deployment. Test malicious strings in findings and report content.

### 11.7 Privacy and legal claims

Do not claim compliance with a privacy law solely because the
application does not ask for a name. IP addresses, contract addresses,
logs, and usage metadata may still have privacy implications. Publish a
clear privacy notice and obtain qualified legal review where needed.
State what the product actually collects and retains.

### 11.8 Security release blockers

Do not release with an unresolved critical issue involving unrestricted
code-processing permissions, source disclosure, exposed secrets, unsafe
result rendering, or a misleading success response after analysis
failure. Record lower-severity residual risks and their owners.

------------------------------------------------------------------------

## 12. Testing and Quality Assurance

### 12.1 Testing principles

-   Test each module as it is implemented.
-   Test behavior, not merely whether a file exists or the application
    starts.
-   Use deterministic fixtures for classification and scoring.
-   Keep integration tests separate from unit tests.
-   Include negative and failure cases.
-   Run regression tests after changing rules, scores, dependencies, or
    analyzer versions.
-   Record the exact commands and outcomes.
-   Treat skipped or unexecuted tests as unverified, not passed.

### 12.2 Required test levels

  -------------------------------------------------------------------------
  Test type               Examples                  Expected evidence
  ----------------------- ------------------------- -----------------------
  Unit                    Input validation, output  Repeatable unit test
                          parsing, classification   results
                          rules, risk boundaries    

  Analyzer adapter        Valid output, malformed   Fixtures and
                          output, no findings,      integration results
                          nonzero exit, timeout     

  Golden cases            Known                     Versioned labels and
                          incident/fixed/negative   generated findings
                          contracts                 

  API contract            Request/response          Schema-based tests
                          validation and error      
                          mapping                   

  Database integration    Migrations,               Integration test output
                          save/retrieve, missing    
                          row, unavailable database 

  Privacy                 Source absence from DB,   Automated leak checks
                          logs, response,           
                          monitoring                

  Security boundary       No worker network access, Container/VM test
                          resource limits,          evidence
                          filesystem restrictions   

  Failure mode            Tool crash, timeout,      Clear failed/partial
                          queue outage, DB outage,  outcomes
                          cancellation              

  Frontend                Input states, result      UI test results
                          display, errors, safe     
                          text rendering            

  End to end              Submit source, complete   Staging or
                          scan, inspect result,     approved-environment
                          export report             run

  Performance             Scan duration,            Dataset and test
                          concurrency, memory and   conditions with
                          CPU                       measured results

  User acceptance         Users complete            Test plan and
                          representative tasks and  summarized feedback
                          explain results           
  -------------------------------------------------------------------------

### 12.3 Commands

The commands below are examples of the kinds of checks expected. **They
must be verified against the actual package scripts and test layout
before being treated as runnable instructions.**

``` bash
# Python backend, after pytest and project configuration exist
pytest -v

# Frontend, after package scripts are verified
npm test
npm run build

# Browser end-to-end tests, after configuration and environment exist
npx playwright test
```

Do not claim these commands passed until they have been run and their
output recorded. Keep a single canonical set of setup and test commands
in the repository.

### 12.4 Coverage and quality metrics

The PRD proposes a backend line-coverage target of 70%. Coverage is a
useful signal but does not prove correctness. Tests must directly cover
critical privacy behavior, risk-score boundaries, unclassified findings,
analyzer failures, and lifecycle cleanup.

For benchmarks, report precision and recall only after defining the unit
of analysis and ground truth. Do not set CI to preserve a misleading
baseline simply because it was the first measured result; baseline
changes require review and documentation.

### 12.5 Release gates

A release may proceed only when: 1. required tests pass in a clean,
reproducible environment; 2. no mock analysis path is exposed as real
analysis; 3. critical security and privacy checks pass; 4. failures and
partial results are accurately represented; 5. source handling matches
the published policy; 6. research outputs can be regenerated from saved
inputs and tool versions; 7. the user-facing disclaimer and limitations
are visible; 8. installation and deployment/distribution steps have been
verified; 9. known limitations and accepted risks are documented; 10.
MRP/Capstone deliverables have evidence tied to the approved rubric.

------------------------------------------------------------------------

## 13. Setup and Installation

### 13.1 Current status

The supplied documentation reports that the project has not yet been
fully installed, tested, or deployed. Some setup instructions depend on
fixing the dependency list, database schema, workflow location, and
deployment configuration. Therefore, the commands in this section are a
**setup outline**, not a guarantee that a fresh installation currently
succeeds.

### 13.2 Prerequisites

The prototype materials mention: - Python 3.11; - Node.js 18 or newer; -
Git; - Docker or the approved isolation runtime; - PostgreSQL if
database persistence is retained; - credentials for any external service
only if that service is approved.

Confirm actual version requirements from dependency manifests and tool
compatibility before implementation.

### 13.3 Environment configuration

Use `.env.example` as a list of variable names only. Copy it to a local
`.env` if the application expects that convention, and never commit the
populated file. Do not place secrets in frontend variables exposed to
browsers.

The prototype documentation mentions variables such as database
connection settings, Redis URL, source-lookup API key, monitoring DSN,
allowed origins, and frontend API URL. These must be reconciled with the
final architecture. Do not create credentials or configure services that
are no longer part of the approved design.

### 13.4 Installation workflow to verify

Once the dependency and architecture decisions are settled, the
installation guide should provide a tested sequence: 1. Clone the
repository. 2. Create and activate the Python environment. 3. Install
pinned backend dependencies. 4. Install frontend dependencies. 5.
Configure required environment variables. 6. Apply database migrations,
if applicable. 7. Build or start the isolated worker, if applicable. 8.
Start backend and frontend services. 9. Run health checks. 10. Run the
documented automated tests. 11. Submit a safe fixture contract and
verify a real result.

Do not label the installation complete until another clean environment
can follow the guide without undocumented manual fixes.

### 13.5 Analyzer installation

Pin analyzer versions and record the installation method and exact
invocation used for both research and product execution. The benchmark
environment and deployed/local product environment should not silently
use different tool versions. If they must differ, document why and
assess the impact.

------------------------------------------------------------------------

## 14. Research Reproducibility

### 14.1 Incident evidence package

For each case study, preserve: - incident name and date; -
chain/ecosystem and affected contract/program; - contract address,
commit, or source version; - primary post-mortem, audit, official
announcement, or other high-quality source; - access date and source
license; - evidence for the root cause; - evidence for any reported loss
or locked amount; - taxonomy label and explanation; - unresolved
disagreements or missing evidence.

The project materials propose a structure such as
`benchmark/contracts/<incident>/SOURCE.md`. Confirm or establish the
path in the repository.

### 14.2 Tool records

For every analyzer run, record: - tool name and version; - install
method and environment; - exact command and configuration; - source
identifier/hash; - exit code and execution time; - raw output and
stderr; - whether the run completed, timed out, or failed; - any
normalization steps applied afterward.

Keep raw output unmodified. Generated tables should come from scripts
rather than hand-edited values.

### 14.3 Ground truth and labeling

Define what counts as a positive fund-lock instance before measuring
performance. A case-study label should be supported by source evidence
and, where feasible, independently reviewed. Distinguish: - a confirmed
incident root cause; - a similar pattern in another contract; - an
analyzer warning; - a FLARE rule classification; - a confirmed
vulnerability.

These are not interchangeable.

### 14.4 Metrics and limitations

Report the chosen unit of analysis, true/false positives and negatives,
precision, recall, tool failures, and excluded cases. If the dataset is
too small to support a metric reliably, state that. Do not use a single
incident count as proof of broad superiority.

### 14.5 Reproduction procedure

A reproducible research run should: 1. start from a clean checkout; 2.
install recorded tool versions; 3. obtain or verify the documented
source inputs; 4. run the benchmark script with documented settings; 5.
regenerate normalized findings and metric tables; 6. compare outputs
against the recorded baseline; 7. explain any differences caused by
platform or dependency changes.

A reader should be able to determine exactly which inputs and versions
produced every published number.

------------------------------------------------------------------------

## 15. Deployment, Troubleshooting, and Contribution Guidelines

### 15.1 Deployment

Deployment is not verified in the reviewed materials. The final
deployment guide depends on the architecture decision in Section 4.1. It
must document: - where the frontend, API, worker, and database run; -
how the worker is isolated; - which network connections are allowed; -
where secrets are stored; - how schema changes are applied; - how logs
are redacted; - health and readiness checks; - restart and recovery
behavior; - backup/retention behavior if persistence is used; - rollback
steps; - free-tier limitations, if relevant.

Do not publish a public scanning service until the isolation, privacy,
resource-limit, and abuse controls have been verified.

### 15.2 Troubleshooting guidance

  ------------------------------------------------------------------------
  Symptom                 Possible cause          Next check
  ----------------------- ----------------------- ------------------------
  Python dependency       Invalid or incompatible Inspect dependency
  installation fails      dependency entry        manifest and resolve
                                                  versions

  Database migration      Invalid SQL or schema   Run migrations against a
  fails                   mismatch                clean disposable
                                                  database

  Results look identical  Sample/mock response    Trace the request to the
  across unrelated        still connected         real analyzer execution
  contracts                                       path

  Scan times out          Complex source, tool    Inspect sanitized logs
                          issue, or resource      and recorded analyzer
                          limit                   status

  Scan has no findings    No detector matched,    Check tool status and
                          analyzer failed, or     raw output before
                          unsupported source      interpreting it

  Frontend cannot reach   Wrong URL, CORS, or     Verify configured
  API                     service unavailable     endpoint and server logs

  Source appears in logs  Request-body capture or Treat as a privacy
  or monitoring           unsafe exception        incident; disable
                          logging                 capture, investigate,
                                                  and add regression tests

  Benchmark numbers       Tool version, input,    Compare
  change                  settings, rules, or     versions/configuration
                          labels changed          and regenerate results

  Report differs from     Separate formatting or  Generate both from the
  results page            data path               same canonical result
                                                  object
  ------------------------------------------------------------------------

Troubleshooting steps should be updated from real observed failures, not
presented as verified fixes before testing.

### 15.3 Contribution workflow

Proposed practices: - Work on a focused branch and submit a reviewed
change. - Tie changes to a requirement, phase, issue, or acceptance
criterion. - Include tests for behavior changes. - Record changes to
taxonomy rules and scoring in the decision log. - Rerun affected
benchmarks when rules, tool versions, labels, or scoring change. - Do
not commit secrets, private data, or unlicensed contract samples. -
Document setup changes and keep examples synchronized with
implementation.

Confirm the final branch protection, commit, review, and release
policies with the repository owner.

### 15.4 Responsible disclosure

Before public release, define a contact and procedure for reporting
vulnerabilities in FLARE itself. Do not invent a security contact
address. Add the verified contact and response expectations once
approved.

------------------------------------------------------------------------

## 16. Project Roadmap and Traceability

### 16.1 Locked engineering roadmap

  ------------------------------------------------------------------------------
  Order             Phase             Main outcome      Required evidence to
                                                        exit
  ----------------- ----------------- ----------------- ------------------------
  1                 Backend           Reliable          Schema/config/API/unit
                    foundation        configuration,    tests pass
                                      data model, API   
                                      contract,         
                                      validation,       
                                      logging, and      
                                      errors            

  2                 Core analysis     Real analyzer     Analyzer, classifier,
                    engine            integrations,     scoring, and benchmark
                                      normalized        tests pass
                                      findings,         
                                      validated rules,  
                                      documented score  

  3                 Backend security  Restricted        Isolation, privacy, and
                    and reliability   execution,        fault-injection evidence
                                      privacy,          
                                      timeouts,         
                                      resource limits,  
                                      and failure       
                                      behavior          

  4                 Complete backend  End-to-end        API/integration tests
                    integration       backend workflow  with real analyzer
                                      and report        results
                                      generation        

  5                 Frontend          User interface    UI tests and successful
                    development       connected to the  production build
                                      verified API      

  6                 End-to-end        Verified complete Release checklist,
                    verification and  product and       reproducible results,
                    release           academic evidence security/privacy review
  ------------------------------------------------------------------------------

Research work may progress in parallel when it does not violate
engineering dependencies, but it must not reuse the phase numbers or
silently change this sequence.

### 16.2 Requirement traceability

  -----------------------------------------------------------------------
  Requirement/objective   Primary work            Verification/evidence
  ----------------------- ----------------------- -----------------------
  RO1: incident root      Research case studies   Primary sources and
  causes                                          case-study chapter

  RO2: taxonomy           Rules and taxonomy      Category definitions,
                          documentation           rule tests, labeled
                                                  cases

  RO3: tool comparison    Benchmark scripts and   Reproducible tables and
                          raw outputs             methodology

  RO4: detection/risk     Backend analysis engine Architecture,
  pipeline                                        integration tests,
                                                  evaluation

  RO5: prevention         Recommendation content  Evidence-linked
  guidance                and UI/report           checklist and review

  FR-01: supported inputs Backend API and         Input/API/end-to-end
                          frontend                tests

  FR-02: input limits     Validation              Boundary tests

  FR-03: isolated         Worker and execution    Isolation and
  analysis                controls                resource-limit tests

  FR-04: classification   Rules engine            Golden and
                                                  unknown-finding tests

  FR-05: risk summary     Risk assessment         Formula documentation
                                                  and boundary tests

  FR-06: recommendations  Recommendation mapping  Finding-to-guidance
                                                  traceability tests

  FR-07: report export    Report generator        Report content and
                                                  consistency tests

  FR-08: benchmark page   Research output and UI  Generated metrics with
                                                  dataset context

  FR-09: recommendations  RO5 content and UI      Content traceability
  page                                            and UI tests

  FR-10: source lookup    Provider integration if Integration and failure
                          approved                tests

  FR-11: rate limit       API policy if required  Boundary and expiry
                                                  tests

  FR-12: source deletion  Worker lifecycle        Privacy tests for
                                                  success and failure
                                                  paths

  Capstone                Documentation           Official
  diagrams/report         workstream              rubric-to-deliverable
                                                  checklist

  Production readiness    All engineering phases  Release gates and
                                                  recorded evidence
  -----------------------------------------------------------------------

### 16.3 Status reporting

Use these statuses in issues and project reporting: - **Not started** -
**In progress** - **Blocked** - **Implemented, unverified** -
**Verified** - **Accepted limitation**

Do not use a percentage complete unless the measurement method is
defined. A feature is not complete because its files exist; it is
complete when its acceptance criteria and evidence are satisfied.

### 16.4 Open decisions before implementation

The following must be resolved from authoritative project documents
and/or explicit owner approval: 1. Local-first architecture versus
cloud-hosted architecture. 2. Whether public scanning and external
source lookup are approved. 3. Exact API contract and scan lifecycle. 4.
Database and result-retention policy. 5. Final risk-score formula and
category weights. 6. Incident source versions, root causes, and amounts.
7. Analyzer versions, compatibility, and licensing. 8. PDF generation
library and report format. 9. Official Capstone diagram rubric and
deadlines. 10. Repository license and contribution/security-reporting
process.

Do not hide these decisions inside implementation details. Record the
chosen option and rationale in the project's decision log.

------------------------------------------------------------------------

## Glossary

  -----------------------------------------------------------------------
  Term                                Plain-language meaning
  ----------------------------------- -----------------------------------
  Smart contract                      A program on a blockchain that can
                                      control assets and enforce rules

  Solidity                            A programming language commonly
                                      used for Ethereum-compatible smart
                                      contracts

  Fund-lock                           A condition where assets become
                                      inaccessible through the contract's
                                      available logic

  Exploit                             A way an attacker abuses a
                                      weakness; different from funds
                                      being locked without being stolen

  Static analysis                     Examining code without executing
                                      the contract

  Analyzer                            A tool that checks source code for
                                      possible issues

  Finding                             A possible issue reported by a tool
                                      or by FLARE's rules; it is not
                                      automatically a confirmed
                                      vulnerability

  False positive                      A reported issue that does not
                                      match the defined real problem

  False negative                      A real issue in the labeled dataset
                                      that the method fails to detect

  Precision                           Among the items reported as
                                      positive, the proportion that are
                                      true positives under the chosen
                                      labels

  Recall                              Among the known positive items, the
                                      proportion detected by the method

  Taxonomy                            An organized classification of
                                      types of problems

  Normalization                       Converting different tools' outputs
                                      into one consistent data format

  Risk score                          A summary computed from documented
                                      inputs; not a guarantee or
                                      necessarily a probability

  Ground truth                        The evidence-backed labels used as
                                      the comparison reference in an
                                      experiment

  Reproducibility                     The ability to repeat an experiment
                                      using recorded inputs, versions,
                                      and settings and obtain comparable
                                      results

  Isolated worker                     A restricted environment for
                                      processing untrusted input

  API                                 A defined way for software
                                      components to request and exchange
                                      data

  CI                                  Automated checks that run when code
                                      changes

  Regression test                     A test that checks a previously
                                      working behavior still works after
                                      changes
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Sources and authority

This README is based on the supplied FLARE README and project context
available during its revision. The existing README cites: -
`FLARE — Product Requirements Document` (dated 27 October 2026 in the
supplied document); - `Research_Proposal_Kartik_Shinde.docx` (dated 9
July 2026 in the supplied document); - the project owner's locked
six-phase development order; - the prototype files described in the
supplied README.

The full source documents and current repository were not independently
re-inspected during this revision. Therefore, source-derived details and
repository status statements should be checked against the current
authoritative files before being treated as verified.

**Final rule:** FLARE must not claim a feature works, a test passes, an
incident amount is correct, a benchmark result is measured, or a release
is production-ready unless the corresponding evidence exists and can be
reviewed.
