import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { COLORS, FONT } from "./theme";

// ─────────────────────────────────────────────────────────────────────────────
// Gancho (0 → 4,44 s): "3 cosas que un psiquiatra quiere que sepas hoy".
// Entrada cinética con stagger por línea. Ubicado ARRIBA (sobre pared/pelo), encima
// de los ojos, para no taparle la cara durante el arranque. "3 cosas" en cobre.
// Sale con fade justo antes de que arranque el consejo 1. Scrim navy superior sutil.
// ─────────────────────────────────────────────────────────────────────────────

const Line: React.FC<{
  text: string;
  size: number;
  color: string;
  delay: number;
  weight?: number;
}> = ({ text, size, color, delay, weight = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 150 }, durationInFrames: 18 });
  const y = interpolate(enter, [0, 1], [34, 0]);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.02,
        color,
        textTransform: "uppercase",
        letterSpacing: "-0.02em",
        textAlign: "center",
        opacity: enter,
        transform: `translateY(${y}px)`,
        textShadow: "0 3px 12px rgba(0,0,0,0.7), 0 12px 44px rgba(0,0,0,0.5)",
      }}
    >
      {text}
    </div>
  );
};

export const Hook: React.FC<{ durationFrames: number }> = ({ durationFrames }) => {
  const frame = useCurrentFrame();
  // Fade de salida en los últimos 9 frames.
  const out = interpolate(frame, [durationFrames - 9, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: out }}>
      {/* scrim navy superior para despegar el texto de la pared clara */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 900,
          background:
            "linear-gradient(to bottom, rgba(10,24,38,0.62) 0%, rgba(10,24,38,0.34) 55%, rgba(10,24,38,0) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 432,
          left: 70,
          right: 70,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Line text="3 cosas" size={120} color={COLORS.copper} delay={0} />
        <Line text="que un psiquiatra" size={58} color={COLORS.white} delay={6} weight={800} />
        <Line text="quiere que sepas hoy" size={58} color={COLORS.white} delay={11} weight={800} />
      </div>
    </AbsoluteFill>
  );
};
