import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#0B1929";
const AZUL   = "#4A9EFF";
const DIMMED = "#A8C4E0";

export const ModoHacerSerScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const left = spring({ frame, fps, config: { damping: 12, stiffness: 360 } });
  const leftX  = interpolate(left, [0, 1], [-60, 0]);
  const leftOp = interpolate(left, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const arrow = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 14, stiffness: 340 } });
  const arrowOp = interpolate(arrow, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const right = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 11, stiffness: 380 } });
  const rightX  = interpolate(right, [0, 1], [60, 0]);
  const rightOp = interpolate(right, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const labelStyle: React.CSSProperties = {
    fontFamily: "Inter, sans-serif",
    fontWeight: 500,
    fontSize: 34,
    color: DIMMED,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 4,
  };

  const modeStyle = (color: string): React.CSSProperties => ({
    fontFamily: "Inter, sans-serif",
    fontWeight: 900,
    fontSize: 80,
    color,
    letterSpacing: "-0.02em",
    lineHeight: 1,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 0,
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.14} />

      {/* Lado izquierdo: modo "HACER" */}
      <div style={{
        opacity: leftOp,
        transform: `translateX(${leftX}px)`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        paddingRight: 24,
      }}>
        <span style={labelStyle}>modo</span>
        <span style={modeStyle(DIMMED)}>"HACER"</span>
        <div style={{
          marginTop: 16,
          backgroundColor: "rgba(168,196,224,0.12)",
          border: "1px solid rgba(168,196,224,0.3)",
          borderRadius: 32,
          padding: "8px 20px",
        }}>
          <span style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 28, color: DIMMED }}>
            resistir · luchar
          </span>
        </div>
      </div>

      {/* Separador */}
      <div style={{ opacity: arrowOp, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 1, height: 56, backgroundColor: "rgba(74,158,255,0.25)" }} />
        <span style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 44, color: AZUL }}>→</span>
        <div style={{ width: 1, height: 56, backgroundColor: "rgba(74,158,255,0.25)" }} />
      </div>

      {/* Lado derecho: modo "SER" */}
      <div style={{
        opacity: rightOp,
        transform: `translateX(${rightX}px)`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        paddingLeft: 24,
      }}>
        <span style={labelStyle}>modo</span>
        <span style={modeStyle(AZUL)}>"SER"</span>
        <div style={{
          marginTop: 16,
          backgroundColor: "rgba(74,158,255,0.15)",
          border: "1px solid rgba(74,158,255,0.4)",
          borderRadius: 32,
          padding: "8px 20px",
        }}>
          <span style={{ fontFamily: "Inter", fontWeight: 500, fontSize: 28, color: AZUL }}>
            aceptar · estar
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
