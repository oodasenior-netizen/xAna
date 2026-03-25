"use client";

/**
 * PlyrPlayer — premium cinema-grade media player modal.
 *
 * Features:
 *   - Large video canvas (up to 1120px) with padded siding
 *   - Full controls: play, rewind, fast-forward, progress, time, mute, volume,
 *     captions, settings (speed 0.25x–2x = slow-motion + fast), pip, loop, fullscreen
 *   - Loop toggle button (custom HTML in controls)
 *   - App branding logo in topbar
 *   - Animated entrance (scale-in + fade), minimize (scale-down), soft close
 *   - Escape key to close, click-outside to close
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { X, Minimize2, Repeat } from "lucide-react";
import type Plyr from "plyr";

/** Safely call play() and swallow AbortError (caused by rapid play/pause race). */
async function safePlay(el: HTMLMediaElement | null) {
  if (!el) return;
  try {
    await el.play();
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      // play() was interrupted by pause() — safe to ignore
    } else {
      console.error("Playback error:", e);
    }
  }
}

type Props = {
  url: string;
  title: string;
  type?: "video" | "audio";
  onClose: () => void;
};

type ViewMode = "entering" | "open" | "minimized" | "closing";

export function PlyrPlayer({ url, title, type = "video", onClose }: Props) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const [mode, setMode] = useState<ViewMode>("entering");
  const [looping, setLooping] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setMode("open"));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = useCallback(() => {
    // Only pause if media is actually playing — avoids AbortError
    const el = mediaRef.current;
    if (el && !el.paused) {
      el.pause();
    }
    setMode("closing");
    setTimeout(() => onClose(), 320);
  }, [onClose]);

  const toggleMinimize = useCallback(() => {
    setMode((m) => (m === "minimized" ? "open" : "minimized"));
  }, []);

  const toggleLoop = useCallback(() => {
    setLooping((prev) => {
      const next = !prev;
      if (mediaRef.current) (mediaRef.current as HTMLVideoElement).loop = next;
      return next;
    });
  }, []);

  // Keyboard: Escape to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close]);

  // Initialize Plyr
  useEffect(() => {
    if (!mediaRef.current) return;

    import("plyr").then(({ default: PlyrClass }) => {
      if (!mediaRef.current) return;
      const player = new PlyrClass(mediaRef.current, {
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
        settings: ["speed", "loop"],
        speed: {
          selected: 1,
          options: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        },
        resetOnEnd: false,
        keyboard: { focused: true, global: false },
        tooltips: { controls: true, seek: true },
        invertTime: false,
      });
      playerRef.current = player;
      player.on("ready", () => { safePlay(mediaRef.current); });
    });

    return () => {
      // Pause before destroy to prevent AbortError during teardown
      const el = mediaRef.current;
      if (el && !el.paused) el.pause();
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const overlayClass = [
    "xp-overlay",
    mode === "entering" ? "xp-entering" : "",
    mode === "open" ? "xp-open" : "",
    mode === "minimized" ? "xp-minimized" : "",
    mode === "closing" ? "xp-closing" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={overlayClass} onClick={close} role="dialog" aria-modal="true" aria-label={title}>
      <div className={`xp-cinema ${mode === "minimized" ? "xp-cinema--mini" : ""}`} onClick={(e) => e.stopPropagation()}>

        {/* ── Topbar with branding ── */}
        <div className="xp-topbar">
          <div className="xp-topbar-brand">
            <span className="xp-brand-mark">xAna</span>
            <span className="xp-topbar-divider" />
            <span className="xp-topbar-title">{title}</span>
          </div>
          <div className="xp-topbar-actions">
            <button
              className={`xp-topbar-btn xp-loop-btn ${looping ? "xp-loop-active" : ""}`}
              onClick={toggleLoop}
              aria-label={looping ? "Disable loop" : "Enable loop"}
              title={looping ? "Loop ON" : "Loop OFF"}
            >
              <Repeat size={15} />
            </button>
            <button className="xp-topbar-btn" onClick={toggleMinimize} aria-label="Minimize">
              <Minimize2 size={15} />
            </button>
            <button className="xp-topbar-btn xp-close-btn" onClick={close} aria-label="Close player">
              <X size={17} />
            </button>
          </div>
        </div>

        {/* ── Padded siding around media canvas ── */}
        <div className="xp-canvas-siding">
          <div className="xp-canvas">
            {type === "video" ? (
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                playsInline
                className="xp-video"
              >
                <source src={url} />
              </video>
            ) : (
              <audio
                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                className="xp-audio"
              >
                <source src={url} />
              </audio>
            )}
          </div>
        </div>

        {/* ── Bottom brand strip ── */}
        <div className="xp-footer">
          <span className="xp-footer-powered">Powered by <strong>xAna</strong> Vault</span>
        </div>
      </div>
    </div>
  );
}
