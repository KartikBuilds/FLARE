"use client";

import { motion } from "motion/react";
import { usePrefersReducedMotion } from "@flare/ui";
import Link from "next/link";

const TAXONOMY_CATEGORIES = [
  {
    code: "LIB",
    name: "LIBRARY_DEPENDENCIES",
    description: "External code whose behavior cannot be guaranteed",
    color: "terminal-cyan",
  },
  {
    code: "WD",
    name: "WITHDRAWAL_FAILURES",
    description: "No reachable function that returns assets to user",
    color: "terminal-amber",
  },
  {
    code: "REC",
    name: "MISSING_RECOVERY",
    description: "No fallback or emergency exit mechanism exists",
    color: "terminal-red",
  },
  {
    code: "STA",
    name: "STATE_TRANSITIONS",
    description: "State changes that block legitimate exits permanently",
    color: "terminal-green",
  },
  {
    code: "XFR",
    name: "TRANSFER_LOGIC",
    description: "Incorrect or incomplete token transfer implementation",
    color: "terminal-amber",
  },
];

export function TaxonomySectionTerminal() {
  const reduced = usePrefersReducedMotion();

  const containerVariants = {
    hidden: { opacity: reduced ? 1 : 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { y: reduced ? 0 : 8, opacity: reduced ? 1 : 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: reduced ? 0.001 : 0.3 },
    },
  };

  return (
    <section className="terminal-shell bg-terminal-bg py-20 md:py-32 border-t border-terminal-line">
      <div className="container-flare max-w-5xl mx-auto">
        <motion.div
          className="space-y-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Command */}
          <motion.div
            className="terminal-muted font-mono text-xs uppercase tracking-widest"
            variants={itemVariants}
          >
            $ flare taxonomy --list
          </motion.div>

          {/* Title */}
          <motion.h2
            className="font-mono text-2xl terminal-white font-bold"
            variants={itemVariants}
          >
            FUND_LOCK_TAXONOMY
          </motion.h2>

          {/* Taxonomy Categories */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={containerVariants}
          >
            {TAXONOMY_CATEGORIES.map((category) => (
              <motion.div
                key={category.code}
                className="terminal-panel p-4 space-y-2 hover:bg-terminal-elevated transition-colors cursor-pointer"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3">
                  <div className={`font-mono font-bold ${category.color}`}>
                    [{category.code}]
                  </div>
                  <div className="terminal-white font-mono font-bold text-sm uppercase">
                    {category.name}
                  </div>
                </div>
                <p className="font-mono text-xs terminal-text leading-relaxed ml-0">
                  {category.description}
                </p>
                <div className="pt-2 border-t border-terminal-line">
                  <Link
                    href="/docs/taxonomy"
                    className="terminal-cyan font-mono text-xs hover:terminal-white transition-colors"
                  >
                    view detectors →
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Info */}
          <motion.div
            className="terminal-muted font-mono text-xs p-3 border border-terminal-line"
            variants={itemVariants}
          >
            TAXONOMY_ENTRIES: {TAXONOMY_CATEGORIES.length}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default TaxonomySectionTerminal;
