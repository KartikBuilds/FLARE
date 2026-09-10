import * as React from "react";
import { IllustrationFrame, HatchDef, useIllustrationId } from "./shared";
import type { IllustrationProps } from "./shared";

const BOOKS = [
  { label: "AI REASONING", rot: -1.2 },
  { label: "GRAPH MODELS", rot: 0.8 },
  { label: "FORMAL METHODS", rot: -0.6 },
  { label: "SMART CONTRACTS", rot: 1 },
];

/** A stack of research volumes, spines facing the reader. */
export function BookStack({ title = "Stack of research volumes", decorative = false, className, ...props }: IllustrationProps) {
  const hatchId = useIllustrationId("books-hatch");
  const bookHeight = 34;
  const startY = 20;
  return (
    <IllustrationFrame
      title={title}
      decorative={decorative}
      viewBox="0 0 320 200"
      className={className}
      fill="none"
      {...props}
    >
      <defs>
        <HatchDef id={hatchId} spacing={5} angle={30} opacity={0.2} />
      </defs>
      {BOOKS.map((book, i) => {
        const y = startY + i * bookHeight;
        return (
          <g key={book.label} transform={`rotate(${book.rot} 160 ${y + bookHeight / 2})`}>
            <rect
              x="24"
              y={y}
              width="272"
              height={bookHeight - 6}
              rx="4"
              fill={`url(#${hatchId})`}
              stroke="currentColor"
              strokeWidth="2"
            />
            <line x1="24" y1={y + 8} x2="296" y2={y + 8} stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <text
              x="40"
              y={y + bookHeight / 2 + 3}
              fontSize="13"
              fontWeight="600"
              letterSpacing="0.06em"
              fill="currentColor"
              className="font-condensed"
            >
              {book.label}
            </text>
          </g>
        );
      })}
    </IllustrationFrame>
  );
}
