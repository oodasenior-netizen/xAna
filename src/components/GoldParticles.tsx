"use client";

import { useEffect, useRef } from "react";

/**
 * GoldParticles — Lightweight canvas-based particle layer.
 * Renders drifting gold sparkles and occasional flower petals.
 * Renders behind content via pointer-events:none + fixed positioning.
 */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotSpeed: number;
  kind: "sparkle" | "petal";
  life: number;
  maxLife: number;
};

const PETAL_PATHS = [
  // Simple petal shape path (relative to center)
  (ctx: CanvasRenderingContext2D, s: number) => {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.6, -s * 0.6, s * 0.8, s * 0.3, 0, s);
    ctx.bezierCurveTo(-s * 0.8, s * 0.3, -s * 0.6, -s * 0.6, 0, -s);
    ctx.closePath();
  },
  // Rounder petal
  (ctx: CanvasRenderingContext2D, s: number) => {
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.5, s, 0, 0, Math.PI * 2);
    ctx.closePath();
  },
];

const PETAL_COLORS = [
  "rgba(212, 175, 55, 0.35)",  // gold
  "rgba(201, 168, 76, 0.30)",  // warm gold
  "rgba(232, 212, 139, 0.25)", // light gold
  "rgba(255, 200, 200, 0.20)", // blush pink
  "rgba(220, 190, 160, 0.22)", // champagne
];

const SPARKLE_COLORS = [
  "rgba(201, 168, 76, ",  // gold
  "rgba(212, 175, 55, ",  // bright gold
  "rgba(232, 212, 139, ", // pale gold
];

type Props = {
  /** Particle density — "light" ~20, "normal" ~35, "rich" ~50 */
  density?: "light" | "normal" | "rich";
};

export function GoldParticles({ density = "normal" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    const maxCount = density === "light" ? 20 : density === "rich" ? 50 : 35;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function spawnParticle(): Particle {
      const isPetal = Math.random() < 0.3;
      const w = canvas!.width;
      const h = canvas!.height;
      return {
        x: Math.random() * w,
        y: -10 - Math.random() * h * 0.3,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.2 + Math.random() * 0.6,
        size: isPetal ? 6 + Math.random() * 8 : 1.5 + Math.random() * 2.5,
        opacity: 0,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        kind: isPetal ? "petal" : "sparkle",
        life: 0,
        maxLife: 400 + Math.random() * 600,
      };
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Spawn new particles
      while (particles.length < maxCount) {
        particles.push(spawnParticle());
      }

      particles = particles.filter((p) => {
        p.life++;
        const progress = p.life / p.maxLife;

        // Fade in first 10%, fade out last 20%
        if (progress < 0.1) p.opacity = progress / 0.1;
        else if (progress > 0.8) p.opacity = (1 - progress) / 0.2;
        else p.opacity = 1;

        p.x += p.vx + Math.sin(p.life * 0.008) * 0.3;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.life >= p.maxLife || p.y > canvas!.height + 20) return false;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = p.opacity * 0.7;

        if (p.kind === "sparkle") {
          const colorBase = SPARKLE_COLORS[Math.floor(p.x) % SPARKLE_COLORS.length];
          ctx!.fillStyle = colorBase + p.opacity.toFixed(2) + ")";
          ctx!.beginPath();
          ctx!.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx!.fill();
          // Glow
          ctx!.shadowColor = "rgba(201,168,76,0.4)";
          ctx!.shadowBlur = p.size * 3;
          ctx!.fill();
        } else {
          const color = PETAL_COLORS[Math.floor(p.x + p.y) % PETAL_COLORS.length];
          ctx!.fillStyle = color;
          const pathFn = PETAL_PATHS[Math.floor(p.x) % PETAL_PATHS.length];
          pathFn(ctx!, p.size);
          ctx!.fill();
        }

        ctx!.restore();
        return true;
      });

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="gold-particles-canvas"
      aria-hidden="true"
    />
  );
}
