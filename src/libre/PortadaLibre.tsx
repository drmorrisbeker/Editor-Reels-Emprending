import { AbsoluteFill } from "remotion";
import { COLORS, FONT } from "./theme";

// ─────────────────────────────────────────────────────────────────────────────
// Portada libre — overlay de texto para el frame 0 (thumbnail del feed). El fondo
// (frame presentable ≈21,75 s, ojos abiertos sonriendo) lo pone un <Video> still
// debajo, en ReelLibre. Velo navy difuminado abajo + titular. Cobre en la 2da línea.
// ZONA SEGURA: el bloque de texto termina ~y1500, arriba de la UI de IG/TikTok.
// ─────────────────────────────────────────────────────────────────────────────

export const PortadaLibre: React.FC = () => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* velo navy difuminado desde el borde inferior */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "60%",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          background:
            "linear-gradient(to top, rgba(15,33,53,0.78) 0%, rgba(15,33,53,0.6) 28%, rgba(15,33,53,0.3) 60%, rgba(15,33,53,0.08) 84%, rgba(15,33,53,0) 100%)",
          maskImage:
            "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 22%, rgba(0,0,0,0.7) 48%, rgba(0,0,0,0.32) 74%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 22%, rgba(0,0,0,0.7) 48%, rgba(0,0,0,0.32) 74%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: "0.26em",
            color: COLORS.copper,
            textTransform: "uppercase",
            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
            marginBottom: 8,
          }}
        >
          Día de la Salud Mental
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 118,
            lineHeight: 1.02,
            color: COLORS.white,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
            textShadow: "0 3px 8px rgba(0,0,0,0.75), 0 10px 40px rgba(0,0,0,0.55)",
          }}
        >
          3 consejos
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 72,
            lineHeight: 1.02,
            color: COLORS.copper,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            textShadow: "0 3px 8px rgba(0,0,0,0.75), 0 10px 40px rgba(0,0,0,0.55)",
          }}
        >
          para tu salud mental
        </div>
      </div>
    </AbsoluteFill>
  );
};
