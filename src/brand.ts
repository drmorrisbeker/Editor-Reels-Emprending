// ─────────────────────────────────────────────────────────────────────────────
// Marcas (plantillas) del reel — Morris Beker vs Club de Terapia.
// Difieren en tipografía de portada, color de acento, portada y cartel de gancho.
// Los SUBTÍTULOS son iguales en ambas: Inter, renglón junto, todo blanco.
// La skill pregunta la marca al arranque y setea `brand` en Root.tsx.
// ─────────────────────────────────────────────────────────────────────────────

export type BrandId = "beker" | "clubdeterapia";

export interface Brand {
  id: BrandId;
  navy: string; // color base de marca (velo de portada, cartel de gancho Beker)
  accent: string; // énfasis de marca
  subtitleFont: string; // subtítulos + hook — Inter en ambas
  portadaTitleFont: string; // línea principal (blanca) de la portada
  portadaHighlight: string; // línea de gancho de la portada (color)
  hookBg: string; // fondo del cartel ThumbnailCover
  hookFg: string; // texto del cartel ThumbnailCover
  logoText?: string; // logo horneado en la portada (solo CdT)
  logoFont?: string; // tipografía del logo (Instrument Serif)
  logoColor?: string;
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
};

export const getBrand = (id: BrandId): Brand => BRANDS[id] ?? BRANDS.beker;
