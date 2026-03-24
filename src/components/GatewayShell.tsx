"use client";

import { GoldParticles } from "@/components/GoldParticles";

export function GatewayShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoldParticles density="normal" />
      {children}
    </>
  );
}
