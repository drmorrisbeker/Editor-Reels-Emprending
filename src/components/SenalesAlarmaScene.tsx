import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

interface Props {
  titulo: string;
  items: string[];
  cierre: string;
}

// Señales de alarma — cuándo dejar de tolerar los efectos y avisarle al psiquiatra.
// Los ítems entran uno a uno como pills; abajo, una flecha y la acción en acento.
export const SenalesAlarmaScene: React.FC<Props> = ({ titulo, items, cierre }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const ACCENT = "#b18060";
  const DARK   = "#162a3e";

  const titleEnter = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 12, stiffness: 360 } });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const titleY  = interpolate(titleEnter, [0, 1], [40, 0]);

  const cierreFrame = 8 + items.length * 7 + 6;
  const cierreEnter = spring({ frame: Math.max(0, frame - cierreFrame), fps, config: { damping: 14, stiffness: 320 } });
  const cierreOp = interpolate(cierreEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const cierreY  = interpolate(cierreEnter, [0, 1], [30, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      {items.map((_, i) => (
        <Sequence key={i} from={8 + i * 7} durationInFrames={6}>
          <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
        </Sequence>
      ))}
      <Sequence from={cierreFrame} durationInFrames={6}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.07} />
      </Sequence>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", padding: "0 80px" }}>
        <div style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 64,
          color: DARK,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          marginBottom: 44,
          textAlign: "center",
          lineHeight: 1.05,
        }}>
          {titulo}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "center" }}>
          {items.map((item, i) => {
            const enter = spring({ frame: Math.max(0, frame - (8 + i * 7)), fps, config: { damping: 14, stiffness: 320 } });
            const op = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
            const y  = interpolate(enter, [0, 1], [40, 0]);
            return (
              <div key={i} style={{
                opacity: op,
                transform: `translateY(${y}px)`,
                fontFamily: "Inter, sans-serif",
                fontWeight: 800,
                fontSize: 46,
                color: DARK,
                letterSpacing: "-0.01em",
                backgroundColor: `${ACCENT}22`,
                border: `2px solid ${ACCENT}88`,
                borderRadius: 50,
                padding: "16px 40px",
              }}>
                {item}
              </div>
            );
          })}
        </div>

        <div style={{ opacity: cierreOp, transform: `translateY(${cierreY}px)`, marginTop: 40, textAlign: "center" }}>
          <div style={{ fontSize: 52, color: ACCENT, lineHeight: 1, marginBottom: 8 }}>↓</div>
          <div style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 900,
            fontSize: 56,
            color: ACCENT,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}>
            {cierre}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
