"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  SkipBack,
  SkipForward,
  Music,
} from "lucide-react";

type Props = {
  url: string;
  title: string;
  /** "bunny-embed" renders a secure Bunny Stream iframe — no custom controls needed */
  type?: "video" | "audio" | "bunny-embed";
  posterGradient?: [string, string];
  onClose: () => void;
};

function fmtTime(secs: number) {
  if (!isFinite(secs) || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MediaPlayer({ url, title, type = "video", posterGradient, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  // ── Bunny embed mode — render secure iframe, Bunny's own controls handle everything
  if (type === "bunny-embed") {
    return (
      <div className="mpx-overlay" onClick={onClose}>
        <div className="mpx-modal mpx-modal--iframe" onClick={(e) => e.stopPropagation()}>
          <div className="mpx-topbar">
            <span className="mpx-title">{title}</span>
            <button className="mpx-close" onClick={onClose} aria-label="Close player">
              <X size={18} />
            </button>
          </div>
          <div className="mpx-iframe-wrap">
            <iframe
              src={url}
              className="mpx-iframe"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              title={title}
              loading="eager"
            />
          </div>
        </div>
      </div>
    );
  }

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === " " && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, togglePlay]);

  function handleTimeUpdate() {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress(v.duration ? (v.currentTime / v.duration) * 100 : 0);
  }

  function handleLoadedMetadata() {
    if (videoRef.current) setDuration(videoRef.current.duration);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const t = (Number(e.target.value) / 100) * v.duration;
    v.currentTime = t;
    setProgress(Number(e.target.value));
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
    setMuted(val === 0);
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !muted;
    setMuted(!muted);
  }

  function skip(secs: number) {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + secs));
  }

  function requestFullscreen() {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen();
  }

  const artStyle = posterGradient
    ? { backgroundImage: `linear-gradient(145deg, ${posterGradient[0]}, ${posterGradient[1]})` }
    : {};

  return (
    <div className="mpx-overlay" onClick={onClose}>
      <div className="mpx-modal" onClick={(e) => e.stopPropagation()}>
        {/* Top bar */}
        <div className="mpx-topbar">
          <span className="mpx-title">{title}</span>
          <button className="mpx-close" onClick={onClose} aria-label="Close player">
            <X size={18} />
          </button>
        </div>

        {/* Media display */}
        <div className="mpx-media-wrap">
          {type === "video" ? (
            <video
              ref={videoRef}
              className="mpx-video"
              src={url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setPlaying(false)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              playsInline
              onClick={togglePlay}
            />
          ) : (
            /* Audio — show art cover + hidden audio element */
            <>
              <div className="mpx-audio-art" style={artStyle}>
                <Music size={64} className="mpx-audio-icon" />
              </div>
              {/* Use video element for audio as well — same API */}
              <video
                ref={videoRef}
                src={url}
                style={{ display: "none" }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setPlaying(false)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
            </>
          )}
        </div>

        {/* Controls */}
        <div className="mpx-controls">
          {/* Seek bar */}
          <div className="mpx-seekbar-row">
            <span className="mpx-time">{fmtTime(currentTime)}</span>
            <input
              type="range"
              className="mpx-seekbar"
              min={0}
              max={100}
              step={0.1}
              value={progress}
              onChange={handleSeek}
              aria-label="Seek"
            />
            <span className="mpx-time">{fmtTime(duration)}</span>
          </div>

          {/* Button row */}
          <div className="mpx-btn-row">
            <div className="mpx-btn-group">
              <button className="mpx-btn" onClick={() => skip(-10)} aria-label="Back 10 seconds">
                <SkipBack size={16} />
              </button>
              <button className="mpx-btn mpx-play" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button className="mpx-btn" onClick={() => skip(10)} aria-label="Forward 10 seconds">
                <SkipForward size={16} />
              </button>
            </div>

            <div className="mpx-btn-group">
              <button className="mpx-btn" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                className="mpx-volume"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
              />
              {type === "video" && (
                <button className="mpx-btn" onClick={requestFullscreen} aria-label="Fullscreen">
                  <Maximize2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
