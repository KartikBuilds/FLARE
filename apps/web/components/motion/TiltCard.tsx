"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "motion/react";
import { cn, usePrefersReducedMotion } from "@flare/ui";

interface TiltCardProps
  extends Omit<HTMLMotionProps<"div">, "children" | "style" | "onPointerMove" | "onPointerEnter" | "onPointerLeave"> {
  children: React.ReactNode;
  /** Peak rotation in degrees at the corners. */
  intensity?: number;
  /** Show the ink bleed that follows the pointer across the card. */
  spotlight?: boolean;
}

/**
 * A card that leans very slightly toward the pointer, with a soft bloom of ink
 * spreading under it — as if the page were lifting off the desk.
 *
 * The tilt is deliberately shallow: enough to feel physical, never enough to
 * skew text. Skipped on coarse pointers and under reduced motion.
 */
export function TiltCard({
  children,
  className,
  intensity = 4,
  spotlight = true,
  ...rest
}: TiltCardProps) {
  const reduced = usePrefersReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const springX = useSpring(pointerX, { stiffness: 180, damping: 22 });
  const springY = useSpring(pointerY, { stiffness: 180, damping: 22 });

  const rotateX = useTransform(springY, [0, 1], [intensity, -intensity]);
  const rotateY = useTransform(springX, [0, 1], [-intensity, intensity]);

  const glowX = useTransform(pointerX, (value) => `${value * 100}%`);
  const glowY = useTransform(pointerY, (value) => `${value * 100}%`);
  const glow = useMotionTemplate`radial-gradient(240px circle at ${glowX} ${glowY}, rgba(127,1,31,0.10), transparent 72%)`;

  React.useEffect(() => {
    if (reduced) {
      setEnabled(false);
      return;
    }
    const query = window.matchMedia("(pointer: fine)");
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [reduced]);

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    setHovered(false);
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      style={
        enabled
          ? { rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }
          : undefined
      }
      onPointerMove={handleMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={handleLeave}
      {...rest}
    >
      {children}
      {spotlight && enabled ? (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glow }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      ) : null}
    </motion.div>
  );
}
