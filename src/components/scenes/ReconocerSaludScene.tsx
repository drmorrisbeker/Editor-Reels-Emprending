import {
  AbsoluteFill, Audio, interpolate,
  spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";

const BG   = "#0B1929";
const AZUL = "#4A9EFF";
const AMARI = "#FFCC00";
const DIM  = "#A8C4E0";

export const ReconocerSaludScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const row1 = spring({ frame, fps, config: { damping: 14, stiffness: 380 } });
  const row1Y  = interpolate(row1, [0, 1], [40, 0]);
  const row1Op = interpolate(row1, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const arrowF = Math.max(0, frame - 6);
  const arrow  = spring({ frame: arrowF, fps, config: { damping: 14, stiffness: 380 } });
  const arrowOp = interpolate(arrow, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const row2F = Math.max(0, frame - 10);
  const row2  = spring({ frame: row2F, fps, config: { damping: 14, stiffness: 380 } });
  const row2Y  = interpolate(row2, [0, 1], [40, 0]);
  const row2Op = interpolate(row2, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      backgroundColor: BG,
      opacity,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap: 12,
      overflow: "hidden",
    }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.13} />

      <div style={{ opacity: row1Op, transform: `translateY(${row1Y}px)`, textAlign: "center" }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 86,
          color: AZUL,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}>
          RECONOCER
        </span>
        <div style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 34,
          color: DIM,
          marginTop: 4,
          letterSpacing: "0.02em",
        }}>
          lo que sentís
        </div>
      </div>

      <div style={{ opacity: arrowOp, fontSize: 56, color: DIM, lineHeight: 1 }}>
        ↓
      </div>

      <div style={{ opacity: row2Op, transform: `translateY(${row2Y}px)`, textAlign: "center" }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 72,
          color: AMARI,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
        }}>
          MEJOR SALUD
        </span>
        <br />
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 72,
          color: AMARI,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
        }}>
          MENTAL
        </span>
      </div>
    </AbsoluteFill>
  );
};
