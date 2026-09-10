import { Card, ButtonLink } from "@flare/ui";
import { VaultModule } from "@flare/ui/illustrations";
import { ENGINE_STATUS } from "@/lib/engine-status";

export function ReadyToAnalyseCard() {
  return (
    <Card className="flex flex-col items-center text-center">
      <h2 className="self-start font-sans text-base font-semibold text-ink">Ready to Analyse?</h2>
      <VaultModule className="mt-6 size-28 text-ink-soft" decorative />
      <p className="mt-6 font-sans text-sm text-ink-soft">
        {ENGINE_STATUS.implemented
          ? "Upload a project or point FLARE at a GitHub repository to run a real analysis."
          : "The analysis engine is not implemented in this phase. Explore the demo data or documentation."}
      </p>
      <ButtonLink href={ENGINE_STATUS.implemented ? "/app/analysis/new" : "/app/history"} className="mt-6 w-full justify-center">
        {ENGINE_STATUS.implemented ? "Start Analysis" : "View Demo Analyses"}
      </ButtonLink>
    </Card>
  );
}
