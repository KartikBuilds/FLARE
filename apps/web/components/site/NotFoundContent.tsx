"use client";

import dynamic from "next/dynamic";
import { ButtonLink } from "@flare/ui";
import { HandNote, InkBlots, Magnetic, Reveal, TextReveal } from "@/components/motion";
import { Scene3D } from "@/components/three/Scene3D";
import { NotFoundFallback } from "@/components/three/fallbacks/SpaceFallbacks";

const NotFoundScene = dynamic(() => import("@/components/three/NotFoundScene"), { ssr: false });

export function NotFoundContent() {
  return (
    <section className="bg-grain relative min-h-[34rem] overflow-hidden py-20 md:min-h-[40rem] md:py-28">
      <InkBlots count={2} />

      {/* Full-bleed rather than confined to a grid cell: the composition is
          built to run off the edge of the page, and a scene that bleeds looks
          boxed the moment you give it a visible frame. The section is sized by
          its own copy, so filling it still shifts nothing.

          The planet is inside the scene in both forms — drawing one here at
          section level too would put two on the page once the canvas came up. */}
      <Scene3D
        Scene={NotFoundScene}
        fallback={<NotFoundFallback />}
        fill
        description="An asset in a pressure suit tumbles slowly through open space, away from the protocol, with detached fragments drifting around it and a cratered body turning below."
      />

      <div className="container-flare relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <TextReveal
            as="h1"
            lines={["Path", "Not Found"]}
            immediate
            className="font-display text-7xl font-bold leading-[0.92] tracking-tight sm:text-8xl lg:text-9xl"
          />
          <Reveal delay={0.14}>
            <p className="mt-6 max-w-sm font-sans text-lg text-ink-soft">
              The asset you&apos;re looking for seems to have drifted outside the protocol path.
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Magnetic>
                <ButtonLink href="/">Return Home</ButtonLink>
              </Magnetic>
              <Magnetic>
                <ButtonLink href="/docs" variant="outline">
                  Read the docs
                </ButtonLink>
              </Magnetic>
              <Magnetic>
                <ButtonLink href="/app" variant="ghost">
                  Run an analysis
                </ButtonLink>
              </Magnetic>
            </div>
          </Reveal>
        </div>

        {/* Sits above the drifting figure rather than beside it — the scene is
            full-bleed now, so a note inside the grid column lands on top of it. */}
        <div className="relative hidden lg:block">
          <HandNote className="absolute -top-40 right-[2%] max-w-[11rem] text-xl" delay={0.5}>
            this asset took a wrong turn...
          </HandNote>
        </div>
      </div>
    </section>
  );
}
