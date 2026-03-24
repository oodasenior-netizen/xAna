"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ParticleField } from "@/components/ParticleField";

export default function WelcomePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"gate" | "open" | "enter">("gate");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("open"), 1200);
    const t2 = setTimeout(() => setPhase("enter"), 2600);
    const t3 = setTimeout(() => router.replace("/app"), 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [router]);

  return (
    <div className="welcome-overlay">
      <ParticleField count={20} variant="flowers" />
      <div className={`welcome-content phase-${phase}`}>
        {phase === "gate" && (
          <>
            <span className="welcome-icon">🏡</span>
            <p className="welcome-line">The gates are opening…</p>
          </>
        )}
        {phase === "open" && (
          <>
            <span className="welcome-icon">🌿</span>
            <p className="welcome-line">Welcome to La Hacienda</p>
          </>
        )}
        {phase === "enter" && (
          <>
            <span className="welcome-icon">🌙</span>
            <p className="welcome-line">Step inside…</p>
          </>
        )}
      </div>
    </div>
  );
}
