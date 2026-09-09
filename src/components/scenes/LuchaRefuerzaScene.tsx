/** Escena: "PELEAR" → "LA REFUERZA" apiladas con flecha y pill final, springs secuenciales | Tema: lucha vs. aceptación emocional | Reusable: con cambios (textos hardcodeados) */
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG      = "#0B1929";
const ROJO    = "#FF6B6B";
const TEXT    = "#FFFFFF";
const DIMMED  = "#A8C4E0";

export const LuchaRefuerzaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const line1 = spring({ frame, fps, config: { damping: 13, stiffness: 380 } });
  const line1Y  = interpolate(line1, [0, 1], [40, 0]);
  const line1Op = interpolate(line1, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const line2 = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 12, stiffness: 360 } });
  const line2Y  = interpolate(line2, [0, 1], [40, 0]);
  const line2Op = interpolate(line2, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const pill = spring({ frame: Math.max(0, frame - 11), fps, config: { damping: 14, stiffness: 340 } });
  const pillOp = interpolate(pill, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 16,
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.15} />

      {/* Line 1: PELEAR con la emoción */}
      <div style={{ opacity: line1Op, transform: `translateY(${line1Y}px)`, textAlign: "center" }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 88,
          color: ROJO,
          letterSpacing: "-0.02em",
        }}>
          PELEAR
        </span>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 40,
          color: DIMMED,
          letterSpacing: "0.01em",
          display: "block",
          marginTop: -8,
        }}>
          con la emoción
        </span>
      </div>

      {/* Arrow */}
      <div style={{ opacity: line1Op, color: DIMMED, fontSize: 48, lineHeight: 1 }}>↓</div>

      {/* Line 2: LA REFUERZA */}
      <div style={{ opacity: line2Op, transform: `translateY(${line2Y}px)`, textAlign: "center" }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 88,
          color: TEXT,
          letterSpacing: "-0.02em",
        }}>
          LA REFUERZA
        </span>
      </div>

      {/* Pill */}
      <div style={{
        opacity: pillOp,
        marginTop: 20,
        backgroundColor: "rgba(255,107,107,0.18)",
        border: "1.5px solid rgba(255,107,107,0.5)",
        borderRadius: 40,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 28,
        paddingRight: 28,
      }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 32,
          color: ROJO,
          letterSpacing: "0.02em",
        }}>
          la paradoja del sufrimiento
        </span>
      </div>
    </AbsoluteFill>
  );
};
