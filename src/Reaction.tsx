import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { ThumbnailCover } from "./components/ThumbnailCover";
import { Portada } from "./components/Portada";
import { Subtitles } from "./components/Subtitles";
import { getBrand } from "./brand";
import type { ReactionProps } from "./reactionSchema";

// Reel-REACCIÓN — estructura de bloques fijos (ver .claude/rules/reaction.md):
//   Bloque split  (0 .. splitBlockSeconds): arriba 40% YO, abajo 60% el video reaccionado.
//   Bloque opinión (resto): YO a pantalla completa.
// Reusa Portada / ThumbnailCover / Subtitles / brand de reel-yapping.

const TOP_FRAC = 0.4; // mi parte arriba = 40% (prioridad al video reaccionado, 60% abajo)

export const Reaction: React.FC<ReactionProps> = ({
  brand,
  reactVideoSrc,
  sourceVideoSrc,
  sourceVolume,
  splitBlockSeconds,
  opinionVideoSrc,
  captionsSrc,
  bgMusicSrc,
  hookText,
  titleCardDurationMs,
  portadaBgMs,
}) => {
  const { fps } = useVideoConfig();
  const b = getBrand(brand);
  const splitFrames = Math.round(splitBlockSeconds * fps);
  const titleCardFrames = Math.round((titleCardDurationMs / 1000) * fps);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* ── Bloque split: arriba YO (40%), abajo el video reaccionado (60%) ── */}
      <Sequence durationInFrames={splitFrames}>
        <AbsoluteFill>
          {/* Mi reacción — arriba, 40% */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${TOP_FRAC * 100}%`, overflow: "hidden" }}>
            <Video
              src={staticFile(reactVideoSrc)}
              objectFit="cover"
              style={{ width: "100%", height: "100%" }}
              volume={1.4}
            />
          </div>
          {/* Video al que reacciono — abajo, 60%, audio más bajo */}
          <div style={{ position: "absolute", top: `${TOP_FRAC * 100}%`, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
            <Video
              src={staticFile(sourceVideoSrc)}
              objectFit="cover"
              style={{ width: "100%", height: "100%" }}
              volume={sourceVolume}
            />
          </div>
          {/* Línea divisoria sutil */}
          <div style={{ position: "absolute", top: `${TOP_FRAC * 100}%`, left: 0, right: 0, height: 4, background: "rgba(0,0,0,0.55)" }} />
        </AbsoluteFill>
      </Sequence>

      {/* ── Bloque opinión: YO a pantalla completa ── */}
      <Sequence from={splitFrames}>
        <AbsoluteFill>
          <Video
            src={staticFile(opinionVideoSrc)}
            objectFit="cover"
              style={{ width: "100%", height: "100%" }}
            volume={1.4}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Portada background: frame fijo del clip de opinión (cara full-screen) */}
      {portadaBgMs !== undefined && (
        <Sequence from={0} durationInFrames={2}>
          <AbsoluteFill>
            <Video
              src={staticFile(opinionVideoSrc)}
              trimBefore={Math.round((portadaBgMs / 1000) * fps)}
              volume={0}
              objectFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          </AbsoluteFill>
        </Sequence>
      )}

      {bgMusicSrc && <Audio src={staticFile(bgMusicSrc)} volume={0.02} />}

      {/* Gradiente inferior para legibilidad de subtítulos */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 22%, rgba(0,0,0,0) 38%)",
          pointerEvents: "none",
        }}
      />

      {/* Portada — frame 0-1 para thumbnail del feed */}
      <Sequence from={0} durationInFrames={2}>
        <Portada titulo={"TÍTULO"} linea2="GANCHO?" brand={b} />
      </Sequence>

      {/* ThumbnailCover — gancho de los primeros segundos */}
      {hookText && titleCardFrames > 0 && (
        <Sequence durationInFrames={titleCardFrames}>
          <ThumbnailCover hookText={hookText} bgColor={b.hookBg} fgColor={b.hookFg} fontFamily={b.subtitleFont} />
        </Sequence>
      )}

      <Subtitles captionsSrc={captionsSrc} fontFamily={b.subtitleFont} />
    </AbsoluteFill>
  );
};
