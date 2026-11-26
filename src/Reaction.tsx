import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { ThumbnailCover } from "./components/ThumbnailCover";
import { PortadaMarca, usaPortada } from "./components/PortadaMarca";
import { Subtitles } from "./components/Subtitles";
import { getBrand } from "./marcas";
import { useBrandFonts } from "./fonts";
import type { ReactionProps } from "./reactionSchema";

// Reel-REACCIÓN — estructura de bloques fijos (ver .claude/rules/reaction.md):
//   Bloque split  (0 .. splitBlockSeconds): arriba 40% YO, abajo 60% el video reaccionado.
//   Bloque opinión (resto): YO a pantalla completa.
// Reusa portada / cartel de gancho / subtítulos / marca de reel-yapping. No se edita por video.

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
  portadaTitulo,
  portadaLinea2,
  hookText,
  titleCardDurationMs,
  portadaBgMs,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const b = getBrand(brand);
  useBrandFonts(b);
  const conPortada = usaPortada(b) && Boolean(portadaTitulo || portadaLinea2);
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
      {conPortada && portadaBgMs !== undefined && (
        <Sequence durationInFrames={2}>
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
      {conPortada && (
        <Sequence durationInFrames={2}>
          <PortadaMarca titulo={portadaTitulo} linea2={portadaLinea2} brand={b} />
        </Sequence>
      )}

      {/* ThumbnailCover — gancho de los primeros segundos. En reacción el card va sobre la
          LÍNEA DIVISORIA del split (borde 40%/60%), no en el tercio superior: ahí tapaba la
          cara de quien reacciona (ver .claude/rules/reaction.md). */}
      {hookText && titleCardFrames > 0 && (
        <Sequence durationInFrames={titleCardFrames}>
          <ThumbnailCover
            hookText={hookText}
            bgColor={b.hookBg}
            fgColor={b.hookFg}
            fontFamily={b.subtitleFont}
            anchorTop={Math.round(TOP_FRAC * 1920) - 58}
          />
        </Sequence>
      )}

      {/* Ocultos (opacity, sin desmontar — desmontar reinicia el fetch de captions y
          cuelga el render) durante los frames 0-1 (tapa de la Portada), para que el
          thumbnail de feed de IG/TikTok no mezcle el texto de portada con el subtítulo. */}
      <AbsoluteFill style={{ opacity: conPortada && frame < 2 ? 0 : 1 }}>
        <Subtitles captionsSrc={captionsSrc} fontFamily={b.subtitleFont} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
