import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

interface Barra {
  label: string;
  valorInicial: number; // 0–1
  valorFinal: number;   // 0–1
  color?: string;
}

interface Props {
  tituloInicial: string;
  tituloFinal: string;
  barras: Barra[];
}

export const InversionBarrasScene: React.FC<Props> = ({ tituloInicial, tituloFinal, barras }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  // Transition: 30%–70% of scene
  const tStart = Math.round(durationInFrames * 0.3);
  const tEnd   = Math.round(durationInFrames * 0.7);

  const titleProg = interpolate(frame, [tStart, tEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      <AbsoluteFill style={{
        justifyContent: "center",
        alignItems: "flex-start",
        flexDirection: "column",
        padding: "0 80px",
        gap: 28,
      }}>
        {/* Title cross-fade */}
        <div style={{ position: "relative", height: 84 }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            opacity: 1 - titleProg,
            fontFamily: "Inter, sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: "#162a3e",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}>
            {tituloInicial}
          </div>
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            opacity: titleProg,
            fontFamily: "Inter, sans-serif",
            fontWeight: 900,
            fontSize: 72,
            color: "#b18060",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}>
            {tituloFinal}
          </div>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 36, marginTop: 8 }}>
          {barras.map((barra, i) => {
            const color = barra.color ?? "#b18060";
            const barW  = interpolate(
              frame,
              [tStart, tEnd],
              [barra.valorInicial * 100, barra.valorFinal * 100],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div key={i}>
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
