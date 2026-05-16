"use client";

import { useEffect, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { MedscribeExplainer } from "@/remotion/MedscribeExplainer";

export function ExplainerPlayer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const player = playerRef.current;
    if (!wrap || !player) return;

    player.mute();

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!playerRef.current) return;
        if (entry.isIntersecting) {
          try {
            playerRef.current.play();
          } catch {
            // ignore — autoplay may be gated until first user gesture
          }
        } else {
          try {
            playerRef.current.pause();
          } catch {
            // ignore
          }
        }
      },
      { threshold: 0.1 }
    );
    io.observe(wrap);

    // Retry play on first user gesture in case browser autoplay was blocked.
    const onGesture = () => {
      try {
        playerRef.current?.play();
      } catch {
        // ignore
      }
    };
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });

    return () => {
      io.disconnect();
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Player
        ref={playerRef}
        component={MedscribeExplainer}
        durationInFrames={465}
        fps={30}
        compositionWidth={1200}
        compositionHeight={960}
        style={{ width: "100%", height: "100%", display: "block" }}
        autoPlay
        loop
        controls={false}
        acknowledgeRemotionLicense
        initiallyShowControls={false}
        doubleClickToFullscreen={false}
        clickToPlay={false}
      />
    </div>
  );
}
