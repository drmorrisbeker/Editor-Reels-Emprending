import { z } from "zod";

// ── Props del reel-REACCIÓN ─────────────────────────────────────────────────
// Estructura de BLOQUES FIJOS:
//   1) bloque split  (frames 0 .. splitBlockSeconds): arriba 40% YO reaccionando,
//      abajo 60% el video al que reacciono (prioridad al video reaccionado).
//   2) bloque opinión (resto): YO a pantalla completa dando mi opinión.
// Audio: en el split se escucha el video reaccionado (bajo, `sourceVolume`) + mi voz;
// en la opinión, solo mi voz. Se subtitula mi voz (captions ya unidos con offset).
export const ReactionPropsSchema = z.object({
  // Marca / plantilla (ver src/brand.ts y .claude/rules/plantillas.md).
  brand: z.enum(["beker", "clubdeterapia", "foropsiquiatria"]).default("beker"),

  // Bloque split
  reactVideoSrc: z.string(), // YO reaccionando (arriba, 40%) — ya sin silencios
  sourceVideoSrc: z.string(), // video al que reacciono (abajo, 60%)
  sourceVolume: z.number().default(0.5), // volumen del video reaccionado en el split
  splitBlockSeconds: z.number(), // duración del bloque split (= duración de reactVideoSrc editado)

  // Bloque opinión
  opinionVideoSrc: z.string(), // YO a pantalla completa (opinión) — ya sin silencios

  // Comunes (igual que reel-yapping)
  captionsSrc: z.string(), // captions unidos (react + opinión con offset)
  bgMusicSrc: z.string().default(""),
  hookText: z.string(),
  titleCardDurationMs: z.number(),
  portadaBgMs: z.number().optional(), // frame del clip de opinión para el fondo de portada
  durationSeconds: z.number(), // splitBlockSeconds + duración del clip de opinión
});

export type ReactionProps = z.infer<typeof ReactionPropsSchema>;
