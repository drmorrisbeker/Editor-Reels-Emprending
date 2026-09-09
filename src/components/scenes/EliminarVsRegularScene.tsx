/** Escena: dos columnas contrastadas (izq. atenuada, der. en acento) separadas por "vs", con marca y subtítulo | Tema: eliminar vs regular la ansiedad | Reusable: con cambios (textos hardcodeados) */
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Paleta rehook
const BG     = "#f5e9d2";
const TEXTO  = "#162a3e";
const ACENTO = "#b18060";
const DIMMED = "rgba(22,42,62,0.35)";

// Contraste central del video: ELIMINAR la ansiedad (no se puede) vs REGULAR (sí).
export const EliminarVsRegularScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const left = spring({ frame, fps, config: { damping: 12, stiffness: 360 } });
  const leftX  = interpolate(left, [0, 1], [-60, 0]);
  const leftOp = interpolate(left, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const sep = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 14, stiffness: 340 } });
  const sepOp = interpolate(sep, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const right = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 11, stiffness: 380 } });
  const rightX  = interpolate(right, [0, 1], [60, 0]);
  const rightOp = interpolate(right, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const markStyle = (color: string): React.CSSProperties => ({
    fontFamily: "Inter, sans-serif",
    fontWeight: 900,
    fontSize: 64,
    color,
    lineHeight: 1,
    marginBottom: 14,
  });

  const modeStyle = (color: string): React.CSSProperties => ({
    fontFamily: "Inter, sans-serif",
    fontWeight: 900,
    fontSize: 74,
    color,
    letterSpacing: "-0.02em",
    lineHeight: 1,
    textTransform: "uppercase",
  });

  const subStyle = (color: string, border: string, bg: string): React.CSSProperties => ({
    marginTop: 18,
    backgroundColor: bg,
    border: `2px solid ${border}`,
    borderRadius: 40,
    padding: "10px 22px",
    fontFamily: "Inter, sans-serif",
    fontWeight: 500,
    fontSize: 28,
    color,
    letterSpacing: "-0.01em",
    maxWidth: 360,
    textAlign: "center" as const,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        opacity,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 0,
        overflow: "hidden",
      }}
    >
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.15} />
      <Sequence from={2}  durationInFrames={6}><Audio src={staticFile("sfx/plop.mp3")} volume={0.10} /></Sequence>
      <Sequence from={10} durationInFrames={6}><Audio src={staticFile("sfx/plop.mp3")} volume={0.10} /></Sequence>

      {/* Izquierda: ELIMINAR (dimmed, ✗) */}
      <div style={{
        opacity: leftOp,
        transform: `translateX(${leftX}px)`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        paddingRight: 20,
      }}>
        <span style={markStyle(DIMMED)}>✕</span>
        <span style={modeStyle(DIMMED)}>Eliminar</span>
        <div style={subStyle(DIMMED, "rgba(22,42,62,0.22)", "rgba(22,42,62,0.06)")}>
          dejar de ser humano
        </div>
      </div>

      {/* Separador */}
      <div style={{ opacity: sepOp, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ width: 1, height: 64, backgroundColor: "rgba(177,128,96,0.3)" }} />
        <span style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 40, color: ACENTO }}>vs</span>
        <div style={{ width: 1, height: 64, backgroundColor: "rgba(177,128,96,0.3)" }} />
      </div>

      {/* Derecha: REGULAR (acento, ✓) */}
      <div style={{
        opacity: rightOp,
        transform: `translateX(${rightX}px)`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        paddingLeft: 20,
      }}>
        <span style={markStyle(ACENTO)}>✓</span>
        <span style={modeStyle(ACENTO)}>Regular</span>
        <div style={subStyle(TEXTO, "rgba(177,128,96,0.5)", "rgba(177,128,96,0.14)")}>
          que no te desborde
        </div>
      </div>
    </AbsoluteFill>
  );
};
