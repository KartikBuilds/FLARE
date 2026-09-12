"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, FileArchive, Github, Hash, FlaskConical, AlertCircle, Loader2 } from "lucide-react";
import { Card, Button, cn } from "@flare/ui";
import { DETECTOR_REGISTRY } from "@flare/rules";
import type { AnalysisStatus } from "@flare/schemas";
import { submitFiles, submitZip, submitGithub, submitAddress, submitBenchmarkCase, pollAnalysisUntilDone } from "@/lib/api-client";
import { AppPageHeader } from "@/components/app/AppPageHeader";

type Method = "files" | "zip" | "github" | "address" | "benchmark";

const METHODS: { id: Method; label: string; icon: typeof Upload }[] = [
  { id: "files", label: "Solidity Files", icon: Upload },
  { id: "zip", label: "ZIP Project", icon: FileArchive },
  { id: "github", label: "GitHub URL", icon: Github },
  { id: "address", label: "Contract Address", icon: Hash },
  { id: "benchmark", label: "Benchmark Case", icon: FlaskConical },
];

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB per .sol file
const MAX_FILES = 50;
const MAX_ZIP_BYTES = 25 * 1024 * 1024; // 25MB
const GITHUB_URL_RE = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

const STATUS_LABEL: Record<AnalysisStatus, string> = {
  queued: "Queued",
  intake: "Validating & extracting source",
  compiling: "Compiling with solc",
  analyzing: "Running Slither static analysis",
  detecting: "Running the detector registry",
  validating: "Foundry/Anvil validation",
  scoring: "Computing the FLARE risk score",
  complete: "Complete",
  failed: "Failed",
};

const BENCHMARK_CASES = DETECTOR_REGISTRY.map((d) => ({
  value: `${d.id.toLowerCase()}/vulnerable.sol`,
  label: `${d.id} — ${d.name}`,
}));

