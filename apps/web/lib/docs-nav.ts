import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Layers,
  Target,
  FlaskConical,
  FileWarning,
  ShieldAlert,
  Gauge,
  Boxes,
  BarChart3,
  AlertTriangle,
  Library,
} from "lucide-react";

export interface DocNavItem {
  slug: string;
  label: string;
  icon: LucideIcon;
}

export const DOCS_NAV: DocNavItem[] = [
  { slug: "overview", label: "Overview", icon: BookOpen },
  { slug: "taxonomy", label: "Fund-Lock Taxonomy", icon: Layers },
  { slug: "objectives", label: "Research Objectives", icon: Target },
  { slug: "methodology", label: "Methodology", icon: FlaskConical },
  { slug: "case-studies", label: "Case Studies", icon: FileWarning },
  { slug: "detectors", label: "Detector Registry", icon: ShieldAlert },
  { slug: "risk-methodology", label: "Risk Methodology", icon: Gauge },
  { slug: "architecture", label: "Architecture", icon: Boxes },
  { slug: "benchmark", label: "Benchmark Plan", icon: BarChart3 },
  { slug: "limitations", label: "Limitations", icon: AlertTriangle },
  { slug: "references", label: "References", icon: Library },
];

export function getDocNavItem(slug: string): DocNavItem | undefined {
  return DOCS_NAV.find((item) => item.slug === slug);
}

export function getAdjacentDocs(slug: string): { prev?: DocNavItem; next?: DocNavItem } {
  const index = DOCS_NAV.findIndex((item) => item.slug === slug);
  if (index === -1) return {};
  return { prev: DOCS_NAV[index - 1], next: DOCS_NAV[index + 1] };
}
