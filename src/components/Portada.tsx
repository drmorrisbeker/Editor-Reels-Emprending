import { AbsoluteFill, Img, staticFile } from "remotion";

// Portada — aparece solo en frames 0-1 (~67ms, invisible al viewer).
// Instagram y TikTok capturan el primer frame como thumbnail del feed.
//
// Layout "plantilla maestra" (portado de podcast-clips, SIN logo/mosca para Morris Beker):
//   · fondo = frame congelado del video (lo pone Reel.tsx con un <Sequence> propio detrás;
//     `bgSrc` queda soportado por si se quisiera hornear la foto acá, pero no se usa hoy).
//   · degradé oscuro desde el borde inferior (~45% del cuadro) para legibilidad.
//   · bloque de texto ALINEADO A LA IZQUIERDA en el tercio inferior, TODO BLANCO:
//       - `titulo`  → línea CHICA de contexto (ej "LOS MEJORES TERAPEUTAS").
//       - `linea2`  → línea(s) GRANDE(s) de remate (ej "TAMBIÉN SUFREN"); admite salto
//         de línea con "\n" o " / " para dos líneas grandes.
//   · uppercase, peso pesado (Inter 800 la chica, 900 las grandes), leading apretado, sombra suave.
//
// ZONAS SEGURAS (1080×1920):
//   · margen izquierdo ≈ 76px · límite derecho ≈ 880px (notch de botones TikTok/Reels a esa altura).
//   · el bloque termina en y≈1340 → arriba de la UI inferior (bottom seguro 1534).

const SAFE_LEFT = 76;
const SAFE_RIGHT = 200; // 1080 - 200 = 880 (bajo el límite ~887 del notch de botones)
const SAFE_BOTTOM = 580; // bottom del bloque ≈ y=1340

// linea2 admite "\n" o " / " como marcador de salto → una línea grande por segmento.
const splitBig = (text: string) => text.split(/\s*\/\s*|\n/).filter((l) => l.length > 0);

export const Portada: React.FC<{
  titulo?: string;
  linea2?: string;
  bgSrc?: string;
  accent?: string;
}> = ({ titulo = "LOS MEJORES TERAPEUTAS", linea2 = "TAMBIÉN SUFREN", bgSrc }) => {
  const softShadow = "0 4px 20px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.60)";

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {bgSrc && (
        <Img src={staticFile(bgSrc)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}

      {/* Degradé oscuro desde abajo (~45% del cuadro) — legibilidad del texto */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "45%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.70) 26%, rgba(0,0,0,0.38) 58%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Bloque de texto: izquierda, tercio inferior, todo blanco */}
      <div
        style={{
          position: "absolute",
          left: SAFE_LEFT,
          right: SAFE_RIGHT,
          bottom: SAFE_BOTTOM,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        {/* Línea chica de contexto */}
        {titulo && (
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: 54,
              color: "#FFFFFF",
              textTransform: "uppercase",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              textShadow: softShadow,
              whiteSpace: "nowrap",
            }}
          >
            {titulo}
          </span>
        )}

        {/* Línea(s) grande(s) de remate */}
        {splitBig(linea2).map((line, i) => (
          <span
            key={i}
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 900,
              fontSize: 92,
              color: "#FFFFFF",
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
              lineHeight: 0.98,
              textShadow: softShadow,
              whiteSpace: "nowrap",
            }}
          >
            {line}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
