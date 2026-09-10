import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FilePlus2,
  History,
  FolderKanban,
  FileBarChart,
  Layers,
  FlaskConical,
  Settings,
} from "lucide-react";

export interface AppNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const APP_NAV: AppNavItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/analysis/new", label: "New Analysis", icon: FilePlus2 },
  { href: "/app/history", label: "History", icon: History },
  { href: "/app/projects", label: "Projects", icon: FolderKanban },
  { href: "/app/reports", label: "Reports", icon: FileBarChart },
  { href: "/app/taxonomy", label: "Taxonomy", icon: Layers },
  { href: "/app/research", label: "Research", icon: FlaskConical },
  { href: "/app/settings", label: "Settings", icon: Settings },
];
