"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@flare/ui";
import { EASE_INK, EASE_PAPER } from "@/lib/motion";

/**
 * True once this browsing session has navigated at least once.
 *
 * Module scope on purpose: app/template.tsx remounts on every route change, so
 * a ref or state would reset with it. The first paint of a session must not
 * play the ink wipe — on a cold load the panel would either race hydration or
 * sit on top of content the reader is already waiting for.
 */
let hasNavigated = false;

/**
 * Route change choreography.
 *
 * Two parts: the incoming page lifts into place, and — on client navigations
 * only — a panel of ink sweeps across the viewport behind it.
 *
 * The page itself animates transform only, never opacity. Motion writes
 * `initial` into the server-rendered markup, so an opacity-0 start would ship
 * every route as a blank screen to anything that has not run the JS yet. The
 * wipe panel is safe to fade because it starts fully off-screen.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const pathname = usePathname();
  const [wipe, setWipe] = React.useState(false);

  React.useEffect(() => {
    if (hasNavigated) setWipe(true);
    hasNavigated = true;
  }, []);

  const playWipe = wipe && !reduced;

  return (
    <>
      {playWipe ? (
        <motion.div
          key={pathname}
          aria-hidden="true"
          className="bg-grain pointer-events-none fixed inset-0 z-[60] bg-ink"
          initial={{ x: "-100%" }}
          animate={{ x: ["-100%", "0%", "0%", "100%"] }}
          transition={{
            duration: 0.78,
            times: [0, 0.42, 0.5, 1],
            ease: EASE_INK,
          }}
          onAnimationComplete={() => setWipe(false)}
        />
      ) : null}

      <motion.div
        initial={{ y: reduced ? 0 : 14 }}
        animate={{ y: 0 }}
        transition={{
          duration: reduced ? 0.001 : 0.5,
          ease: EASE_PAPER,
          delay: playWipe ? 0.3 : 0,
        }}
      >
        {children}
      </motion.div>
    </>
  );
}
