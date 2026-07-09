import { AbsoluteFill, Img, staticFile } from "remotion";

// Portada — aparece solo en frames 0-1 (~67ms, invisible al viewer).
// Instagram y TikTok capturan el primer frame como thumbnail del feed.
// Safe zone feed: top 1350px de 1920px (ratio 4:5).
// Texto posicionado al 45-68% de altura = 864-1305px (centrado en la zona visible del feed).
export const Portada: React.FC<{ titulo?: string; linea2?: string; bgSrc?: string; accent?: string }> = ({
  titulo = "ANTIDEPRESIVOS",
  linea2 = "Y SEXO.",
  bgSrc,
  accent = "#DFBE9A",
}) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {bgSrc && (
        <Img
          src={staticFile(bgSrc)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}

      {/* Texto — posicionado al 45% de altura, dentro del safe zone */}
      <div
        style={{
          position: "absolute",
          top: "45%",
          left: 44,
          right: 44,
        }}
      >
        {/* Sombreado del párrafo: blur de fondo (blob oscuro y suave, NO una caja),
            DETRÁS del texto (zIndex 0; el texto va con zIndex 1). Muy sutil. */}
        <div
          style={{
            position: "absolute",
            inset: "-60px -36px",
            background:
              "radial-gradient(closest-side, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.20) 55%, rgba(0,0,0,0) 100%)",
            filter: "blur(32px)",
            zIndex: 0,
          }}
        />

        {/* Línea superior: blanco, peso heavy */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: "Montserrat, Inter, sans-serif",
            fontWeight: 900,
            fontSize: 100,
            color: "#FFFFFF",
            WebkitTextStroke: "2px rgba(0,0,0,0.35)",
            paintOrder: "stroke fill",
            lineHeight: 1.1,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            whiteSpace: "pre-line",
            textShadow: "0 3px 16px rgba(0,0,0,0.35)",
          }}
        >
          {titulo}
        </div>

        {/* Línea de gancho — cobre/accent de marca */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: "Montserrat, Inter, sans-serif",
            fontWeight: 900,
            fontSize: 118,
            color: accent,
            WebkitTextStroke: "2px rgba(0,0,0,0.35)",
            paintOrder: "stroke fill",
            lineHeight: 1.0,
            textTransform: "uppercase",
            letterSpacing: "-0.03em",
            marginTop: 4,
            textShadow: "0 3px 16px rgba(0,0,0,0.35)",
          }}
        >
          {linea2}
        </div>
      </div>
    </AbsoluteFill>
  );
};
