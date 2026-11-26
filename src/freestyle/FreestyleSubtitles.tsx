// FreestyleSubtitles — subtítulos con realce de palabra activa (karaoke), estilo 2026.
// Lógica de armado de páginas COPIADA y adaptada de src/components/Subtitles.tsx
// (no lo importa para no modificar el original). Diferencias de dirección:
//   · base: todas las palabras BLANCAS (lo que el cliente ya prefería).
//   · palabra que suena AHORA: píldora cobre con texto navy + micro-pop (spring).
//     Realce legible y contemporáneo que sostiene la atención sin "karaoke chillón".
//   · los numerales hablados ("Uno/Dos/Y tres", confidence 0) se descartan solos
//     (filtro conf<=0.15): los reemplaza el numeral grande en pantalla.
import { useState, useEffect, useCallback } from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useVideoConfig,
  useCurrentFrame,
  useDelayRender,
  spring,
} from "remotion";
import type { Caption } from "@remotion/captions";
import { C, F } from "./theme";

const MAX_WORDS_PER_PAGE = 3;

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

const GAP_THRESHOLD_MS = 380;
const FONT_SIZE = 76;
const CHAR_W = 44; // ancho aprox por caracter (sobreestimado) para cortar por ancho
const WORD_GAP = 16;
const MAX_LINE_PX = 900;
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

const SubtitlePage: React.FC<{ page: Page; startFrame: number }> = ({ page, startFrame }) => {
  const { fps } = useVideoConfig();
  const localFrame = useCurrentFrame();
  const absMs = ((localFrame + startFrame) / fps) * 1000;

  // Índice de la palabra que suena ahora (la última cuyo inicio ya pasó).
  let activeIdx = -1;
  for (let i = 0; i < page.words.length; i++) {
    if (absMs >= page.words[i].fromMs) activeIdx = i;
  }

  // Micro-pop de la píldora al entrar la palabra activa.
  const activeWord = page.words[activeIdx];
  const popFrames = activeWord ? (absMs - activeWord.fromMs) / 1000 * fps : 0;
  const pop = activeWord
    ? spring({ frame: Math.max(0, popFrames), fps, config: { damping: 18, mass: 0.5 }, durationInFrames: 9 })
    : 0;

  return (
    <div
      style={{
        display: "inline-flex",
        flexWrap: "nowrap",
        justifyContent: "center",
        alignItems: "center",
        gap: `0 ${WORD_GAP}px`,
        padding: "0 12px",
        whiteSpace: "nowrap",
      }}
    >
      {page.words.map((word, i) => {
        const isActive = i === activeIdx;
        const scale = isActive ? 1 + 0.06 * pop : 1;
        return (
          <span
            key={i}
            style={{
              position: "relative",
              fontSize: FONT_SIZE,
              fontWeight: 800,
              fontFamily: F.display,
              letterSpacing: "-0.015em",
              lineHeight: 1.08,
              padding: "6px 14px",
              borderRadius: 16,
              display: "inline-block",
              transform: `scale(${scale})`,
              color: isActive ? C.navy : C.white,
              background: isActive ? C.copper : "transparent",
              boxShadow: isActive
                ? "0 10px 26px rgba(223,190,154,0.28), 0 3px 8px rgba(0,0,0,0.3)"
                : "none",
              textShadow: isActive ? "none" : "0 4px 20px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {word.text}
          </span>
        );
      })}
    </div>
  );
};

export const FreestyleSubtitles: React.FC<{ captionsSrc: string }> = ({ captionsSrc }) => {
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
    if (c.confidence === null || c.confidence <= 0.15) return false; // descarta "Uno/Dos/Y tres"
    if (c.endMs <= c.startMs) return false;
    return true;
  });

  const words = mergeIntoWords(clean);
  const pages = buildPages(words);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pages.map((page, i) => {
        const nextPage = pages[i + 1] ?? null;
        const endMs = nextPage ? nextPage.startMs : page.endMs + 420;
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endFrame = Math.round((endMs / 1000) * fps);
        const durationInFrames = Math.max(1, endFrame - startFrame);

        return (
          <Sequence key={i} from={startFrame} durationInFrames={durationInFrames}>
            <AbsoluteFill
              style={{
                justifyContent: "flex-end",
                alignItems: "center",
                paddingBottom: 600,
              }}
            >
              <SubtitlePage page={page} startFrame={startFrame} />
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
