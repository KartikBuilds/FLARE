"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Upload, FileArchive, Github, Hash, FlaskConical, AlertCircle } from "lucide-react";
import { Card, Button, cn } from "@flare/ui";
import { ENGINE_STATUS } from "@/lib/engine-status";

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

export default function NewAnalysisPage() {
  const [method, setMethod] = useState<Method>("files");
  const [files, setFiles] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
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

  function handleSubmit() {
    let validationErrors: string[] = [];
    if (method === "files") validationErrors = validateFiles(files);
    else if (method === "zip") validationErrors = validateZip(zipFile);
    else if (method === "github") validationErrors = validateGithub(githubUrl);
    else if (method === "address") validationErrors = validateAddress(address);
    else if (method === "benchmark") validationErrors = ["Built-in benchmark cases ship with the benchmark suite."];

    setErrors(validationErrors);
    if (validationErrors.length === 0) setSubmitted(true);
  }

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">New Analysis</h1>
      <p className="mt-1 max-w-xl font-sans text-sm text-muted">
        Choose how to bring your project to FLARE. All uploads are validated and extracted into
        an isolated workspace before any analysis runs.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {METHODS.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMethod(m.id);
                setErrors([]);
                setSubmitted(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-[var(--radius-control)] border px-3.5 py-2 font-condensed text-[12px] uppercase tracking-[0.06em] transition-colors",
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
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="mt-2 w-full rounded-[var(--radius-control)] border border-line bg-paper-flat px-3 py-2 font-mono text-sm outline-none focus-visible:border-ink"
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
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x…"
              className="mt-2 w-full rounded-[var(--radius-control)] border border-line bg-paper-flat px-3 py-2 font-mono text-sm outline-none focus-visible:border-ink"
            />
            <p className="mt-2 font-sans text-xs text-muted">
              Requires a free, user-supplied block-explorer API key (configured once the analyzer
              service exists) — optional, degrades cleanly when unset.
            </p>
          </div>
        )}

        {method === "benchmark" && (
          <div>
            <p className="font-sans text-sm font-medium text-ink">Built-in benchmark case</p>
            <p className="mt-2 font-sans text-sm text-muted">
              The 40-fixture benchmark suite (see{" "}
              <Link href="/docs/benchmark" className="underline decoration-line underline-offset-2">
                Benchmark Plan
              </Link>
              ) is not implemented yet — this option will let you pick any fixture contract
              directly once it ships.
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

        {submitted && (
          <div className="mt-4 rounded-[var(--radius-control)] border border-warning-soft bg-warning-soft/40 p-3">
            <p className="font-sans text-[13px] text-ink">
              {ENGINE_STATUS.implemented
                ? "Analysis queued."
                : "Your input is valid, but the analyzer engine isn't connected yet in this milestone — nothing was uploaded anywhere. Explore the demo data instead."}
            </p>
            {!ENGINE_STATUS.implemented && (
              <Link
                href="/app/history"
                className="mt-2 inline-block font-condensed text-[11.5px] uppercase tracking-[0.06em] text-ink underline decoration-line underline-offset-4"
              >
                View demo analyses →
              </Link>
            )}
          </div>
        )}

        <div className="mt-6">
          <Button type="button" onClick={handleSubmit}>
            Run Analysis
          </Button>
        </div>
      </Card>
    </div>
  );
}
