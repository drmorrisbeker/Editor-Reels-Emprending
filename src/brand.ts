// ─────────────────────────────────────────────────────────────────────────────
// Marca del reel. Cada marca es una carpeta `marcas/<id>/` con:
//   marca.json        ← colores, tipografías, logo, tipo de portada (ver marcas/README.md)
//   logo.png          ← opcional (o el nombre que diga `logoImg`)
//   fuentes/*.ttf     ← opcional, tipografías propias (`localFonts`)
//   Portada.tsx       ← opcional, portada propia (`"portada": "propia"`)
// La plantilla las encuentra sola (require.context, en tiempo de bundle): no hay que
// registrar nada en el código. El prop `brand` de cada composición es el <id> (nombre de la
// carpeta). Si la carpeta no existe, se usa DEFAULT_BRAND.
// ─────────────────────────────────────────────────────────────────────────────

export type PortadaTipo = "default" | "propia" | "ninguna";

export interface LocalFont {
  family: string; // nombre con el que se usa en fontFamily
  file: string; // ruta dentro de la carpeta de la marca, ej "fuentes/MiFuente-Black.ttf"
  weight?: string; // "400", "900", "100 900" (variable)…
  style?: string; // "normal" | "italic"
}

/** Lo que se escribe en marcas/<id>/marca.json. Todo es opcional: lo que falta sale del default. */
export interface BrandFile {
  nombre?: string;
  navy?: string; // color del VELO de la portada (detrás del texto)
  accent?: string; // color de acento de la marca
  subtitleFont?: string; // subtítulos + cartel de gancho
  portadaTitleFont?: string; // título de la portada
  portadaHighlight?: string; // segunda línea (destacada) de la portada
  hookBg?: string; // fondo del cartel de gancho
  hookFg?: string; // texto del cartel de gancho
  logoText?: string; // logo de TEXTO en la portada (arriba a la derecha)
  logoFont?: string;
  logoColor?: string;
  logoImg?: string; // logo de IMAGEN, archivo dentro de la carpeta de la marca (pisa al de texto)
  logoImgWidth?: number; // ancho del logo en px (default 200)
  googleFonts?: string[]; // familias de Google Fonts en formato css2, ej "Montserrat:wght@700;900"
  localFonts?: LocalFont[];
  portada?: PortadaTipo; // default (la de la plantilla) · propia (marcas/<id>/Portada.tsx) · ninguna
  palette?: Record<string, string>; // paleta completa, solo referencia
}

/** Marca ya resuelta, lista para los componentes. */
export interface Brand extends Required<Pick<BrandFile,
  "nombre" | "navy" | "accent" | "subtitleFont" | "portadaTitleFont" | "portadaHighlight" | "hookBg" | "hookFg" | "portada"
>> {
  id: string;
  logoText?: string;
  logoFont?: string;
  logoColor?: string;
  logoImgUrl?: string; // URL ya resuelta del logo
  logoImgWidth?: number;
  googleFonts: string[];
  localFonts: { family: string; url: string; weight?: string; style?: string }[];
  palette?: Record<string, string>;
}

// Marca por defecto: neutra, alto contraste, Inter (ya cargada en index.css).
export const DEFAULT_BRAND: Brand = {
  id: "default",
  nombre: "Por defecto",
  navy: "#14161C",
  accent: "#FFC857",
  subtitleFont: "Inter, sans-serif",
  portadaTitleFont: "Inter, sans-serif",
  portadaHighlight: "#FFC857",
  hookBg: "#FFFFFF",
  hookFg: "#14161C",
  portada: "default",
  googleFonts: [],
  localFonts: [],
};
