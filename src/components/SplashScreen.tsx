"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 100);
    const t2 = setTimeout(() => setPhase("exit"), 3000);
    const t3 = setTimeout(() => router.replace("/entry"), 3800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [router]);

  return (
    <div className={`splash-shell ${phase}`}>
      {/* Ambient glow orbs */}
      <div className="splash-aura splash-aura-one" />
      <div className="splash-aura splash-aura-two" />
      <div className="splash-aura splash-aura-three" />

      <div className="splash-stage">
        {/* Logo with bounce + pulse animation */}
        <div className="splash-logo-ring">
          <div className="splash-logo-core">
            <Image
              src="/logo9.jpg"
              alt="xAna Logo"
              width={280}
              height={280}
              className="splash-logo-img"
              priority
            />
          </div>
        </div>

        <h1 className="splash-name">Goddess Annaleese</h1>
        <p className="splash-tag">enter the hacienda</p>

        {/* Gate bars that part open */}
        <div className="splash-gate">
          <div className="splash-gate-left" />
          <div className="splash-gate-right" />
        </div>
      </div>
    </div>
  );
}
