// Freestyle — tokens de la dirección de arte (propios, no dependen de brand.ts).
// Paleta Beker llevada a un registro más editorial: navy base, cobre como ÚNICO
// acento, crema cálida y scrims navy (no negro puro) para seatear la UI.

export const C = {
  navy: "#0F2135",
  navyDeep: "#091425", // scrims / velos
  copper: "#DFBE9A", // único acento
  copperBright: "#EAD0B0",
  cream: "#F6EFE4",
  white: "#FFFFFF",
};

export const F = {
  display: "'Bricolage Grotesque', system-ui, sans-serif", // titulares, numerales, subtítulos
  ui: "'Instrument Sans', system-ui, sans-serif", // kicker, handle, micro-rótulos
};

export const FPS = 30;

// Cortes de sección (ms) tomados de los captions ya corregidos.
export const SECTIONS = {
  introStart: 0,
  tip1: 4440,
  tip2: 17630,
  tip3: 36620,
  cierre: 47140,
  end: 50566.665,
};

// Los 3 consejos: numeral + rótulo corto, fiel al audio, sin clichés.
export const CHAPTERS = [
  { n: 1, atMs: 4440, label: "Pedí ayuda a tiempo" },
  { n: 2, atMs: 17630, label: "Fijate quién lo dice" },
  { n: 3, atMs: 36620, label: "Pedir ayuda es valentía" },
];

export const msToFrame = (ms: number) => Math.round((ms / 1000) * FPS);
