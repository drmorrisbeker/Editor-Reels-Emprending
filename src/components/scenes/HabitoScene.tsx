import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const HabitoScene: React.FC<{ habito: string; subtitulo?: string; color?: string }> = ({
  habito,
  subtitulo,
  color = "#4A9EFF",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const pillEnter = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 14, stiffness: 320 } });
  const pillOp    = interpolate(pillEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const pillY     = interpolate(pillEnter, [0, 1], [40, 0]);
  const pillScale = interpolate(pillEnter, [0, 1], [0.88, 1]);

  const subEnter = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 14, stiffness: 320 } });
  const subOp    = interpolate(subEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      <Sequence from={6} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>

      <AbsoluteFill style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 24,
        padding: "0 80px",
      }}>
        <div style={{
          opacity: pillOp,
          transform: `translateY(${pillY}px) scale(${pillScale})`,
          backgroundColor: `${color}22`,
          border: `3px solid ${color}88`,
          borderRadius: 999,
          padding: "32px 72px",
        }}>
          <div style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color,
            letterSpacing: "-0.02em",
            textAlign: "center",
            lineHeight: 1.1,
          }}>
            {habito}
          </div>
        </div>

        {subtitulo && (
          <div style={{
            opacity: subOp,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 34,
            color: "rgba(22,42,62,0.5)",
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}>
            {subtitulo}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
