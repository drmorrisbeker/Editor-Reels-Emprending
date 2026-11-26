// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLA EN BLANCO — Reel.tsx
// Copiar sobre src/Reel.tsx al empezar un video nuevo (lo hace scripts/new_project.sh).
// Conserva TODOS los mecanismos del diseño (zoom sostenido, portada-bg, gradiente,
// clicks, ThumbnailCover, subtítulos). Solo hay que completar los VALORES por-video
// marcados con  ← COMPLETAR.  No borrar los mecanismos.
// Reglas de estilo/animación: .claude/rules/base.md + .claude/rules/yapping.md
// ─────────────────────────────────────────────────────────────────────────────
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { ThumbnailCover } from "./components/ThumbnailCover";
import { Portada } from "./components/Portada";
import { Subtitles } from "./components/Subtitles";
import { getBrand } from "./brand";
// Escenas / rehook: importar SOLO las que se usen en este video (ver bloque comentado abajo).
// import { RehookScene } from "./components/RehookScene";
// import { NumeroConceptoScene } from "./components/scenes/NumeroConceptoScene";
import type { ReelProps } from "./schema";

// CÁMARA QUIETA: cortes secos, SIN ZOOM (Morris, 18/11: "Hagamos cortes limpios sin zoom").
// Se probaron y descartaron el zoom sostenido (17/11) y los settles/punch-ins de reel-kit (18/11).
// Ver .claude/rules/yapping.md.

// Clicks sutiles (sfx/click.mp3, vol 0.03) SOLO en los 3–4 momentos más contundentes
// (frases clave + cierre). Ver .claude/rules/yapping.md.
const PHRASE_SOUNDS: { ms: number }[] = [
  // { ms: 0 },   // ← COMPLETAR
];

const SpeakerVideo: React.FC<{ src: string }> = ({ src }) => {
  return (
    <Video
      src={staticFile(src)}
      objectFit="cover"
      style={{ width: "100%", height: "100%" }}
      volume={1.4}
    />
  );
};

const s = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

export const Reel: React.FC<ReelProps> = ({
  videoSrc,
  captionsSrc,
  bgMusicSrc,
  brand,
  hookText,
  titleCardDurationMs,
  portadaBgMs,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const titleCardFrames = Math.round((titleCardDurationMs / 1000) * fps);
  const b = getBrand(brand);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <SpeakerVideo src={videoSrc} />

      {/* Portada background: frame fijo del video */}
      {portadaBgMs !== undefined && (
        <Sequence from={0} durationInFrames={2}>
          <AbsoluteFill>
            <Video
              src={staticFile(videoSrc)}
              trimBefore={Math.round((portadaBgMs / 1000) * fps)}
              volume={0}
              objectFit="cover"
              style={{ width: "100%", height: "100%" }}
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
        <Portada titulo={"TÍTULO"} linea2="GANCHO?" brand={b} /> {/* ← COMPLETAR (título de portada) */}
      </Sequence>

      {/* ThumbnailCover — primeros ~2.5 segundos */}
      {hookText && titleCardFrames > 0 && (
        <Sequence durationInFrames={titleCardFrames}>
          <ThumbnailCover
            hookText={hookText}
            bgColor={b.hookBg}
            fgColor={b.hookFg}
            fontFamily={b.subtitleFont}
          />
        </Sequence>
      )}

      {/* Ocultos (opacity, sin desmontar — desmontar reinicia el fetch de captions y
          cuelga el render) durante los frames 0-1 (tapa de la Portada), para que el
          thumbnail de feed de IG/TikTok no mezcle el texto de portada con el subtítulo. */}
      <AbsoluteFill style={{ opacity: frame < 2 ? 0 : 1 }}>
        <Subtitles captionsSrc={captionsSrc} fontFamily={b.subtitleFont} />
      </AbsoluteFill>

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
