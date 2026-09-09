/** Escena: Dos columnas: izquierda dimmed "NO SOS CULPABLE", derecha acento "SÍ SOS RESPONSABLE" | Tema: culpa vs responsabilidad | Reusable: con cambios (frases hardcodeadas) */
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const CulpaResponsabilidadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const enterL = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 11, stiffness: 380 } });
  const enterR = spring({ frame: Math.max(0, frame - 11), fps, config: { damping: 11, stiffness: 380 } });

  const opL = interpolate(enterL, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const yL  = interpolate(enterL, [0, 1], [50, 0]);
  const opR = interpolate(enterR, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const yR  = interpolate(enterR, [0, 1], [50, 0]);

  const dimmed = "rgba(22,42,62,0.38)";
  const accent = "#b18060";

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      <Sequence from={4} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>
      <Sequence from={11} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "row", padding: "0 56px", gap: 0 }}>

        {/* Columna izquierda — CULPA (dimmed) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", opacity: opL, transform: `translateY(${yL}px)` }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 72, color: dimmed, letterSpacing: "-0.03em", lineHeight: 1, textAlign: "center" }}>
            NO SOS
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 72, color: dimmed, letterSpacing: "-0.03em", lineHeight: 1, textAlign: "center" }}>
            CULPABLE
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 28, color: dimmed, marginTop: 18, textAlign: "center", lineHeight: 1.4 }}>
            de lo que<br />te pasó
          </div>
        </div>

        {/* Divisor */}
        <div style={{ width: 2, height: 220, backgroundColor: accent, opacity: 0.5, margin: "0 16px", flexShrink: 0 }} />

        {/* Columna derecha — RESPONSABILIDAD (accent) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", opacity: opR, transform: `translateY(${yR}px)` }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 72, color: accent, letterSpacing: "-0.03em", lineHeight: 1, textAlign: "center" }}>
            SÍ SOS
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 60, color: accent, letterSpacing: "-0.03em", lineHeight: 1, textAlign: "center" }}>
            RESPONSABLE
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 28, color: accent, marginTop: 18, textAlign: "center", lineHeight: 1.4 }}>
            de qué hacés<br />con eso hoy
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
