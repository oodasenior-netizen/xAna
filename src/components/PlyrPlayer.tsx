"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { X, Repeat } from "lucide-react";
import type Plyr from "plyr";

type Props = {
  url: string;
  title: string;
  type?: "video" | "audio";
  mediaType?: string;
  onClose: () => void;
};

const SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export function PlyrPlayer({ url, title, type = "video", mediaType, onClose }: Props) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const [loop, setLoop] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(1);

  const close = useCallback(() => {
    playerRef.current?.pause();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close]);

  function toggleLoop() {
    const next = !loop;
    setLoop(next);
    if (playerRef.current) playerRef.current.loop = next;
    if (mediaRef.current) (mediaRef.current as HTMLVideoElement).loop = next;
  }

  function setSpeed(s: number) {
    setCurrentSpeed(s);
    if (playerRef.current) playerRef.current.speed = s;
  }

  // Initialize Plyr on the client — re-initializes whenever url changes
  useEffect(() => {
    if (!mediaRef.current) return;
    let player: Plyr;

    import("plyr").then(({ default: PlyrClass }) => {
      if (!mediaRef.current) return;
      player = new PlyrClass(mediaRef.current, {
        controls: [
          "play-large",
          "rewind",
          "play",
          "fast-forward",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "captions",
          "settings",
          "pip",
          "fullscreen",
        ],
        settings: ["captions", "speed"],
        speed: { selected: 1, options: SPEEDS },
        resetOnEnd: false,
        loop: { active: false },
        keyboard: { focused: true, global: false },
        tooltips: { controls: true, seek: true },
        invertTime: false,
        toggleInvert: true,
      });
      playerRef.current = player;
      player.on("ready", () => { void player.play(); });
      player.on("ratechange", () => { setCurrentSpeed(player.speed ?? 1); });
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const typeBadge = (mediaType ?? type).toUpperCase();
  const speedLabel =
    currentSpeed < 1 ? `${currentSpeed}× Slow` :
    currentSpeed > 1 ? `${currentSpeed}× Fast` :
    "1× Normal";

  return (
    <div
      className="xp-overlay"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={`Playing: ${title}`}
    >
      <div className="xp-shell" onClick={(e) => e.stopPropagation()}>

        {/* ── Left brand siding ──────────────────────────────── */}
        <aside className="xp-siding xp-siding--left" aria-hidden="true">
          <div className="xp-brand-lockup">
            <span className="xp-brand-x">x</span>
            <span className="xp-brand-gem">◆</span>
            <span className="xp-brand-ana">Ana</span>
          </div>
          <div className="xp-side-rule" />
          <span className="xp-side-label">VAULT</span>
          <div className="xp-side-rule" />
          <span className="xp-side-label xp-side-label--dim">PLAYER</span>
          <div className="xp-siding-deco">
            {([100, 60, 85, 45, 70, 52] as number[]).map((w, i) => (
              <div key={i} className="xp-deco-line" style={{ width: `${w}%` }} />
            ))}
          </div>
        </aside>

        {/* ── Center: header + media ─────────────────────────── */}
        <main className="xp-center">
          <header className="xp-header">
            <div className="xp-header-left">
              <span className="xp-header-badge">{typeBadge}</span>
              <span className="xp-header-title">{title}</span>
            </div>
            <button className="xp-close-btn" onClick={close} aria-label="Close player">
              <X size={18} />
            </button>
          </header>

          <div className="xp-media">
            {type === "video" ? (
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                playsInline
                className="xp-video-el"
              >
                <source src={url} />
              </video>
            ) : (
              <div className="xp-audio-container">
                <div className="xp-audio-art">
                  <div className="xp-audio-gem">◆</div>
                  <div className="xp-audio-ring" />
                  <div className="xp-audio-ring xp-audio-ring--2" />
                </div>
                <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} className="xp-audio-el">
                  <source src={url} />
                </audio>
              </div>
            )}
          </div>
        </main>

        {/* ── Right metadata siding ─────────────────────────── */}
        <aside className="xp-siding xp-siding--right">
          <div className="xp-meta-top">
            <div className="xp-meta-section">
              <span className="xp-meta-label">NOW PLAYING</span>
              <span className="xp-meta-title">{title}</span>
              <span className="xp-meta-badge">{typeBadge}</span>
            </div>

            <div className="xp-meta-divider" />

            <div className="xp-meta-section">
              <span className="xp-meta-label">PLAYBACK SPEED</span>
              <div className="xp-speed-grid">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    className={`xp-speed-btn${currentSpeed === s ? " active" : ""}`}
                    onClick={() => setSpeed(s)}
                    title={s < 1 ? "Slow motion" : s > 1 ? "Fast forward" : "Normal speed"}
                  >
                    {s}×
                  </button>
                ))}
              </div>
              <span className="xp-speed-active-label">{speedLabel}</span>
            </div>

            <div className="xp-meta-divider" />

            <div className="xp-meta-section">
              <span className="xp-meta-label">LOOP</span>
              <button
                className={`xp-loop-toggle${loop ? " active" : ""}`}
                onClick={toggleLoop}
                title={loop ? "Disable loop" : "Enable loop playback"}
              >
                <Repeat size={13} />
                <span>{loop ? "LOOPING" : "LOOP OFF"}</span>
              </button>
            </div>
          </div>

          <div className="xp-siding-deco xp-siding-deco--btm">
            {([100, 60, 85, 45, 70, 52] as number[]).map((w, i) => (
              <div key={i} className="xp-deco-line" style={{ width: `${w}%` }} />
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
}
