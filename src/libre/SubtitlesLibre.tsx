import { useState, useEffect, useCallback } from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useVideoConfig,
  useDelayRender,
  useCurrentFrame,
  interpolate,
} from "remotion";
import type { Caption } from "@remotion/captions";
import { COLORS, FONT } from "./theme";

// ─────────────────────────────────────────────────────────────────────────────
// Subtítulos libre: renglón entero de una (modo "page"), TODO BLANCO (sin highlight),
// dentro de una píldora oscura sutil para legibilidad. Lógica de armado de páginas
// portada de la plantilla (merge de subtokens de Whisper + corte por ancho/gap/frase).
// Los tokens con confidence 0 (los números "Uno/Dos/tres") se descartan: el número lo
// muestran los chips 1·2·3, no el subtítulo.
// ─────────────────────────────────────────────────────────────────────────────

const MAX_WORDS_PER_PAGE = 3;
const FONT_SIZE = 70;
const CHAR_W = 44;
const WORD_GAP = 14;
const MAX_LINE_PX = 800; // más angosto que la plantilla: deja libre la columna de botones
const GAP_THRESHOLD_MS = 380;

type Word = { text: string; fromMs: number; toMs: number };
type Page = { startMs: number; endMs: number; words: Word[] };

function mergeIntoWords(captions: Caption[]): Word[] {
  const words: Word[] = [];
  for (const cap of captions) {
    const isContinuation = !cap.text.startsWith(" ");
    if (isContinuation) {
      if (words.length === 0) {
        words.push({ text: cap.text.trimStart(), fromMs: cap.startMs, toMs: cap.endMs });
      } else {
        const prev = words[words.length - 1];
        prev.text += cap.text;
        prev.toMs = cap.endMs;
      }
    } else {
      words.push({ text: cap.text, fromMs: cap.startMs, toMs: cap.endMs });
    }
  }
  return words.map((w) => ({ ...w, text: w.text.trimStart() }));
}

function isSentenceBoundary(prev: Word, next: Word): boolean {
  return (
    /[.!?…]$/.test(prev.text.trim()) ||
    /^[¿¡]/.test(next.text.trim()) ||
    /^[A-ZÁÉÍÓÚÜÑ]/.test(next.text.trim())
  );
}

const wordPx = (w: Word) => w.text.length * CHAR_W;

function buildPages(words: Word[]): Page[] {
  const pages: Page[] = [];
  let bucket: Word[] = [];
  let lineW = 0;

  const flush = () => {
    if (!bucket.length) return;
    pages.push({ startMs: bucket[0].fromMs, endMs: bucket[bucket.length - 1].toMs, words: bucket });
    bucket = [];
    lineW = 0;
  };

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const w = wordPx(word);
    if (bucket.length > 0) {
      const gap = word.fromMs - bucket[bucket.length - 1].toMs;
      const boundary = isSentenceBoundary(bucket[bucket.length - 1], word);
      const wouldExceed = lineW + WORD_GAP + w > MAX_LINE_PX;
      if (gap > GAP_THRESHOLD_MS || bucket.length >= MAX_WORDS_PER_PAGE || boundary || wouldExceed) {
        flush();
      }
    }
    lineW = bucket.length > 0 ? lineW + WORD_GAP + w : w;
    bucket.push(word);
  }
  flush();
  return pages;
}

const SubtitlePage: React.FC<{ page: Page }> = ({ page }) => {
  const frame = useCurrentFrame();
  // Entrada muy sutil del renglón: fade + leve subida (6 frames).
  const appear = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(appear, [0, 1], [14, 0]);

  return (
    <div
      style={{
        display: "inline-flex",
        flexWrap: "nowrap",
        justifyContent: "center",
        alignItems: "center",
        gap: `0 ${WORD_GAP}px`,
        whiteSpace: "nowrap",
        padding: "16px 30px",
        borderRadius: 26,
        background: "rgba(10,24,38,0.52)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 34px rgba(0,0,0,0.35)",
        opacity: appear,
        transform: `translateY(${y}px)`,
      }}
    >
      {page.words.map((word, i) => (
        <span
          key={i}
          style={{
            fontSize: FONT_SIZE,
            fontWeight: 800,
            fontFamily: FONT,
            color: COLORS.white,
            letterSpacing: "-0.01em",
            textShadow: "0 3px 14px rgba(0,0,0,0.5)",
            display: "inline-block",
            lineHeight: 1.15,
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
};

export const SubtitlesLibre: React.FC<{ captionsSrc: string }> = ({ captionsSrc }) => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();

  const fetchCaptions = useCallback(async () => {
    try {
      const res = await fetch(staticFile(captionsSrc));
      const data: Caption[] = await res.json();
      setCaptions(data);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [captionsSrc, continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  if (!captions) return null;

  const clean = captions.filter((c) => {
    const t = c.text.trim();
    if (t.length === 0) return false;
    if (/^\[.*\]$/.test(t)) return false;
    if (/^[.,;:!?…]+$/.test(t)) return !c.text.startsWith(" ");
    if (c.confidence === null || c.confidence <= 0.15) return false; // descarta "Uno/Dos/tres"
    if (c.endMs <= c.startMs) return false;
    return true;
  });

  const words = mergeIntoWords(clean);
  const pages = buildPages(words);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pages.map((page, i) => {
        const nextPage = pages[i + 1] ?? null;
        const endMs = nextPage ? nextPage.startMs : page.endMs + 400;
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endFrame = Math.round((endMs / 1000) * fps);
        const durationInFrames = Math.max(1, endFrame - startFrame);

        return (
          <Sequence key={i} from={startFrame} durationInFrames={durationInFrames}>
            <AbsoluteFill
              style={{
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: 640, // zona segura TikTok/Reels: el bloque termina y≈1280
              }}
            >
              <SubtitlePage page={page} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
