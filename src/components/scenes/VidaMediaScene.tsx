/** Escena: dos palabras apiladas ("VIDA" "MEDIA") + pill "retiro gradual y seguro", entrada en cascada. | Tema: vida media de fármacos / retiro gradual | Reusable: con cambios (palabras y pill hardcodeadas) */
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#0B1929";
const ACCENT = "#4A9EFF";
const TEXT   = "#FFFFFF";
const DIM    = "#A8C4E0";

export const VidaMediaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 5],  [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const w1Enter = spring({ frame, fps, config: { damping: 11, stiffness: 400 } });
  const w1Scale = interpolate(w1Enter, [0, 1], [0.55, 1]);
  const w1Op    = interpolate(w1Enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const w2Enter = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 11, stiffness: 400 } });
  const w2Scale = interpolate(w2Enter, [0, 1], [0.55, 1]);
  const w2Op    = interpolate(w2Enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const subEnter = spring({ frame: Math.max(0, frame - 13), fps, config: { damping: 15, stiffness: 300 } });
  const subOp    = interpolate(subEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const subY     = interpolate(subEnter, [0, 1], [12, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 4 }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.13} />
      <div style={{ opacity: w1Op, transform: `scale(${w1Scale})` }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 104, color: ACCENT, letterSpacing: "-0.02em", lineHeight: 1 }}>VIDA</span>
      </div>
      <div style={{ opacity: w2Op, transform: `scale(${w2Scale})` }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 104, color: TEXT, letterSpacing: "-0.02em", lineHeight: 1 }}>MEDIA</span>
      </div>
      <div style={{ opacity: subOp, transform: `translateY(${subY}px)`, marginTop: 14 }}>
        <div style={{
          background: `${ACCENT}22`, border: `1.5px solid ${ACCENT}66`,
          borderRadius: 40, paddingInline: 24, paddingBlock: 10,
        }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 28, color: DIM, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            retiro gradual y seguro
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
