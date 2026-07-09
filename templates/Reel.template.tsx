// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLA EN BLANCO — Reel.tsx
// Copiar sobre src/Reel.tsx al empezar un video nuevo (lo hace scripts/new_project.sh).
// Conserva TODOS los mecanismos del diseño (zoom sostenido, portada-bg, gradiente,
// clicks, ThumbnailCover, subtítulos). Solo hay que completar los VALORES por-video
// marcados con  ← COMPLETAR.  No borrar los mecanismos.
// Reglas de estilo/animación: .claude/rules/base.md + .claude/rules/yapping.md
// ─────────────────────────────────────────────────────────────────────────────
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { ThumbnailCover } from "./components/ThumbnailCover";
import { Portada } from "./components/Portada";
import { Subtitles } from "./components/Subtitles";
// Escenas / rehook: importar SOLO las que se usen en este video (ver bloque comentado abajo).
// import { RehookScene } from "./components/RehookScene";
// import { NumeroConceptoScene } from "./components/scenes/NumeroConceptoScene";
import type { ReelProps } from "./schema";

const RAMP_MS = 200;
// Zoom sostenido: entra al inicio de la frase de impacto, se mantiene en el pico durante
// toda la frase, y se aleja recién cuando termina. endMs = fin real de la frase (sacarlo
// de los captions, no inventar ventanas de ~1s). 6–8 por video, escala 1.08–1.14, máximo
// al cierre. Ver .claude/rules/yapping.md.
const ZOOM_PHRASES: { startMs: number; endMs: number; scale: number }[] = [
  // { startMs: 0, endMs: 0, scale: 1.10 },   // ← COMPLETAR
];

// Clicks sutiles (sfx/click.mp3, vol 0.03) SOLO en los 4–5 momentos más contundentes
// (los mismos que los zooms de mayor impacto + cierre). Ver .claude/rules/yapping.md.
const PHRASE_SOUNDS: { ms: number }[] = [
  // { ms: 0 },   // ← COMPLETAR
];

const VideoWithZoom: React.FC<{ src: string }> = ({ src }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;

  const scale = ZOOM_PHRASES.reduce((max, p) => {
    const s = interpolate(
      ms,
      [p.startMs, p.startMs + RAMP_MS, p.endMs - RAMP_MS, p.endMs],
      [1, p.scale, p.scale, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return Math.max(max, s);
  }, 1);

  return (
    <Video
      src={staticFile(src)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
      volume={1.4}
    />
  );
};

const s = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

export const Reel: React.FC<ReelProps> = ({
  videoSrc,
  captionsSrc,
  bgMusicSrc,
  hookText,
  titleCardDurationMs,
  portadaBgMs,
}) => {
  const { fps } = useVideoConfig();
  const titleCardFrames = Math.round((titleCardDurationMs / 1000) * fps);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <VideoWithZoom src={videoSrc} />

      {/* Portada background: frame fijo del video */}
      {portadaBgMs !== undefined && (
        <Sequence from={0} durationInFrames={2}>
          <AbsoluteFill>
            <Video
              src={staticFile(videoSrc)}
              trimBefore={Math.round((portadaBgMs / 1000) * fps)}
              volume={0}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </AbsoluteFill>
        </Sequence>
      )}

      {bgMusicSrc && <Audio src={staticFile(bgMusicSrc)} volume={0.02} />}

      <AbsoluteFill
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 22%, rgba(0,0,0,0) 38%)",
          pointerEvents: "none",
        }}
      />

      {/* Clicks en frases clave */}
      {PHRASE_SOUNDS.map((p, i) => (
        <Sequence key={i} from={s(p.ms, fps)} durationInFrames={3}>
          <Audio src={staticFile("sfx/click.mp3")} volume={0.03} />
        </Sequence>
      ))}

      {/* Portada — frame 0-1 para thumbnail del feed */}
      <Sequence from={0} durationInFrames={2}>
        <Portada titulo={"TÍTULO"} linea2="GANCHO?" /> {/* ← COMPLETAR (título de portada) */}
      </Sequence>

      {/* ThumbnailCover — primeros ~2.5 segundos */}
      {hookText && titleCardFrames > 0 && (
        <Sequence durationInFrames={titleCardFrames}>
          <ThumbnailCover hookText={hookText} />
        </Sequence>
      )}

      <Subtitles captionsSrc={captionsSrc} />

      {/* ─────────────────────────────────────────────────────────────────────
          ESCENAS DE CONCEPTO / REHOOK (opcional — van por encima de los subtítulos).
          Patrón: N <Sequence> cortas independientes (90 frames c/u), nunca antes de
          los 3s, nunca al cierre. Timestamps en ms del clip editado. Importar arriba
          solo la scene que se use. Ejemplo:

          <Sequence from={s(38000, fps)} durationInFrames={90}>
            <NumeroConceptoScene numero="1" linea1="LÍNEA UNO" linea2="LÍNEA DOS" />
          </Sequence>

          <Sequence from={s(55500, fps)} durationInFrames={50}>
            <RehookScene linea1="Frase que" linea2="tensiona el" acento="GANCHO" />
          </Sequence>
          ───────────────────────────────────────────────────────────────────── */}
    </AbsoluteFill>
  );
};
