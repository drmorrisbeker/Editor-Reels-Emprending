/** Escena: título grande ("LA LLAVE") + subtítulo + píldora inferior, todo entra con spring en cascada | Tema: rol de salvador/complejo de rescate en una relación | Reusable: no (texto fijo, sin props) */
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#0B1929";
const ACCENT = "#4A9EFF";
const TEXT   = "#FFFFFF";
const DIM    = "#A8C4E0";

export const LlaveScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 5],  [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const titleEnter = spring({ frame, fps, config: { damping: 11, stiffness: 420 } });
  const titleScale = interpolate(titleEnter, [0, 1], [0.5, 1]);
  const titleOp    = interpolate(titleEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const subEnter = spring({ frame: Math.max(0, frame - 7), fps, config: { damping: 15, stiffness: 300 } });
  const subOp    = interpolate(subEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const subY     = interpolate(subEnter, [0, 1], [14, 0]);

  const pillEnter = spring({ frame: Math.max(0, frame - 15), fps, config: { damping: 16, stiffness: 340 } });
  const pillOp    = interpolate(pillEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const pillY     = interpolate(pillEnter, [0, 1], [10, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 10 }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.14} />
      <div style={{ opacity: titleOp, transform: `scale(${titleScale})` }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 130, color: ACCENT, letterSpacing: "-0.03em", lineHeight: 1 }}>
          LA LLAVE
        </span>
      </div>
      <div style={{ opacity: subOp, transform: `translateY(${subY}px)` }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 38, color: TEXT, letterSpacing: "0.01em" }}>
          para salvar a esa persona
        </span>
      </div>
      <div style={{ opacity: pillOp, transform: `translateY(${pillY}px)`, marginTop: 12 }}>
        <div style={{
          background: `${ACCENT}22`, border: `1.5px solid ${ACCENT}66`,
          borderRadius: 40, paddingInline: 24, paddingBlock: 10,
        }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 26, color: DIM, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            cuando nada más ayuda
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
