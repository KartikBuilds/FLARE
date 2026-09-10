import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { ProblemSection } from "@/components/home/ProblemSection";
import { PipelineSection } from "@/components/home/PipelineSection";
import { TaxonomySection } from "@/components/home/TaxonomySection";
import { ResearchSection } from "@/components/home/ResearchSection";
import { CaseStudiesSection } from "@/components/home/CaseStudiesSection";

export const metadata: Metadata = {
  title: "FLARE — Can the assets get back out?",
  description:
    "FLARE analyzes whether assets entering an EVM smart-contract protocol can reach a legitimate withdrawal, redemption, migration or recovery path.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <PipelineSection />
      <TaxonomySection />
      <ResearchSection />
      <CaseStudiesSection />
    </>
  );
}
