import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

const COLORS = {
  cream: "#fcfbf8",
  mint: "#b9cee8",
  mintInk: "#233452",
  ink: "#0f172a",
  navy: "#1a2540",
  peach: "#f0b58a",
  white: "#ffffff",
  muted: "#7a8392",
};

const FONT = '"Bricolage Grotesque", "Inter", system-ui, sans-serif';

function fade(
  frame: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number,
) {
  return interpolate(
    frame,
    [inStart, inEnd, outStart, outEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

const Eyebrow: React.FC<{ children: React.ReactNode; opacity: number }> = ({
  children,
  opacity,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontSize: 34,
      letterSpacing: 7,
      textTransform: "uppercase",
      color: COLORS.mintInk,
      opacity,
      fontWeight: 600,
      textAlign: "center",
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
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "70px 60px",
      gap: 44,
    }}
  >
    {children}
  </AbsoluteFill>
);

const Scene1Record: React.FC<{ frame: number }> = ({ frame }) => {
  const enter = spring({
    frame,
    fps: 30,
    config: { damping: 14, stiffness: 90 },
  });
  const exit = fade(frame, 0, 10, 95, 115);
  return (
    <Stage>
      <Eyebrow opacity={fade(frame, 0, 12, 95, 115)}>01 · Record</Eyebrow>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 48,
          opacity: exit,
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: COLORS.mint,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${0.65 + enter * 0.35})`,
            boxShadow: `0 0 0 ${24 + Math.sin(frame * 0.18) * 14}px ${COLORS.mint}55`,
          }}
        >
          <svg width="160" height="160" viewBox="0 0 24 24" fill="none">
            <rect
              x="9"
              y="3"
              width="6"
              height="12"
              rx="3"
              fill={COLORS.mintInk}
            />
            <path
              d="M6 11a6 6 0 0 0 12 0M12 17v4"
              stroke={COLORS.mintInk}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 76,
            fontWeight: 700,
            color: COLORS.ink,
            letterSpacing: "-0.03em",
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          Speak the visit.
        </div>
      </div>
    </Stage>
  );
};

const Scene2Transcribe: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - 105;
  const containerOpacity = fade(localFrame, 0, 12, 95, 115);
  const line1Opacity = interpolate(localFrame, [6, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const line2Opacity = interpolate(localFrame, [26, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pillOpacity = fade(localFrame, 58, 76, 95, 115);
  return (
    <Stage>
      <Eyebrow opacity={fade(localFrame, 0, 14, 95, 115)}>
        02 · Transcribe
      </Eyebrow>
      <div
        style={{
          width: 820,
          background: COLORS.white,
          borderRadius: 40,
          padding: "56px 60px",
          border: `2px solid ${COLORS.mint}`,
          boxShadow: "0 32px 80px -36px rgba(15,23,42,0.22)",
          opacity: containerOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 22,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 60,
            fontWeight: 600,
            color: COLORS.ink,
            lineHeight: 1.18,
            letterSpacing: "-0.01em",
            opacity: line1Opacity,
          }}
        >
          Persistent cough, 5 days.
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 60,
            fontWeight: 600,
            color: COLORS.ink,
            lineHeight: 1.18,
            letterSpacing: "-0.01em",
            opacity: line2Opacity,
          }}
        >
          No fever. Lungs clear.
        </div>
        <div
          style={{
            marginTop: 14,
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: `${COLORS.mint}aa`,
            padding: "14px 26px",
            borderRadius: 999,
            color: COLORS.mintInk,
            fontFamily: FONT,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase",
            opacity: pillOpacity,
          }}
        >
          Whisper · ready
        </div>
      </div>
    </Stage>
  );
};

const Scene3Soap: React.FC<{ frame: number }> = ({ frame }) => {
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
      <Eyebrow opacity={fade(localFrame, 0, 12, 95, 115)}>03 · Draft</Eyebrow>
      <div style={{ opacity: op, width: 820 }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 56,
            color: COLORS.navy,
            letterSpacing: "-0.02em",
            textAlign: "center",
            marginBottom: 36,
          }}
        >
          SOAP note
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
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
                  borderRadius: 28,
                  padding: "26px 28px",
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                }}
              >
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 22,
                    background: COLORS.mint,
                    color: COLORS.mintInk,
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {letter}
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontWeight: 600,
                    fontSize: 34,
                    color: COLORS.ink,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};

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
  progress: number;
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

type DocProps = {
  label: string;
  pill: string;
  accent: string;
  signatureProgress: number;
  style: React.CSSProperties;
};

const Doc: React.FC<DocProps> = ({
  label,
  pill,
  accent,
  signatureProgress,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      width: 460,
      height: 540,
      borderRadius: 32,
      background: COLORS.white,
      border: `2px solid ${COLORS.mint}`,
      boxShadow: "0 40px 100px -40px rgba(15,23,42,0.28)",
      padding: 36,
      display: "flex",
      flexDirection: "column",
      gap: 22,
      ...style,
    }}
  >
    <div
      style={{
        alignSelf: "flex-start",
        background: accent,
        color: COLORS.navy,
        fontFamily: FONT,
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: 2.4,
        textTransform: "uppercase",
        padding: "10px 20px",
        borderRadius: 999,
      }}
    >
      {pill}
    </div>
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 42,
        color: COLORS.navy,
        letterSpacing: "-0.02em",
        lineHeight: 1.05,
      }}
    >
      {label}
    </div>
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {[100, 92, 78, 95, 70].map((w, i) => (
        <div
          key={i}
          style={{
            height: 14,
            borderRadius: 7,
            background: `${COLORS.muted}1f`,
            width: `${w}%`,
          }}
        />
      ))}
    </div>
    <div
      style={{
        borderTop: `2px solid ${COLORS.mint}`,
        paddingTop: 18,
      }}
    >
      <Signature progress={signatureProgress} color={COLORS.navy} width={280} />
    </div>
  </div>
);

const Scene4Twin: React.FC<{ frame: number }> = ({ frame }) => {
  const localFrame = frame - 315;
  const fadeIn = fade(localFrame, 0, 14, 130, 150);
  const card2Spring = spring({
    frame: localFrame - 10,
    fps: 30,
    config: { damping: 14, stiffness: 80 },
  });
  const sig1 = interpolate(localFrame, [40, 62], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sig2 = interpolate(localFrame, [50, 72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Stage>
      <Eyebrow opacity={fadeIn}>04 · Two documents</Eyebrow>
      <div
        style={{
          position: "relative",
          width: 620,
          height: 600,
          opacity: fadeIn,
        }}
      >
        <Doc
          label="SOAP note"
          pill="For the chart"
          accent={COLORS.mint}
          signatureProgress={sig1}
          style={{
            left: 0,
            top: 30,
            transform: "rotate(-3deg)",
            zIndex: 1,
          }}
        />
        <Doc
          label="Patient handout"
          pill="For the patient"
          accent={COLORS.peach}
          signatureProgress={sig2}
          style={{
            left: 140,
            top: 0,
            transform: `rotate(3deg) translateX(${(1 - card2Spring) * 60}px)`,
            opacity: card2Spring,
            zIndex: 2,
          }}
        />
      </div>
    </Stage>
  );
};

export const MedscribeExplainerMobile: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scenes: Array<{
    start: number;
    end: number;
    render: (f: number) => React.ReactNode;
  }> = [
    { start: 0, end: 115, render: (f) => <Scene1Record frame={f} /> },
    { start: 105, end: 220, render: (f) => <Scene2Transcribe frame={f} /> },
    { start: 210, end: 325, render: (f) => <Scene3Soap frame={f} /> },
    {
      start: 315,
      end: durationInFrames,
      render: (f) => <Scene4Twin frame={f} />,
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      {scenes.map((scene, i) => {
        if (frame < scene.start - 6 || frame > scene.end + 6) return null;
        const opacity = interpolate(
          frame,
          [scene.start - 6, scene.start + 4, scene.end - 8, scene.end + 4],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
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
