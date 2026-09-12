import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion";

/**
 * A template (rather than a layout) so that it remounts on every navigation —
 * that remount is what drives the route change animation.
 */
export default function RootTemplate({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