export default function NewAnalysisPage() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("files");
  const [files, setFiles] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [address, setAddress] = useState("");
  const [benchmarkCase, setBenchmarkCase] = useState(BENCHMARK_CASES[0]!.value);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progressStatus, setProgressStatus] = useState<AnalysisStatus | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  function validateFiles(list: File[]): string[] {
    const errs: string[] = [];
    if (list.length === 0) errs.push("Select at least one .sol file.");
    if (list.length > MAX_FILES) errs.push(`No more than ${MAX_FILES} files at once.`);
    for (const f of list) {
      if (!f.name.endsWith(".sol")) errs.push(`${f.name} is not a .sol file.`);
      if (f.size > MAX_FILE_BYTES) errs.push(`${f.name} exceeds the 2MB per-file limit.`);
    }
    return errs;
  }

  function validateZip(f: File | null): string[] {
    if (!f) return ["Select a .zip file."];
    const errs: string[] = [];
    if (!f.name.endsWith(".zip")) errs.push("File must have a .zip extension.");
    if (f.size > MAX_ZIP_BYTES) errs.push("ZIP exceeds the 25MB limit.");
    return errs;
  }

  function validateGithub(url: string): string[] {
    return GITHUB_URL_RE.test(url.trim()) ? [] : ["Enter a valid GitHub repository URL, e.g. https://github.com/owner/repo"];
  }

  function validateAddress(addr: string): string[] {
    return ADDRESS_RE.test(addr.trim()) ? [] : ["Enter a valid 0x-prefixed, 40-character contract address."];
  }

  async function handleSubmit() {
    let validationErrors: string[] = [];
    if (method === "files") validationErrors = validateFiles(files);
    else if (method === "zip") validationErrors = validateZip(zipFile);
    else if (method === "github") validationErrors = validateGithub(githubUrl);
    else if (method === "address") validationErrors = validateAddress(address);

    setErrors(validationErrors);
    if (validationErrors.length > 0) return;

    setSubmitError(null);
    setSubmitting(true);
    setProgressStatus(null);

    try {
      const queued =
        method === "files"
          ? await submitFiles(files)
          : method === "zip"
            ? await submitZip(zipFile!)
            : method === "github"
              ? await submitGithub(githubUrl.trim())
              : method === "address"
                ? await submitAddress(address.trim())
                : await submitBenchmarkCase(benchmarkCase);

      setProgressStatus(queued.status);
      const final = await pollAnalysisUntilDone(queued.id, (s) => setProgressStatus(s.status));

      if (final.status === "complete") {
        router.push(`/app/analysis/${final.id}`);
        return;
      }
      // A real backend failure is shown as-is — never swapped for demo data.
      setSubmitError(final.error ?? "The analysis failed for an unspecified reason.");
      setSubmitting(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong submitting this analysis.");
      setSubmitting(false);
    }
  }

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <AppPageHeader
        title={["New Analysis"]}
        lead="Choose how to bring your project to FLARE. All uploads are validated and extracted into an isolated workspace before any analysis runs."
        note="pick a source"
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {METHODS.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              disabled={submitting}
              onClick={() => {
                setMethod(m.id);
                setErrors([]);
                setSubmitError(null);
              }}
              className={cn(
                "flex items-center gap-2 rounded-[var(--radius-control)] border px-3.5 py-2 font-condensed text-[12px] uppercase tracking-[0.06em] transition-colors disabled:opacity-50",
                method === m.id ? "border-ink bg-ink text-paper" : "border-line text-ink-soft hover:border-ink",
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {m.label}
            </button>
          );
        })}
      </div>

      <Card className="mt-6 max-w-2xl">
        {method === "files" && (
          <div>
            <label htmlFor="sol-files" className="font-sans text-sm font-medium text-ink">
              Upload one or more .sol files
            </label>
            <input
              ref={fileInputRef}
              id="sol-files"
              type="file"
              accept=".sol"
              multiple
              disabled={submitting}
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="mt-2 block w-full font-sans text-sm"
            />
            {files.length > 0 && (
              <ul className="mt-3 space-y-1 font-mono text-xs text-ink-soft">
                {files.map((f) => (
                  <li key={f.name}>
                    {f.name} — {(f.size / 1024).toFixed(1)}KB
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 font-sans text-xs text-muted">Max {MAX_FILES} files, 2MB each.</p>
          </div>
        )}

        {method === "zip" && (
          <div>
            <label htmlFor="zip-file" className="font-sans text-sm font-medium text-ink">
              Upload a project ZIP
            </label>
            <input
              ref={zipInputRef}
              id="zip-file"
              type="file"
              accept=".zip"
              disabled={submitting}
              onChange={(e) => setZipFile(e.target.files?.[0] ?? null)}
              className="mt-2 block w-full font-sans text-sm"
            />
            {zipFile && (
              <p className="mt-3 font-mono text-xs text-ink-soft">
                {zipFile.name} — {(zipFile.size / 1024 / 1024).toFixed(2)}MB
              </p>
            )}
            <p className="mt-2 font-sans text-xs text-muted">
              Max 25MB. Extracted safely with path-traversal and file-count limits — see{" "}
              <Link href="/docs/architecture" className="underline decoration-line underline-offset-2">
                Architecture
              </Link>
              .
            </p>
          </div>
        )}

        {method === "github" && (
          <div>
            <label htmlFor="github-url" className="font-sans text-sm font-medium text-ink">
              Public GitHub repository URL
            </label>
            <input
              id="github-url"
              type="url"
              value={githubUrl}
              disabled={submitting}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="mt-2 w-full rounded-[var(--radius-control)] border border-line bg-paper-flat px-3 py-2 font-mono text-sm outline-none focus-visible:border-ink disabled:opacity-50"
            />
            <p className="mt-2 font-sans text-xs text-muted">
              Public repositories only. No repository scripts are ever executed.
            </p>
          </div>
        )}

        {method === "address" && (
          <div>
            <label htmlFor="contract-address" className="font-sans text-sm font-medium text-ink">
              Verified contract address
            </label>
            <input
              id="contract-address"
              type="text"
              value={address}
              disabled={submitting}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x…"
              className="mt-2 w-full rounded-[var(--radius-control)] border border-line bg-paper-flat px-3 py-2 font-mono text-sm outline-none focus-visible:border-ink disabled:opacity-50"
            />
            <p className="mt-2 font-sans text-xs text-muted">
              Requires a free, server-side Etherscan API key (FLARE_ETHERSCAN_API_KEY) — every
              other intake method works without one. If it isn&apos;t configured, submitting here
              returns a clear error rather than silently failing.
            </p>
          </div>
        )}

        {method === "benchmark" && (
          <div>
            <label htmlFor="benchmark-case" className="font-sans text-sm font-medium text-ink">
              Built-in benchmark case
            </label>
            <select
              id="benchmark-case"
              value={benchmarkCase}
              disabled={submitting}
              onChange={(e) => setBenchmarkCase(e.target.value)}
              className="mt-2 w-full rounded-[var(--radius-control)] border border-line bg-paper-flat px-3 py-2 font-sans text-sm outline-none focus-visible:border-ink disabled:opacity-50"
            >
              {BENCHMARK_CASES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="mt-2 font-sans text-sm text-muted">
              Runs the real pipeline against one of the 40 fixture contracts from the{" "}
              <Link href="/docs/benchmark" className="underline decoration-line underline-offset-2">
                Benchmark Plan
              </Link>
              — the same file the automated benchmark scores the detector registry against.
            </p>
          </div>
        )}

        {errors.length > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-[var(--radius-control)] border border-danger-soft bg-danger-soft/40 p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
            <ul className="space-y-1 font-sans text-[13px] text-danger">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        {submitError && (
          <div className="mt-4 flex items-start gap-2 rounded-[var(--radius-control)] border border-danger-soft bg-danger-soft/40 p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
            <p className="font-sans text-[13px] text-danger">{submitError}</p>
          </div>
        )}

        {submitting && (
          <div
            className="mt-4 flex items-center gap-2 rounded-[var(--radius-control)] border border-line bg-paper-flat p-3"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="size-4 shrink-0 animate-spin text-ink-soft" aria-hidden="true" />
            <p className="font-sans text-[13px] text-ink">
              {progressStatus ? STATUS_LABEL[progressStatus] : "Submitting…"}
            </p>
          </div>
        )}

        <div className="mt-6">
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Running…" : "Run Analysis"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
