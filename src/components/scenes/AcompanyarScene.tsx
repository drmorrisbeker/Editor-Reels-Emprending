import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#f5e9d2";
const TEXT   = "#162a3e";
const ACCENT = "#b18060";
const DIMMED = "rgba(22,42,62,0.35)";

export const AcompanyarScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const left  = spring({ frame, fps, config: { damping: 12, stiffness: 360 } });
  const leftX  = interpolate(left, [0, 1], [-50, 0]);
  const leftOp = interpolate(left, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const divider = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 14, stiffness: 340 } });
  const divOp   = interpolate(divider, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const right  = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 11, stiffness: 380 } });
  const rightX  = interpolate(right, [0, 1], [50, 0]);
  const rightOp = interpolate(right, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const headerStyle: React.CSSProperties = {
    fontFamily: "Inter, sans-serif",
    fontWeight: 800,
    fontSize: 28,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 18,
  };

  const itemStyle: React.CSSProperties = {
    fontFamily: "Inter, sans-serif",
    fontWeight: 800,
    fontSize: 54,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
    textTransform: "uppercase",
    textAlign: "center",
  };

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      <Sequence from={8} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>

      {/* Columna izquierda — lo habitual */}
      <div style={{
        opacity: leftOp,
        transform: `translateX(${leftX}px)`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "0 24px",
      }}>
        <span style={{ ...headerStyle, color: DIMMED }}>Lo habitual</span>
        <span style={{ ...itemStyle, color: DIMMED }}>MOTIVAR</span>
        <span style={{ ...itemStyle, color: DIMMED, fontSize: 36, marginTop: 14, lineHeight: 1.2 }}>
          "TODO VA A{"\n"}ESTAR BIEN"
        </span>
      </div>

      {/* Divisor */}
      <div style={{
        opacity: divOp,
        flexShrink: 0,
        width: 1,
        height: 220,
        backgroundColor: `${TEXT}33`,
      }} />

      {/* Columna derecha — lo que funciona */}
      <div style={{
        opacity: rightOp,
        transform: `translateX(${rightX}px)`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "0 24px",
      }}>
        <span style={{ ...headerStyle, color: ACCENT }}>Lo que funciona</span>
        <span style={{ ...itemStyle, color: TEXT }}>ESCUCHAR</span>
        <span style={{ ...itemStyle, color: TEXT, fontSize: 36, marginTop: 14 }}>ESTAR AHÍ</span>
      </div>
    </AbsoluteFill>
  );
};
