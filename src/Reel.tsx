import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { ThumbnailCover } from "./components/ThumbnailCover";
import { Portada } from "./components/Portada";
import { Subtitles } from "./components/Subtitles";
import { RehookScene } from "./components/RehookScene";
import { FlujoCausalScene } from "./components/scenes/FlujoCausalScene";
import { EliminarVsRegularScene } from "./components/scenes/EliminarVsRegularScene";
import type { ReelProps } from "./schema";

const RAMP_MS = 200;
// Zoom sostenido: entra en el inicio de la frase, se mantiene en el pico durante
// toda la frase de impacto, y se aleja recién cuando la frase termina.
const ZOOM_PHRASES = [
  { startMs: 4550, endMs: 5710, scale: 1.10 },   // "vas a fracasar"
  { startMs: 13300, endMs: 14000, scale: 1.08 }, // "una emoción humana"
  { startMs: 26660, endMs: 28140, scale: 1.09 }, // "cumple una función... protegernos"
  { startMs: 35200, endMs: 36430, scale: 1.10 }, // "amenazas reales o imaginarias"
  { startMs: 58170, endMs: 60160, scale: 1.12 }, // "decidir dejar de ser humano"
  { startMs: 88000, endMs: 91450, scale: 1.14 }, // cierre "eso sí es lo que buscamos" (pico)
];

const PHRASE_SOUNDS = [
  { ms: 5050 },  // "fracasar"
  { ms: 13300 }, // "humana"
  { ms: 59410 }, // "humano" (dejar de ser humano)
  { ms: 88250 }, // cierre "eso sí"
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
  portadaTitulo,
  portadaLinea2,
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

      {bgMusicSrc && (
        <Audio src={staticFile(bgMusicSrc)} volume={0.02} />
      )}

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
        <Portada titulo={portadaTitulo} linea2={portadaLinea2} />
      </Sequence>

      {/* ThumbnailCover — primeros ~2.5 segundos */}
      {hookText && titleCardFrames > 0 && (
        <Sequence durationInFrames={titleCardFrames}>
          <ThumbnailCover hookText={hookText} />
        </Sequence>
      )}

      <Subtitles captionsSrc={captionsSrc} />

      {/* Escenas y rehook van por encima de los subtítulos (los tapan mientras duran) */}

      {/* Escena A — flujo causal de la función de la ansiedad (~38s) */}
      <Sequence from={s(38000, fps)} durationInFrames={90}>
        <FlujoCausalScene
          label1="AMENAZA"
          label2="ANSIEDAD"
          sub2="activa el cuerpo"
          label3="ENFRENTAR O HUIR"
        />
      </Sequence>

      {/* Rehook — coincide exacto con "decidir dejar de ser humano" (~55.5s) */}
      <Sequence from={s(55500, fps)} durationInFrames={50}>
        <RehookScene linea1="Eliminar la ansiedad" linea2="es decidir" acento="DEJAR DE SER HUMANO" />
      </Sequence>

      {/* Escena B — eliminar vs regular (~69s) */}
      <Sequence from={s(69000, fps)} durationInFrames={90}>
        <EliminarVsRegularScene />
      </Sequence>
    </AbsoluteFill>
  );
};
