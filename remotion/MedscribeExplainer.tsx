import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

const COLORS = {
  cream: "#fcfbf8",
  mint: "#cdd9e6",
  mintInk: "#233452",
  ink: "#0f172a",
  navy: "#1a2540",
  peach: "#f0b58a",
  white: "#ffffff",
  muted: "#7a8392",
};

const FONT = '"Bricolage Grotesque", "Inter", system-ui, sans-serif';

function fade(frame: number, inStart: number, inEnd: number, outStart: number, outEnd: number) {
  return interpolate(frame, [inStart, inEnd, outStart, outEnd], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

const Eyebrow: React.FC<{ children: React.ReactNode; opacity: number }> = ({ children, opacity }) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: 18,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: COLORS.mintInk,
      opacity,
      fontWeight: 500,
    }}
  >
    {children}
  </div>
);

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "60px 0",
    }}
  >
    {children}
  </AbsoluteFill>
);

const Scene2Recording: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame;
  const enter = spring({ frame: localFrame, fps: 30, config: { damping: 14, stiffness: 90 } });
  const exit = fade(localFrame, 0, 10, 95, 115);
  const barCount = 22;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", opacity: exit, width: "100%" }}>
        <Eyebrow opacity={fade(localFrame, 0, 12, 95, 115)}>01 · Record</Eyebrow>
        <div
          style={{
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: COLORS.mint,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "48px auto 0",
            transform: `scale(${0.6 + enter * 0.4})`,
            boxShadow: `0 0 0 ${28 + Math.sin(localFrame * 0.18) * 16}px ${COLORS.mint}55`,
          }}
        >
          <svg width="180" height="180" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="3" width="6" height="12" rx="3" fill={COLORS.mintInk} />
            <path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke={COLORS.mintInk} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ marginTop: 56, display: "flex", alignItems: "center", justifyContent: "center", gap: 14, height: 140 }}>
          {Array.from({ length: barCount }).map((_, i) => {
            const phase = localFrame * 0.22 + i * 0.45;
            const h = 28 + Math.abs(Math.sin(phase)) * 108 * Math.min(1, enter);
            return (
              <div
                key={i}
                style={{
                  width: 14,
                  height: h,
                  borderRadius: 7,
                  background: COLORS.mintInk,
                  opacity: 0.85,
                }}
              />
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Scene3Transcribe: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - 105;
  const lines = [
    "Patient reports persistent cough for 5 days,",
    "no fever, mild chest tightness.",
    "Lungs clear on auscultation. SpO₂ 98% on room air.",
    "Likely viral bronchitis; trial of bronchodilator.",
  ];
  const containerOpacity = fade(localFrame, 0, 12, 95, 115);
  return (
    <Stage>
      <div style={{ width: 1080, opacity: containerOpacity }}>
        <Eyebrow opacity={fade(localFrame, 0, 14, 95, 115)}>02 · Transcribe</Eyebrow>
        <div
          style={{
            marginTop: 36,
            background: COLORS.white,
            borderRadius: 40,
            padding: "60px 64px",
            border: `1px solid ${COLORS.mint}`,
            boxShadow: "0 32px 80px -36px rgba(15,23,42,0.22)",
          }}
        >
          {lines.map((line, i) => {
            const start = i * 14;
            const lineOpacity = interpolate(localFrame, [start, start + 16], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const translate = interpolate(localFrame, [start, start + 16], [10, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  fontFamily: FONT,
                  fontSize: 42,
                  color: COLORS.ink,
                  lineHeight: 1.45,
                  opacity: lineOpacity,
                  transform: `translateY(${translate}px)`,
                  letterSpacing: "-0.01em",
                  fontWeight: 500,
                }}
              >
                {line}
              </div>
            );
          })}
          <div
            style={{
              marginTop: 28,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: `${COLORS.mint}88`,
              padding: "10px 20px",
              borderRadius: 999,
              color: COLORS.mintInk,
              fontFamily: FONT,
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
              opacity: fade(localFrame, 70, 84, 95, 115),
            }}
          >
            Whisper · transcript ready
          </div>
        </div>
      </div>
    </Stage>
  );
};

const Scene4Soap: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - 210;
  const sections: Array<[string, string]> = [
    ["S", "Subjective"],
    ["O", "Objective"],
    ["A", "Assessment"],
    ["P", "Plan"],
  ];
  const op = fade(localFrame, 0, 14, 95, 115);
  return (
    <Stage>
      <div style={{ width: 1000, opacity: op }}>
        <Eyebrow opacity={fade(localFrame, 0, 12, 95, 115)}>03 · Draft</Eyebrow>
        <div
          style={{
            marginTop: 36,
            background: COLORS.white,
            borderRadius: 40,
            padding: "60px 64px",
            border: `1px solid ${COLORS.mint}`,
            boxShadow: "0 32px 80px -36px rgba(15,23,42,0.24)",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 32,
              color: COLORS.navy,
              letterSpacing: "-0.02em",
            }}
          >
            SOAP note
          </div>
          <div
            style={{
              marginTop: 32,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 26,
            }}
          >
            {sections.map(([letter, label], i) => {
              const start = i * 8;
              const o = interpolate(localFrame, [start, start + 14], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              const ty = interpolate(localFrame, [start, start + 14], [16, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={letter}
                  style={{
                    opacity: o,
                    transform: `translateY(${ty}px)`,
                    background: COLORS.cream,
                    borderRadius: 24,
                    padding: "26px 28px",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 18,
                      background: COLORS.mint,
                      color: COLORS.mintInk,
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: 34,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {letter}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: FONT,
                        fontWeight: 600,
                        fontSize: 26,
                        color: COLORS.ink,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        height: 9,
                        width: "100%",
                        background: `${COLORS.muted}22`,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Stage>
  );
};

// Simple signature: one bold loop on the left, then a short trailing wave.
const SIGNATURE_PATH =
  "M 18 34 \
   c -10 -30, 70 -36, 56 -2 \
   c -4 12, -48 8, -22 -8 \
   c 12 -6, 22 4, 28 12 \
   q 10 6, 18 -3 \
   q 8 -2, 14 4 \
   l 24 -2";

function Signature({
  progress,
  color,
  width = 220,
}: {
  progress: number; // 0 → 1
  color: string;
  width?: number;
}) {
  const offset = 100 * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <svg
      viewBox="0 0 200 48"
      width={width}
      height={(width * 48) / 200}
      style={{ display: "block" }}
      aria-hidden
    >
      <path
        d={SIGNATURE_PATH}
        pathLength={100}
        stroke={color}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={100}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

const Scene5Twin: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - 315;
  const handoutSpring = spring({ frame: localFrame - 8, fps: 30, config: { damping: 14, stiffness: 80 } });
  const checkScale = spring({ frame: localFrame - 30, fps: 30, config: { damping: 18, stiffness: 200 } });
  const fadeIn = fade(localFrame, 0, 14, 130, 150);

  // Signature draws — ~0.6s each.
  const sigSoap = interpolate(localFrame, [55, 73], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sigHandout = interpolate(localFrame, [61, 79], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Doctor name fades in after signature completes.
  const nameOpacity = fade(localFrame, 84, 98, 130, 150);

  const Doc = ({
    label,
    accent,
    pill,
    showCheck,
    signatureProgress,
    style,
  }: {
    label: string;
    accent: string;
    pill: string;
    showCheck: boolean;
    signatureProgress: number;
    style: React.CSSProperties;
  }) => (
    <div
      style={{
        width: 400,
        height: 540,
        borderRadius: 32,
        background: COLORS.white,
        border: `1px solid ${COLORS.mint}`,
        boxShadow: "0 40px 100px -40px rgba(15,23,42,0.28)",
        padding: 36,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        ...style,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            background: accent,
            color: COLORS.navy,
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 1.8,
            textTransform: "uppercase",
            padding: "8px 16px",
            borderRadius: 999,
          }}
        >
          {pill}
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: COLORS.mint,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${showCheck ? checkScale : 0})`,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke={COLORS.mintInk} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 32,
          color: COLORS.navy,
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 13 }}>
        {[100, 92, 78, 95, 70, 86].map((w, i) => (
          <div
            key={i}
            style={{
              height: 10,
              borderRadius: 5,
              background: `${COLORS.muted}1f`,
              width: `${w}%`,
            }}
          />
        ))}
      </div>
      <div
        style={{
          borderTop: `1px solid ${COLORS.mint}`,
          paddingTop: 18,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 6,
          minHeight: 88,
        }}
      >
        <Signature progress={signatureProgress} color={COLORS.navy} width={240} />
        <div
          style={{
            fontFamily: FONT,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: 1.6,
            textTransform: "uppercase",
            color: `${COLORS.muted}`,
            opacity: nameOpacity,
          }}
        >
          Dr. M. Owens · Family Med
        </div>
      </div>
    </div>
  );

  return (
    <Stage>
      <div style={{ textAlign: "center", width: "100%" }}>
        <div style={{ opacity: fadeIn }}>
          <Eyebrow opacity={fadeIn}>04 · Two documents, one signature</Eyebrow>
        </div>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            gap: 44,
            justifyContent: "center",
            alignItems: "flex-end",
            opacity: fadeIn,
          }}
        >
          <Doc
            label="Clinical SOAP note"
            accent={COLORS.mint}
            pill="For the chart"
            showCheck={localFrame > 30}
            signatureProgress={sigSoap}
            style={{ transform: `translateY(${(1 - Math.min(1, fadeIn)) * 12}px)` }}
          />
          <Doc
            label="Patient handout"
            accent={COLORS.peach}
            pill="For the patient"
            showCheck={localFrame > 38}
            signatureProgress={sigHandout}
            style={{
              transform: `translateX(${(1 - handoutSpring) * 80}px) translateY(${(1 - handoutSpring) * 22}px)`,
              opacity: handoutSpring,
            }}
          />
        </div>
      </div>
    </Stage>
  );
};

export const MedscribeExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scenes: Array<{ start: number; end: number; render: (f: number) => React.ReactNode }> = [
    { start: 0, end: 115, render: (f) => <Scene2Recording frame={f} /> },
    { start: 105, end: 220, render: (f) => <Scene3Transcribe frame={f} /> },
    { start: 210, end: 325, render: (f) => <Scene4Soap frame={f} /> },
    { start: 315, end: durationInFrames, render: (f) => <Scene5Twin frame={f} /> },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {scenes.map((scene, i) => {
        if (frame < scene.start - 6 || frame > scene.end + 6) return null;
        const opacity = interpolate(
          frame,
          [scene.start - 6, scene.start + 4, scene.end - 8, scene.end + 4],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        return (
          <AbsoluteFill key={i} style={{ opacity }}>
            {scene.render(frame)}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
