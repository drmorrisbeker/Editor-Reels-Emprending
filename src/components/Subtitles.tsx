import { useState, useEffect, useCallback } from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  useDelayRender,
} from "remotion";
import type { Caption } from "@remotion/captions";

const MAX_WORDS_PER_PAGE = 3;

type Word = { text: string; fromMs: number; toMs: number };
type Page = { startMs: number; endMs: number; words: Word[] };

// Whisper emits sub-word tokens: tokens without a leading space are
// continuations of the previous word. Merge them into complete words first.
function mergeIntoWords(captions: Caption[]): Word[] {
  const words: Word[] = [];
  for (const cap of captions) {
    const isContinuation = !cap.text.startsWith(" ");
    if (isContinuation) {
      if (words.length === 0) {
        // First token has no space (Whisper mid-word cut at start of file) — treat as new word
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

// Force a new subtitle page after sentence-ending punctuation, before ¿/¡,
// or when the next word starts with uppercase (Whisper capitalizes sentence-initial words).
function isSentenceBoundary(prev: Word, next: Word): boolean {
  return (
    /[.!?…]$/.test(prev.text.trim()) ||
    /^[¿¡]/.test(next.text.trim()) ||
    /^[A-ZÁÉÍÓÚÜÑ]/.test(next.text.trim())
  );
}

// Gap between consecutive words longer than this → force a new subtitle page
const GAP_THRESHOLD_MS = 380;

// Tamaño fijo de subtítulo y ancho máximo de UNA línea. Las páginas se cortan
// también por ancho: si la próxima palabra no entra en la línea a 74px, arranca
// una página nueva. Así nunca hay doble línea ni texto achicado.
const FONT_SIZE = 74;
const CHAR_W = 46; // ancho aprox por caracter a 74px Poppins 800 (sobreestimado a propósito)
const WORD_GAP = 14;
const MAX_LINE_PX = 860;
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

// Palabras clave que se enfatizan en cobre de marca (#DFBE9A). Pocas, atadas a
// los momentos de zoom/click. Sutil — no saturar.
const EMPHASIS_MS = [4660, 13670, 28140, 59410, 89070];
const isEmphasis = (w: Word) => EMPHASIS_MS.some((m) => Math.abs(w.fromMs - m) <= 90);

const SubtitlePage: React.FC<{ page: Page }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Lead: el spring tarda ~3-4 frames en hacerse visible. Adelantamos la
  // aparición ~90ms para que la palabra esté visible justo cuando el Dr. la dice.
  const LEAD_MS = 90;

  // Tamaño fijo + una sola línea garantizada (las páginas ya se cortaron por
  // ancho en buildPages). nowrap evita cualquier envoltura.
  return (
    <div
      style={{
        display: "inline-flex",
        flexWrap: "nowrap",
        justifyContent: "center",
        gap: `0 ${WORD_GAP}px`,
        padding: "0 12px",
        whiteSpace: "nowrap",
      }}
    >
      {page.words.map((word, i) => {
        // Cada palabra se revela cuando el Dr. la dice: aparición palabra por palabra.
        const wordStartFrame = Math.round(((word.fromMs - LEAD_MS - page.startMs) / 1000) * fps);
        const enter = spring({
          frame: Math.max(0, frame - wordStartFrame),
          fps,
          config: { damping: 20, stiffness: 340 },
        });
        const opacity = interpolate(enter, [0, 0.55], [0, 1], { extrapolateRight: "clamp" });
        const y = interpolate(enter, [0, 1], [12, 0]);
        const scale = interpolate(enter, [0, 1], [0.95, 1]);
        return (
          <span
            key={i}
            style={{
              fontSize: 74,
              fontWeight: 800,
              fontFamily: "Poppins, sans-serif",
              color: isEmphasis(word) ? "#DFBE9A" : "#FFFFFF",
              letterSpacing: "-0.01em",
              textShadow:
                "0 4px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.45)",
              opacity,
              transform: `translateY(${y}px) scale(${scale})`,
              display: "inline-block",
              lineHeight: 1.2,
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};

export const Subtitles: React.FC<{ captionsSrc: string }> = ({ captionsSrc }) => {
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
    // Puntuación de cierre suelta (.,;:!?…): si Whisper la emite como token
    // aparte SIN espacio inicial, es continuación → se fusiona en la palabra
    // previa y cierra el signo (ej "?" → "hago?"). Si está suelta (con espacio),
    // descartarla. Los signos de apertura ¿¡ NO entran acá: inician palabra.
    if (/^[.,;:!?…]+$/.test(t)) return !c.text.startsWith(" ");
    if (c.confidence === null || c.confidence <= 0.15) return false;
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
        const durationInFrames = Math.max(
          1,
          Math.round(((endMs - page.startMs) / 1000) * fps),
        );

        return (
          <Sequence key={i} from={startFrame} durationInFrames={durationInFrames}>
            <AbsoluteFill
              style={{
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: 640,
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
