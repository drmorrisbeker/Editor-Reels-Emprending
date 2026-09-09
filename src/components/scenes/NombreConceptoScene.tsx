/** Escena: placa de nombre grande + concepto en acento + detalle chico atenuado, centrada sobre blur del video de fondo, entra en cascada con spring | Tema: genérica (presentar a una persona/autoría) | Reusable: sí (props nombre/concepto/detalle, blur del video de fondo) */
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const ACCENT = "#DFBE9A"; // accent-soft de marca (escenas con blur del video de fondo)
const WHITE  = "#FFFFFF";

export const NombreConceptoScene: React.FC<{
  nombre: string;
  concepto: string;
  detalle?: string;
}> = ({ nombre, concepto, detalle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in 4 frames / fade out 10 frames (spec)
  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  // Nombre: scale-spring punchy
  const nameEnter = spring({ frame, fps, config: { damping: 14, stiffness: 260 } });
  const nameScale = interpolate(nameEnter, [0, 1], [0.7, 1]);
  const nameOp    = interpolate(nameEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  // Divisor: crece en ancho
  const lineEnter = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 18, stiffness: 280 } });
  const lineW     = interpolate(lineEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  // Concepto (acento)
  const concEnter = spring({ frame: Math.max(0, frame - 7), fps, config: { damping: 16, stiffness: 260 } });
  const concY     = interpolate(concEnter, [0, 1], [30, 0]);
  const concOp    = interpolate(concEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  // Detalle chico (atenuado)
  const detEnter  = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 20, stiffness: 260 } });
  const detY      = interpolate(detEnter, [0, 1], [24, 0]);
  const detOp     = interpolate(detEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

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
      {/* woosh siempre al inicio */}
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.20} />
      {/* plop del concepto en acento */}
      <Sequence from={7} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>
      {/* click sutil del detalle */}
      <Sequence from={12} durationInFrames={6}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.07} />
      </Sequence>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, paddingInline: 72, textAlign: "center" }}>
        {/* Nombre */}
        <div style={{ opacity: nameOp, transform: `scale(${nameScale})` }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 900,
            fontSize: 84,
            color: WHITE,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textShadow: "0 4px 18px rgba(0,0,0,0.55)",
          }}>
            {nombre}
          </span>
        </div>

        {/* Divisor horizontal en acento */}
        <div style={{
          width: `${lineW * 140}px`,
          height: 5,
          background: ACCENT,
          borderRadius: 3,
        }} />

        {/* Concepto en acento */}
        <div style={{
          opacity: concOp,
          transform: `translateY(${concY}px)`,
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 50,
          color: ACCENT,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
        }}>
          {concepto}
        </div>

        {/* Detalle chico atenuado */}
        {detalle ? (
          <div style={{
            opacity: detOp * 0.82,
            transform: `translateY(${detY}px)`,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 34,
            color: WHITE,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            maxWidth: 820,
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}>
            {detalle}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
