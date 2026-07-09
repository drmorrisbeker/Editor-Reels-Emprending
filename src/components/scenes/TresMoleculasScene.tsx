import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#0B1929";
const ACCENT = "#4A9EFF";
const TEXT   = "#FFFFFF";
const DIM    = "#A8C4E0";

const MolPill: React.FC<{ label: string; delay: number }> = ({ label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 380 } });
  const op  = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const scl = interpolate(enter, [0, 1], [0.6, 1]);
  return (
    <div style={{ opacity: op, transform: `scale(${scl})` }}>
      <div style={{
        background: `${ACCENT}25`, border: `1.5px solid ${ACCENT}70`,
        borderRadius: 44, paddingInline: 28, paddingBlock: 12,
      }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 30, color: TEXT, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
    </div>
  );
};

export const TresMoleculasScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 5],  [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const titleEnter = spring({ frame, fps, config: { damping: 11, stiffness: 380 } });
  const titleScale = interpolate(titleEnter, [0, 1], [0.55, 1]);
  const titleOp    = interpolate(titleEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const subEnter = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 16, stiffness: 280 } });
  const subOp    = interpolate(subEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const subY     = interpolate(subEnter, [0, 1], [10, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 14 }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.14} />
      <div style={{ opacity: titleOp, transform: `scale(${titleScale})` }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 68, color: ACCENT, letterSpacing: "-0.02em", lineHeight: 1 }}>
          3 MOLÉCULAS
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        <MolPill label="Serotonina"     delay={8}  />
        <MolPill label="Noradrenalina"  delay={13} />
        <MolPill label="Dopamina"       delay={18} />
      </div>
      <div style={{ opacity: subOp, transform: `translateY(${subY}px)`, marginTop: 6 }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 30, color: `${DIM}BB`, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          energía · motivación
        </span>
      </div>
    </AbsoluteFill>
  );
};
