import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

interface Barra {
  label: string;
  value: number; // 0–1
  color?: string;
}

interface Props {
  titulo: string;
  subtitulo?: string;
  barras: Barra[];
}

export const BarrasEstaticoScene: React.FC<Props> = ({ titulo, subtitulo, barras }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const titleEnter = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 11, stiffness: 380 } });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const titleY  = interpolate(titleEnter, [0, 1], [40, 0]);

  const barEnters = barras.map((_, i) =>
    spring({ frame: Math.max(0, frame - (8 + i * 7)), fps, config: { damping: 14, stiffness: 320 } })
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      {barras.map((_, i) => (
        <Sequence key={i} from={8 + i * 7} durationInFrames={6}>
          <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
        </Sequence>
      ))}

      <AbsoluteFill style={{
        justifyContent: "center",
        alignItems: "flex-start",
        flexDirection: "column",
        padding: "0 80px",
        gap: 28,
      }}>
        <div style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 72,
          color: "#162a3e",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}>
          {titulo}
        </div>

        {subtitulo && (
          <div style={{
            opacity: titleOp,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 36,
            color: "rgba(22,42,62,0.45)",
            letterSpacing: "-0.01em",
          }}>
            {subtitulo}
          </div>
        )}

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 36, marginTop: 8 }}>
          {barras.map((barra, i) => {
            const prog  = barEnters[i];
            const barW  = interpolate(prog, [0, 1], [0, barra.value * 100], { extrapolateRight: "clamp" });
            const barOp = interpolate(prog, [0, 1], [0, 1], { extrapolateRight: "clamp" });
            const color = barra.color ?? "#b18060";

            return (
              <div key={i} style={{ opacity: barOp }}>
                <div style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: 36,
                  color: "#162a3e",
                  letterSpacing: "-0.01em",
                  marginBottom: 12,
                }}>
                  {barra.label}
                </div>
                <div style={{
                  width: "100%",
                  height: 32,
                  backgroundColor: `${color}22`,
                  borderRadius: 16,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${barW}%`,
                    height: "100%",
                    backgroundColor: color,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
