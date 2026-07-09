import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

interface Paso {
  dia: string;
  texto: string;
  acento?: boolean;
}

interface Props {
  titulo: string;
  pasos: Paso[];
}

// Línea de tiempo vertical — ilustra que los efectos son transitorios:
// aparecen, ceden y desaparecen en pocos días. El último paso va en acento.
export const LineaTiempoScene: React.FC<Props> = ({ titulo, pasos }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const titleEnter = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 12, stiffness: 360 } });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const titleY  = interpolate(titleEnter, [0, 1], [40, 0]);

  const ACCENT = "#b18060";
  const DARK   = "#162a3e";

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      {pasos.map((_, i) => (
        <Sequence key={i} from={8 + i * 9} durationInFrames={6}>
          <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
        </Sequence>
      ))}

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", padding: "0 90px" }}>
        <div style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 70,
          color: DARK,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          marginBottom: 64,
          textAlign: "center",
        }}>
          {titulo}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0, alignSelf: "stretch" }}>
          {pasos.map((paso, i) => {
            const enter = spring({ frame: Math.max(0, frame - (8 + i * 9)), fps, config: { damping: 14, stiffness: 300 } });
            const op = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
            const x  = interpolate(enter, [0, 1], [-50, 0]);
            const color = paso.acento ? ACCENT : DARK;
            const isLast = i === pasos.length - 1;

            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 32, opacity: op, transform: `translateX(${x}px)` }}>
                {/* columna del dot + línea conectora */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: color,
                    flexShrink: 0,
                    marginTop: 8,
                  }} />
                  {!isLast && <div style={{ width: 5, flex: 1, minHeight: 56, backgroundColor: `${ACCENT}55`, marginTop: 4, marginBottom: 4 }} />}
                </div>

                {/* texto del paso */}
                <div style={{ paddingBottom: isLast ? 0 : 28 }}>
                  <div style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 900,
                    fontSize: paso.acento ? 64 : 52,
                    color,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.05,
                  }}>
                    {paso.dia}
                  </div>
                  <div style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 38,
                    color: paso.acento ? ACCENT : "rgba(22,42,62,0.55)",
                    letterSpacing: "-0.01em",
                    marginTop: 4,
                  }}>
                    {paso.texto}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
