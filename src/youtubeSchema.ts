import { z } from "zod";

export const KeyPhraseSchema = z.object({
  startMs: z.number(),
  endMs: z.number(),
  text: z.string(),
  position: z.enum(["bottom-left", "bottom-right", "top-right"]).default("bottom-right"),
});

export const ConceptCardYTSchema = z.object({
  startMs: z.number(),
  numero: z.string(),
  title: z.string(),
  subtitle: z.string().default(""),
});

export const AnimatedStatSchema = z.object({
  startMs: z.number(),
  value: z.string(),        // e.g. "40%" or "1 de cada 3"
  label: z.string(),        // e.g. "personas con ansiedad crónica"
  source: z.string().default(""),
});

export const ZoomPhraseYTSchema = z.object({
  startMs: z.number(),
  endMs: z.number(),
  scale: z.number().default(1.05),
});

export const ChapterSchema = z.object({
  title: z.string(),
});

export const YouTubeVideoPropsSchema = z.object({
  videoSrc: z.string(),
  bgMusicSrc: z.string().default(""),
  // Lower third
  credentialStartMs: z.number().default(35000),
  credentialDurationMs: z.number().default(4500),
  // Chapter index ("hoy vamos a ver")
  indexStartMs: z.number().default(0),
  chapters: z.array(ChapterSchema).default([]),
  // Key phrases on screen
  keyPhrases: z.array(KeyPhraseSchema).default([]),
  // Section cards (Parte 1, 2, 3)
  conceptCards: z.array(ConceptCardYTSchema).default([]),
  // Animated stats/data
  stats: z.array(AnimatedStatSchema).default([]),
  // Camera zoom (post)
  zoomPhrases: z.array(ZoomPhraseYTSchema).default([]),
  // CTA at end
  ctaStartMs: z.number().default(0),
  ctaText: z.string().default("¿Qué te generó este tema? Comentalo abajo"),
  durationSeconds: z.number(),
});

export type YouTubeVideoProps = z.infer<typeof YouTubeVideoPropsSchema>;
