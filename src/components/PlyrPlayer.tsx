"use client";

/**
 * PlyrPlayer — Plyr.js media player modal.
 * Wraps a <video> or <audio> element with Plyr's polished controls.
 * Renders as a full-screen overlay modal with a title bar and close button.
 *
 * Props:
 *   url    — signed CDN URL or direct media URL
 *   title  — displayed in the modal topbar
 *   type   — "video" (default) | "audio"
 *   onClose — called when overlay is clicked or Escape is pressed
 */

import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import type Plyr from "plyr";

type Props = {
  url: string;
  title: string;
  type?: "video" | "audio";
  onClose: () => void;
};

export function PlyrPlayer({ url, title, type = "video", onClose }: Props) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const playerRef = useRef<Plyr | null>(null);

  const close = useCallback(() => {
    playerRef.current?.pause();
    onClose();
  }, [onClose]);

  // Keyboard: Escape to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close]);

  // Initialize Plyr only on the client, after the element is in the DOM
  useEffect(() => {
    if (!mediaRef.current) return;

    let player: Plyr;

    // Dynamic import keeps Plyr out of the server bundle
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
          "fullscreen",
        ],
        settings: ["speed"],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        resetOnEnd: true,
        keyboard: { focused: true, global: false }, // global=false so Space doesn't conflict with our Escape handler
      });
      playerRef.current = player;
      // Auto-play once ready
      player.on("ready", () => { void player.play(); });
    });

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  // Re-init whenever the URL changes (new item opened)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <div className="plyr-overlay" onClick={close} role="dialog" aria-modal="true" aria-label={title}>
      <div className="plyr-modal" onClick={(e) => e.stopPropagation()}>
        {/* Top bar */}
        <div className="plyr-topbar">
          <span className="plyr-topbar-title">{title}</span>
          <button className="plyr-topbar-close" onClick={close} aria-label="Close player">
            <X size={18} />
          </button>
        </div>

        {/* Media element — Plyr will inject its controls wrapper */}
        <div className="plyr-media-wrap">
          {type === "video" ? (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              playsInline
              className="plyr-video-el"
            >
              <source src={url} />
            </video>
          ) : (
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              className="plyr-audio-el"
            >
              <source src={url} />
            </audio>
          )}
        </div>
      </div>
    </div>
  );
}
