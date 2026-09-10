"use client";

import { useEffect, useState } from "react";
import { Card, Button, setReducedMotionOverride, usePrefersReducedMotion } from "@flare/ui";

type AiProvider = "disabled" | "local" | "api-key";

const AI_PROVIDER_KEY = "flare:ai-provider";
const AI_API_KEY_KEY = "flare:ai-api-key";
const REDUCED_MOTION_KEY = "flare:reduced-motion-override";

export default function SettingsPage() {
  const [provider, setProvider] = useState<AiProvider>("disabled");
  const [apiKey, setApiKey] = useState("");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [saved, setSaved] = useState(false);
  const systemOrOverrideReduced = usePrefersReducedMotion();

  useEffect(() => {
    // Reading localStorage (an external system unavailable during SSR) can
    // only happen client-side post-mount; deferring the resulting setState
    // to a microtask avoids both a hydration mismatch and a synchronous
    // setState-in-effect.
    queueMicrotask(() => {
      try {
        const storedProvider = localStorage.getItem(AI_PROVIDER_KEY) as AiProvider | null;
        if (storedProvider) setProvider(storedProvider);
        setApiKey(localStorage.getItem(AI_API_KEY_KEY) ?? "");
        setReduceMotion(localStorage.getItem(REDUCED_MOTION_KEY) === "true");
      } catch {
        // localStorage unavailable — settings just won't persist across visits.
      }
    });
  }, []);

  function save() {
    try {
      localStorage.setItem(AI_PROVIDER_KEY, provider);
      localStorage.setItem(AI_API_KEY_KEY, provider === "api-key" ? apiKey : "");
    } catch {
      // Nothing more we can do without storage access.
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Settings</h1>
      <p className="mt-1 max-w-xl font-sans text-sm text-muted">
        FLARE has no account system yet — these preferences are stored only in this browser.
      </p>

      <Card className="mt-6">
        <fieldset>
          <legend className="font-sans text-base font-semibold text-ink">AI Assistance</legend>
          <p className="mt-1 max-w-lg font-sans text-[13px] text-muted">
            Optional and secondary. When enabled, AI may explain deterministic findings — it can
            never create one. The full analysis pipeline works identically with AI disabled.
          </p>

          <div className="mt-4 space-y-3">
            {(
              [
                { value: "disabled", label: "Disabled", hint: "Default — no AI provider is called." },
                { value: "local", label: "Local model", hint: "Use a locally-hosted model (no data leaves your machine)." },
                { value: "api-key", label: "User-configured API", hint: "Bring your own API key for a hosted provider." },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-line p-3 has-[:checked]:border-ink"
              >
                <input
                  type="radio"
                  name="ai-provider"
                  value={option.value}
                  checked={provider === option.value}
                  onChange={() => setProvider(option.value)}
                  className="mt-0.5 accent-ink"
                />
                <span>
                  <span className="block font-sans text-sm font-medium text-ink">{option.label}</span>
                  <span className="block font-sans text-xs text-muted">{option.hint}</span>
                </span>
              </label>
            ))}
          </div>

          {provider === "api-key" && (
            <div className="mt-4">
              <label htmlFor="ai-api-key" className="font-condensed text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                API key
              </label>
              <input
                id="ai-api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-…"
                autoComplete="off"
                className="mt-1.5 w-full max-w-sm rounded-[var(--radius-control)] border border-line bg-paper-flat px-3 py-2 font-mono text-sm outline-none focus-visible:border-ink"
              />
              <p className="mt-1.5 font-sans text-xs text-muted">
                Stored only in this browser&apos;s local storage; never sent anywhere until the analyzer
                service (Milestone 5+) is connected.
              </p>
            </div>
          )}
        </fieldset>

        <div className="mt-6 flex items-center gap-3">
          <Button type="button" onClick={save}>
            Save
          </Button>
          {saved && <span className="font-sans text-xs text-success">Saved.</span>}
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="font-sans text-base font-semibold text-ink">Accessibility</h2>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => {
              setReduceMotion(e.target.checked);
              setReducedMotionOverride(e.target.checked);
            }}
            className="mt-0.5 accent-ink"
          />
          <span>
            <span className="block font-sans text-sm font-medium text-ink">Reduce motion</span>
            <span className="block font-sans text-xs text-muted">
              Overrides FLARE&apos;s animation regardless of your OS setting.
              {systemOrOverrideReduced && !reduceMotion && " Currently reduced because your OS requests it."}
            </span>
          </span>
        </label>
      </Card>
    </div>
  );
}
