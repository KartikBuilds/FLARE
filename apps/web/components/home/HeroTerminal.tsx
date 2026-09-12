"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePrefersReducedMotion } from "@flare/ui";

const fundFlowASCII = `
       [ASSET]
          │
          ▼
   ┌─────────────┐
   │ ENTRY_POINT │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │   VAULT     │
   │ BALANCE > 0 │
   └──────┬──────┘
          │
      ┌───┴────┐
      │        │
      ▼        ▼
 [EXIT:OK]  [EXIT:BLOCKED]
                ╳
             FUND LOCK
`;

export function HeroTerminal() {
  const reduced = usePrefersReducedMotion();

  const containerVariants = {
    hidden: { opacity: reduced ? 1 : 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: reduced ? 0 : 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: reduced ? 0 : 20, opacity: reduced ? 1 : 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: reduced ? 0.001 : 0.5 },
    },
  };

  return (
    <section className="terminal-shell bg-terminal-bg py-20 md:py-32">
      <div className="container-flare max-w-5xl mx-auto">
        <motion.div
          className="space-y-8"
          initial="hidden"
          animate="show"
          variants={containerVariants}
        >
          {/* Header Line */}
          <motion.div
            className="terminal-muted font-mono text-xs uppercase tracking-widest"
            variants={itemVariants}
          >
            ┌─ FLARE / FUND-LOCK ASSESSMENT ────────────────────────────────┐
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="font-mono text-4xl md:text-5xl font-bold terminal-white leading-tight"
            variants={itemVariants}
          >
            $ CAN_THE_ASSETS_GET_BACK_OUT?
          </motion.h1>

          {/* Description */}
          <motion.p
            className="font-mono text-base terminal-text max-w-2xl leading-relaxed"
            variants={itemVariants}
          >
            Analyze whether assets entering a protocol retain a legitimate
            <br />
            withdrawal, redemption, migration or recovery path.
          </motion.p>

          {/* Fund Flow Diagram */}
          <motion.div
            className="my-8 p-4 terminal-panel font-mono text-xs text-terminal-green overflow-x-auto"
            variants={itemVariants}
          >
            <pre className="whitespace-pre">{fundFlowASCII}</pre>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap gap-4"
            variants={itemVariants}
          >
            <Link
              href="/app"
              className="
                px-6 py-3 font-mono text-sm font-bold
                terminal-success-bg text-terminal-bg
                border border-terminal-green
                hover:opacity-90 transition-opacity
                uppercase tracking-wide
              "
            >
              [ RUN_ANALYSIS ]
            </Link>
            <Link
              href="/docs"
              className="
                px-6 py-3 font-mono text-sm font-bold
                terminal-panel text-terminal-white
                border border-terminal-line
                hover:bg-terminal-elevated transition-colors
                uppercase tracking-wide
              "
            >
              [ READ_RESEARCH ]
            </Link>
          </motion.div>

          {/* Footer Line */}
          <motion.div
            className="terminal-muted font-mono text-xs uppercase tracking-widest"
            variants={itemVariants}
          >
            └────────────────────────────────────────────────────────────────┘
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroTerminal;
