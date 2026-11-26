import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";
import { COLORS, FONT } from "./theme";

// ─────────────────────────────────────────────────────────────────────────────
// Franja de concepto: el titular de cada consejo (y del cierre). Va arriba, debajo
// de los chips, sobre la pared/pelo (zona libre, no tapa ojos ni boca). Entra con
// pop + leve subida (< 1 s) y queda fijo durante todo el tramo. Cobre permitido:
// barra de acento y kicker. El titular en blanco.
// ─────────────────────────────────────────────────────────────────────────────

export const ConceptBand: React.FC<{
  headline: string;
  kicker?: string; // etiqueta chica en cobre (ej. "CONSEJO 2") — opcional
  big?: boolean; // tamaño del cierre
}> = ({ headline, kicker, big = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 150 }, durationInFrames: 18 });
  const y = interpolate(enter, [0, 1], [26, 0]);
  const scale = interpolate(enter, [0, 1], [0.94, 1]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 372,
          left: 70,
          right: 70,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          opacity: enter,
          transform: `translateY(${y}px) scale(${scale})`,
          transformOrigin: "center top",
        }}
      >
        {kicker && (
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: "0.22em",
              color: COLORS.copper,
              textTransform: "uppercase",
              textShadow: "0 2px 10px rgba(0,0,0,0.6)",
            }}
          >
            {kicker}
          </div>
        )}
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: big ? 78 : 66,
            lineHeight: 1.05,
            color: COLORS.white,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            textAlign: "center",
            textShadow: "0 3px 10px rgba(0,0,0,0.72), 0 10px 40px rgba(0,0,0,0.5)",
          }}
        >
          {headline}
        </div>
        {/* subrayado cobre que "crece" al entrar */}
        <div
          style={{
            width: interpolate(enter, [0, 1], [0, big ? 300 : 230]),
            height: 7,
            borderRadius: 4,
            background: COLORS.copper,
            boxShadow: "0 0 14px rgba(223,190,154,0.6)",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
