"use client";

import dynamic from "next/dynamic";
import { HandNote } from "@/components/motion";
import { Scene3D } from "@/components/three/Scene3D";
import { DashboardFallback } from "@/components/three/fallbacks/SpaceFallbacks";

const DashboardScene = dynamic(() => import("@/components/three/DashboardScene"), { ssr: false });

export function DashboardAstronaut() {
  return (
    <div className="shell-dark relative mt-8 overflow-hidden rounded-[var(--radius-card)] border border-charcoal-line bg-charcoal px-6 pb-0 pt-10 text-paper sm:px-10">
      <div className="relative z-20 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <blockquote className="max-w-sm font-display text-2xl italic leading-snug">
          &ldquo;Better analysis today. Fewer locked funds tomorrow.&rdquo;
        </blockquote>
        <HandNote className="max-w-[10rem] text-xl text-paper/80" delay={0.15}>
          Secure the path for what&apos;s next.
        </HandNote>
      </div>

      {/* Atmospheric only — no description is supplied, because the quote above
          already says everything this panel means and the scene adds no
          analytical information a reader would otherwise miss. */}
      <div className="relative z-0 mt-10">
        <Scene3D
          Scene={DashboardScene}
          fallback={<DashboardFallback />}
          aspect="16 / 9"
          className="max-h-[30rem]"
        />
      </div>
    </div>
  );
}
