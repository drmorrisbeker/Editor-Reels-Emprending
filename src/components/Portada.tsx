import { AbsoluteFill, Img, staticFile } from "remotion";
import { BRANDS, type Brand, type BrandId } from "../brand";

// Portada — aparece solo en frames 0-1 (~67ms, invisible al viewer).
// Instagram y TikTok capturan el primer frame como thumbnail del feed.
//
// Estilo "blur" (estilo feed de podcast-clips): la cara del protagonista queda
// limpia arriba y el texto va al pie sobre un velo navy difuminado que sale del
// borde inferior. Sutil y transicional — se sigue viendo la foto detrás.
//
// La IDENTIDAD la define la marca (`brand`):
//   · beker        → título Montserrat 900, gancho cobre-soft #DFBE9A.
//   · clubdeterapia → título Geist Black, gancho crema #FCF0EA, logo
//                     "club de terapia" (Instrument Serif) arriba a la derecha.
//
// ZONAS SEGURAS (1080×1920): el bloque de texto termina en y=1490 (arriba de la
// UI inferior de IG/TikTok) y nada pisa la columna de botones de la derecha.

const SAFE_BOTTOM = 430; // px libres abajo (UI de IG/TikTok)

const renderLines = (text: string, style: React.CSSProperties) =>
  text.split("\n").map((line, i) => (
    <span key={i} style={style}>
      {line}
    </span>
  ));

export const Portada: React.FC<{
  titulo?: string;
  linea2?: string;
  bgSrc?: string;
  brand?: BrandId | Brand;
}> = ({ titulo = "TÍTULO", linea2 = "GANCHO?", bgSrc, brand = "beker" }) => {
  const b: Brand = typeof brand === "string" ? BRANDS[brand] ?? BRANDS.beker : brand;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {bgSrc && <Img src={staticFile(bgSrc)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}

      {/* Logo de marca horneado (solo Club de Terapia) — arriba a la derecha */}
      {b.logoText && (
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 56,
            fontFamily: b.logoFont,
            fontStyle: "italic",
            fontSize: 52,
            color: b.logoColor ?? "#FFFFFF",
            letterSpacing: "0.01em",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
          }}
        >
          {b.logoText}
        </div>
      )}

      {/* Velo navy difuminado: desenfoca lo que hay detrás y lo tiñe con el navy de
          marca. SUTIL y TRANSICIONAL — el mask con alfas intermedios disuelve el
          desenfoque de a poco hacia arriba en vez de cortar con una línea. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "58%",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          background:
            "linear-gradient(to top, rgba(15,33,53,0.62) 0%, rgba(15,33,53,0.50) 30%, rgba(15,33,53,0.28) 60%, rgba(15,33,53,0.10) 82%, rgba(15,33,53,0) 100%)",
          maskImage:
            "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,0.72) 46%, rgba(0,0,0,0.34) 72%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,0.72) 46%, rgba(0,0,0,0.34) 72%, rgba(0,0,0,0) 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 60,
          right: 60,
          bottom: SAFE_BOTTOM,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 6,
        }}
      >
        {renderLines(titulo, {
          fontFamily: b.portadaTitleFont,
          fontWeight: 900,
          fontSize: 92,
          color: "#FFFFFF",
          textTransform: "uppercase",
          letterSpacing: "-0.025em",
          lineHeight: 1.05,
          // Con el velo suave, la legibilidad la sostiene la sombra: una pegada al
          // glifo (define el borde) + una amplia (despega el texto del fondo).
          textShadow: "0 2px 6px rgba(0,0,0,0.75), 0 8px 34px rgba(0,0,0,0.55)",
        })}
        {linea2 &&
          renderLines(linea2, {
            fontFamily: b.portadaTitleFont,
            fontWeight: 900,
            fontSize: 100,
            color: b.portadaHighlight,
            textTransform: "uppercase",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            textShadow: "0 2px 6px rgba(0,0,0,0.75), 0 8px 34px rgba(0,0,0,0.55)",
          })}
      </div>
    </AbsoluteFill>
  );
};
