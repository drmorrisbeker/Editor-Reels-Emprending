import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#0B1929";
const ACCENT = "#4A9EFF";
const DIM    = "#A8C4E0";

export const SeEntrenaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 5],  [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const w1Enter = spring({ frame, fps, config: { damping: 11, stiffness: 420 } });
  const w1Scale = interpolate(w1Enter, [0, 1], [0.55, 1]);
  const w1Op    = interpolate(w1Enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const w2Enter = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 11, stiffness: 420 } });
  const w2Scale = interpolate(w2Enter, [0, 1], [0.55, 1]);
  const w2Op    = interpolate(w2Enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const subEnter = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 16, stiffness: 300 } });
  const subOp    = interpolate(subEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const subY     = interpolate(subEnter, [0, 1], [12, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 4 }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.14} />
      <div style={{ opacity: w1Op, transform: `scale(${w1Scale})` }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 118, color: ACCENT, letterSpacing: "-0.02em", lineHeight: 1 }}>SE</span>
      </div>
      <div style={{ opacity: w2Op, transform: `scale(${w2Scale})` }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 118, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1 }}>ENTRENA</span>
      </div>
      <div style={{ opacity: subOp, transform: `translateY(${subY}px)`, marginTop: 16 }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 34, color: `${DIM}BB`, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          es una habilidad
        </span>
      </div>
    </AbsoluteFill>
  );
};
