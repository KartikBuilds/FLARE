import * as React from "react";
import { IllustrationFrame, Bolt } from "./shared";
import type { IllustrationProps } from "./shared";

/** A single pipeline-stage module icon — a small instrument housing with a dial. */
export function PipelineModule({ title, decorative = true, className, ...props }: IllustrationProps) {
  return (
    <IllustrationFrame title={title} decorative={decorative} viewBox="0 0 80 80" className={className} fill="none" {...props}>
      <rect x="8" y="8" width="64" height="64" rx="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <Bolt cx={18} cy={18} r={2.4} />
      <Bolt cx={62} cy={18} r={2.4} />
      <Bolt cx={18} cy={62} r={2.4} />
      <Bolt cx={62} cy={62} r={2.4} />
      <circle cx="40" cy="40" r="16" stroke="currentColor" strokeWidth="2" />
      <path d="M40 40 L40 28 M40 40 L49 46" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="40" r="2.5" fill="currentColor" />
    </IllustrationFrame>
  );
}
