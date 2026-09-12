"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { usePrefersReducedMotion } from "@flare/ui";
import { SPRING_CURSOR } from "@/lib/motion";
import { useFinePointer } from "./use-fine-pointer";

const INTERACTIVE = 'a, button, [role="button"], summary, label, input, textarea, select, [tabindex]:not([tabindex="-1"])';

/**
 * A nib and its ink halo, following the pointer.
 *
 * The nib tracks the pointer with no lag so targeting never suffers; only the
 * halo is sprung, which is what reads as "ink catching up with the pen".
 *
 * The native cursor is only suppressed once this layer is actually mounted and
 * active (body.has-ink-cursor, see globals.css), so a visitor on a touch
 * device, with reduced motion on, or without JS keeps their normal pointer.
 * Text fields keep the native caret cursor regardless.
 */
export function InkCursor() {
  const reduced = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  const [hovering, setHovering] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const [visible, setVisible] = React.useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const haloX = useSpring(x, SPRING_CURSOR);
  const haloY = useSpring(y, SPRING_CURSOR);

  // Only arm on a precise pointer that is not in reduced-motion mode.
  const active = finePointer && !reduced;

  React.useEffect(() => {
    if (!active) return;

    document.body.classList.add("has-ink-cursor");

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      const target = event.target as Element | null;
      setHovering(Boolean(target?.closest?.(INTERACTIVE)));
    };
    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      document.body.classList.remove("has-ink-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [active, x, y]);

  if (!active) return null;

  const haloSize = hovering ? 56 : 30;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] hidden md:block">
      <motion.span
        className="absolute left-0 top-0 rounded-full bg-ink"
        style={{ x, y, width: 7, height: 7, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: visible ? 1 : 0, scale: pressed ? 0.6 : 1 }}
        transition={{ duration: 0.18 }}
      />
      <motion.span
        className="sketch-circle absolute left-0 top-0 border border-ink/45"
        style={{ x: haloX, y: haloY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: haloSize,
          height: haloSize,
          opacity: visible ? (hovering ? 0.9 : 0.55) : 0,
          backgroundColor: hovering ? "rgba(127,1,31,0.08)" : "rgba(127,1,31,0)",
          scale: pressed ? 0.82 : 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
      />
    </div>
  );
}
