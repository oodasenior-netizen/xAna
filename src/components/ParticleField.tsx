"use client";

/**
 * ParticleField — pure-CSS gold sprinkle + flower accent layer.
 * No external dependencies. Deterministic positions (SSR-safe, no Math.random).
 * Absolutely positioned within the nearest `position: relative` ancestor.
 */

import { useMemo } from "react";

type Props = {
  count?: number;
  /** Extra class names for the wrapper div */
  className?: string;
  /** Particle style mix — "gold" for sparkles only, "flowers" for botanicals, "mix" (default) */
  variant?: "gold" | "flowers" | "mix";
};

// Deterministic pseudo-random from seed (avoids SSR / hydration mismatch)
function r(seed: number): number {
  const s = Math.sin(seed + 1) * 43758.5453123;
  return s - Math.floor(s);
}

const GOLD_CHARS    = ["✦", "✧", "✴", "✸", "✵", "✹", "❊", "✺"];
const FLOWER_CHARS  = ["✿", "❀", "✾", "❁", "✽", "❃", "✱", "❋"];
const MIX_CHARS     = ["✦", "✿", "✧", "❀", "✴", "✾", "✸", "✽", "❋", "✹"];

export function ParticleField({ count = 22, className = "", variant = "mix" }: Props) {
  const symbols =
    variant === "gold" ? GOLD_CHARS : variant === "flowers" ? FLOWER_CHARS : MIX_CHARS;

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        symbol: symbols[i % symbols.length],
        left:     `${r(i * 3.14159 + 1) * 96 + 1}%`,
        top:      `${r(i * 2.71828 + 2) * 96 + 1}%`,
        size:      0.55 + r(i * 13.7  + 3) * 0.8,   // rem
        delay:     r(i * 5.9   + 4) * 12,            // s
        duration:  8  + r(i * 11.2  + 5) * 10,       // s
        opacity:   0.10 + r(i * 17.3 + 6) * 0.20,
        rotate:    r(i * 7.3   + 7) * 360,           // deg initial
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, variant]
  );

  return (
    <div className={`pf-field ${className}`} aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="pf-particle"
          style={
            {
              left:               p.left,
              top:                p.top,
              fontSize:           `${p.size}rem`,
              animationDelay:     `${p.delay}s`,
              animationDuration:  `${p.duration}s`,
              "--pf-op":          p.opacity,
              "--pf-rot":         `${p.rotate}deg`,
            } as React.CSSProperties
          }
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
