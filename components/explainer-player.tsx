"use client";

import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { MedscribeExplainer } from "@/remotion/MedscribeExplainer";
import { MedscribeExplainerMobile } from "@/remotion/MedscribeExplainerMobile";

export function ExplainerPlayer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(max-width: 639px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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
      { threshold: 0.1 },
    );
    io.observe(wrap);

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
  }, [isMobile]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Player
        key={isMobile ? "mobile" : "desktop"}
        ref={playerRef}
        component={isMobile ? MedscribeExplainerMobile : MedscribeExplainer}
        durationInFrames={465}
        fps={30}
        compositionWidth={isMobile ? 1000 : 1200}
        compositionHeight={isMobile ? 800 : 960}
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
