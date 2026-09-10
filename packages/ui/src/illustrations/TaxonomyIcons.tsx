import * as React from "react";
import { IllustrationFrame, HatchDef, Bolt, useIllustrationId, round2 } from "./shared";
import type { IllustrationProps } from "./shared";
import type { TaxonomyCategoryId } from "@flare/schemas";

function LibraryDependenciesIcon(props: IllustrationProps) {
  const hatchId = useIllustrationId("tax-lib-hatch");
  return (
    <IllustrationFrame viewBox="0 0 100 100" fill="none" {...props}>
      <defs>
        <HatchDef id={hatchId} spacing={5} angle={45} opacity={0.3} />
      </defs>
      <rect x="16" y="24" width="68" height="56" rx="4" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
      <path d="M16 40 L84 62 M16 62 L84 40" stroke="currentColor" strokeWidth="2" opacity="0.7" />
      <Bolt cx={24} cy={32} r={2.4} />
      <Bolt cx={76} cy={32} r={2.4} />
      <Bolt cx={24} cy={72} r={2.4} />
      <Bolt cx={76} cy={72} r={2.4} />
      <rect x="42" y="16" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    </IllustrationFrame>
  );
}

function WithdrawalFailuresIcon(props: IllustrationProps) {
  const hatchId = useIllustrationId("tax-withdraw-hatch");
  return (
    <IllustrationFrame viewBox="0 0 100 100" fill="none" {...props}>
      <defs>
        <HatchDef id={hatchId} spacing={4} angle={90} opacity={0.3} />
      </defs>
      <path d="M20 20 V50 H60 V80" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
      <path d="M20 20 V50 H60 V80" fill="none" stroke="currentColor" strokeOpacity="0" strokeWidth="10" />
      <rect x="15" y="15" width="10" height="38" fill={`url(#${hatchId})`} />
      <rect x="25" y="45" width="35" height="10" fill={`url(#${hatchId})`} />
      <circle cx="60" cy="70" r="10" fill="none" stroke="currentColor" strokeWidth="2.25" />
      <path d="M60 60 L60 68 M55 64 L65 64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 88 Q58 92 56 96" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" opacity="0.6" />
      <circle cx="57" cy="90" r="1.6" fill="currentColor" opacity="0.5" />
    </IllustrationFrame>
  );
}

function MissingRecoveryIcon(props: IllustrationProps) {
  const hatchId = useIllustrationId("tax-recovery-hatch");
  return (
    <IllustrationFrame viewBox="0 0 100 100" fill="none" {...props}>
      <defs>
        <HatchDef id={hatchId} spacing={5} angle={45} opacity={0.28} />
      </defs>
      <rect x="18" y="16" width="64" height="68" rx="8" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
      <Bolt cx={28} cy={26} r={2.4} />
      <Bolt cx={72} cy={26} r={2.4} />
      <Bolt cx={28} cy={74} r={2.4} />
      <Bolt cx={72} cy={74} r={2.4} />
      <circle cx="50" cy="50" r="17" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="50" y1="50" x2="50" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="50" x2="60" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 68 L44 74 M56 74 L62 68" stroke="currentColor" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
    </IllustrationFrame>
  );
}

function StateTransitionsIcon(props: IllustrationProps) {
  return (
    <IllustrationFrame viewBox="0 0 100 100" fill="none" {...props}>
      <circle cx="38" cy="42" r="20" fill="none" stroke="currentColor" strokeWidth="2.25" />
      <circle cx="68" cy="64" r="13" fill="none" stroke="currentColor" strokeWidth="2.25" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <line
            key={`a-${i}`}
            x1={round2(38 + 20 * Math.cos(a))}
            y1={round2(42 + 20 * Math.sin(a))}
            x2={round2(38 + 25 * Math.cos(a))}
            y2={round2(42 + 25 * Math.sin(a))}
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
        );
      })}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <line
            key={`b-${i}`}
            x1={round2(68 + 13 * Math.cos(a))}
            y1={round2(64 + 13 * Math.sin(a))}
            x2={round2(68 + 17 * Math.cos(a))}
            y2={round2(64 + 17 * Math.sin(a))}
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="38" cy="42" r="3" fill="currentColor" />
      <circle cx="68" cy="64" r="2.4" fill="currentColor" />
    </IllustrationFrame>
  );
}

function TransferLogicIcon(props: IllustrationProps) {
  const hatchId = useIllustrationId("tax-transfer-hatch");
  return (
    <IllustrationFrame viewBox="0 0 100 100" fill="none" {...props}>
      <defs>
        <HatchDef id={hatchId} spacing={4} angle={90} opacity={0.3} />
      </defs>
      <rect x="14" y="42" width="72" height="16" fill={`url(#${hatchId})`} stroke="currentColor" strokeWidth="2.25" />
      <rect x="8" y="38" width="8" height="24" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="84" y="38" width="8" height="24" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M50 30 L62 50 L50 70 L38 50 Z" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round" />
      <path d="M50 30 L50 70 M38 50 L62 50" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    </IllustrationFrame>
  );
}

const ICONS: Record<TaxonomyCategoryId, (props: IllustrationProps) => React.ReactElement> = {
  "library-dependencies": LibraryDependenciesIcon,
  "withdrawal-failures": WithdrawalFailuresIcon,
  "missing-recovery": MissingRecoveryIcon,
  "state-transitions": StateTransitionsIcon,
  "transfer-logic": TransferLogicIcon,
};

export function TaxonomyIcon({
  category,
  ...props
}: IllustrationProps & { category: TaxonomyCategoryId }) {
  const Icon = ICONS[category];
  return <Icon decorative {...props} />;
}
