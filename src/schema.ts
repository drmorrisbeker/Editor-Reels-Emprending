import { z } from "zod";

// ── Overlay types ─────────────────────────────────────────────────────────────

export const ConceptOverlaySchema = z.object({
  type: z.literal("concept"),
  startMs: z.number(),
  endMs: z.number(),
  lines: z.array(z.string()),
});

export const EmphasisOverlaySchema = z.object({
  type: z.literal("emphasis"),
  startMs: z.number(),
  endMs: z.number(),
  keyword: z.string(),
  subtext: z.string().optional().default(""),
});

export const ListOverlaySchema = z.object({
  type: z.literal("list"),
  startMs: z.number(),
  endMs: z.number(),
  items: z.array(z.string()),
});

export const OverlaySchema = z.discriminatedUnion("type", [
  ConceptOverlaySchema,
  EmphasisOverlaySchema,
  ListOverlaySchema,
]);

// ── Title card types ──────────────────────────────────────────────────────────

export const TitleCardNumberedSchema = z.object({
  type: z.literal("numbered"),
  number: z.string(),
  line1: z.string(),
  line2: z.string().optional().default(""),
  line3: z.string().optional().default(""),
});

export const TitleCardStatementSchema = z.object({
  type: z.literal("statement"),
  lines: z.array(
    z.object({
      text: z.string(),
      yellow: z.boolean().default(false),
    }),
  ),
});

export const TitleCardSchema = z.discriminatedUnion("type", [
  TitleCardNumberedSchema,
  TitleCardStatementSchema,
]);

// ── Root props schema ─────────────────────────────────────────────────────────

export const ReelPropsSchema = z.object({
  videoSrc: z.string(),
  captionsSrc: z.string(),
  bgMusicSrc: z.string().default(""),
  hookText: z.string(),
  titleCard: TitleCardSchema.optional(),
  titleCardDurationMs: z.number(),
  overlays: z.array(OverlaySchema).default([]),
  durationSeconds: z.number(),
  portadaBgMs: z.number().optional(),
  portadaTitulo: z.string().default("TÍTULO"),
  portadaLinea2: z.string().default(""),
});

export type ReelProps = z.infer<typeof ReelPropsSchema>;
export type Overlay = z.infer<typeof OverlaySchema>;
export type TitleCard = z.infer<typeof TitleCardSchema>;
