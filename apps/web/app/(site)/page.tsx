import type { Metadata } from "next";
import { HeroTerminal } from "@/components/home/HeroTerminal";
import { ProblemSectionTerminal } from "@/components/home/ProblemSectionTerminal";
import { PipelineSectionTerminal } from "@/components/home/PipelineSectionTerminal";
import { TaxonomySectionTerminal } from "@/components/home/TaxonomySectionTerminal";
import { ResearchSectionTerminal } from "@/components/home/ResearchSectionTerminal";
import { CaseStudiesSectionTerminal } from "@/components/home/CaseStudiesSectionTerminal";

export const metadata: Metadata = {
  title: "FLARE — Can the assets get back out?",
  description:
    "FLARE analyzes whether assets entering an EVM smart-contract protocol can reach a legitimate withdrawal, redemption, migration or recovery path.",
};

export default function HomePage() {
  return (
    <>
      <HeroTerminal />
      <ProblemSectionTerminal />
      <PipelineSectionTerminal />
      <TaxonomySectionTerminal />
      <ResearchSectionTerminal />
      <CaseStudiesSectionTerminal />
    </>
  );
}
