// ─────────────────────────────────────────────────────────────────────────────
// Marcas (plantillas) del reel — Morris Beker vs Club de Terapia.
// Difieren en tipografía de portada, color de acento, portada y cartel de gancho.
// Los SUBTÍTULOS son iguales en ambas: Inter, renglón junto, todo blanco.
// La skill pregunta la marca al arranque y setea `brand` en Root.tsx.
// ─────────────────────────────────────────────────────────────────────────────

export type BrandId = "beker" | "clubdeterapia" | "foropsiquiatria";

export interface Brand {
  id: BrandId;
  navy: string; // color base del VELO de la portada (detrás del texto)
  accent: string; // énfasis de marca
  subtitleFont: string; // subtítulos + hook — Inter en todas
  portadaTitleFont: string; // línea principal (blanca) de la portada
  portadaHighlight: string; // línea de gancho de la portada (color)
  hookBg: string; // fondo del cartel ThumbnailCover
  hookFg: string; // texto del cartel ThumbnailCover
  logoText?: string; // logo de TEXTO horneado en la portada (arriba a la derecha)
  logoFont?: string; // tipografía del logo de texto
  logoColor?: string;
  logoImgSrc?: string; // logo de IMAGEN (staticFile, ej "logos/foropsiquiatria.png") — pisa al de texto
  logoImgWidth?: number; // ancho del logo-imagen en px (default 200)
  palette?: Record<string, string>; // paleta institucional completa (referencia; el reel no usa todos)
}

export const BRANDS: Record<BrandId, Brand> = {
  // Dr. Morris Beker — navy + cobre-soft. Portada Montserrat 900.
  beker: {
    id: "beker",
    navy: "#0F2135",
    accent: "#DFBE9A",
    subtitleFont: "Inter, sans-serif",
    portadaTitleFont: "Inter, sans-serif",
    portadaHighlight: "#DFBE9A",
    hookBg: "#0F2135",
    hookFg: "#FFFFFF",
  },
  // Club de Terapia — navy + cobre #A78768, portada Geist Black con línea
  // destacada en crema y logo "club de terapia" en Instrument Serif.
  clubdeterapia: {
    id: "clubdeterapia",
    navy: "#0F2135",
    accent: "#A78768",
    subtitleFont: "Inter, sans-serif",
    portadaTitleFont: "Geist, Inter, sans-serif",
    portadaHighlight: "#FCF0EA",
    hookBg: "#FFFFFF",
    hookFg: "#0F2135",
    logoText: "club de terapia",
    logoFont: "'Instrument Serif', serif",
    logoColor: "#FCF0EA",
  },
  // Foropsiquiatría — institucional azul + amarillo. Velo de portada en navy profundo
  // (#070C53) para contraste; gancho de portada en amarillo institucional; cartel de
  // gancho en azul institucional. Portada y subtítulos en Inter. Sin logo horneado
  // por ahora (agregar el wordmark oficial cuando esté).
  foropsiquiatria: {
    id: "foropsiquiatria",
    navy: "#070C53", // velo de portada (profundidad)
    accent: "#EFA501", // amarillo institucional
    subtitleFont: "Inter, sans-serif",
    portadaTitleFont: "Inter, sans-serif",
    portadaHighlight: "#EFA501",
    hookBg: "#0A127F", // azul institucional
    hookFg: "#FFFFFF",
    logoImgSrc: "logos/foropsiquiatria.png", // sello circular (dejar el PNG en public/logos/)
    logoImgWidth: 210,
    palette: {
      azul: "#0A127F",
      amarillo: "#EFA501",
      navy: "#070C53",
      marfil: "#F7F4EE",
      mist: "#E7E7F2",
      softGold: "#FDF2D9",
      blanco: "#FFFFFF",
      hover: "#0C1699",
      press: "#080F66",
    },
  },
};

export const getBrand = (id: BrandId): Brand => BRANDS[id] ?? BRANDS.beker;
