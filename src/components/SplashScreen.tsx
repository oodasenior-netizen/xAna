"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fade = setTimeout(() => setVisible(false), 2800);
    const nav = setTimeout(() => router.replace("/entry"), 3400);
    return () => {
      clearTimeout(fade);
      clearTimeout(nav);
    };
  }, [router]);

  return (
    <div className={`splash-overlay ${visible ? "" : "fade-out"}`}>
      <div className="splash-content">
        <span className="splash-icon">🏡</span>
        <h1 className="splash-name">Ari Voss</h1>
        <p className="splash-tagline">enter the hacienda</p>
      </div>
    </div>
  );
}
