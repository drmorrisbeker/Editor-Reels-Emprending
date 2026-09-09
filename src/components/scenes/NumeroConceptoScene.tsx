/** Escena: número grande + divisor + concepto en 2 líneas sobre blur del video de fondo, entra con spring | Tema: genérica (enumeración de puntos) | Reusable: sí (props numero/linea1/linea2, blur del video de fondo) */
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const ACCENT = "#DFBE9A"; // accent-soft de marca (reemplaza el #FFCC00 deprecado)
const WHITE  = "#FFFFFF";

export const NumeroConceptoScene: React.FC<{
  numero: string;
  linea1: string;
  linea2: string;
}> = ({ numero, linea1, linea2 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 3],  [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const numEnter = spring({ frame, fps, config: { damping: 10, stiffness: 350 } });
  const numScale = interpolate(numEnter, [0, 1], [0.4, 1]);
  const numOp    = interpolate(numEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const lineEnter = spring({ frame: Math.max(0, frame - 3), fps, config: { damping: 18, stiffness: 280 } });
  const lineH     = interpolate(lineEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const textEnter = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 14, stiffness: 260 } });
  const textX     = interpolate(textEnter, [0, 1], [40, 0]);
  const textOp    = interpolate(textEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        opacity,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        backgroundColor: "rgba(0,0,0,0.38)",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.20} />

      <div style={{ display: "flex", alignItems: "center", gap: 32, paddingInline: 64 }}>
        {/* Number */}
        <div style={{ opacity: numOp, transform: `scale(${numScale})`, flexShrink: 0 }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 900,
            fontSize: 200,
            color: ACCENT,
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}>
            {numero}
          </span>
        </div>

        {/* Vertical divider */}
        <div style={{
          width: 5,
          height: `${lineH * 180}px`,
          background: WHITE,
          flexShrink: 0,
          borderRadius: 3,
        }} />

        {/* Concept text */}
        <div style={{
          opacity: textOp,
          transform: `translateX(${textX}px)`,
          flex: 1,
        }}>
          <div style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 900,
            fontSize: 66,
            color: WHITE,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
          }}>
            <div>{linea1}</div>
            <div>{linea2}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
