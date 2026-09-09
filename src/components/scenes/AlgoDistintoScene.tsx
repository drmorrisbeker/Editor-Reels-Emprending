/** Escena: Dos palabras grandes centradas entran en cascada con scale-spring, "ALGO" y "DISTINTO" | Tema: genérica (anuncio de cambio de enfoque) | Reusable: con cambios (palabras ALGO/DISTINTO hardcodeadas) */
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#0B1929";
const ACCENT = "#4A9EFF";
const TEXT   = "#FFFFFF";

export const AlgoDistintoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const w1Enter = spring({ frame, fps, config: { damping: 12, stiffness: 340 } });
  const w1Scale = interpolate(w1Enter, [0, 1], [0.65, 1]);
  const w1Op    = interpolate(w1Enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const w2Enter = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 12, stiffness: 340 } });
  const w2Scale = interpolate(w2Enter, [0, 1], [0.65, 1]);
  const w2Op    = interpolate(w2Enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity, justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 4 }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.14} />
      <div style={{ opacity: w1Op, transform: `scale(${w1Scale})` }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 100, color: ACCENT, letterSpacing: "-0.02em" }}>ALGO</span>
      </div>
      <div style={{ opacity: w2Op, transform: `scale(${w2Scale})` }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 100, color: TEXT, letterSpacing: "-0.02em" }}>DISTINTO</span>
      </div>
    </AbsoluteFill>
  );
};
