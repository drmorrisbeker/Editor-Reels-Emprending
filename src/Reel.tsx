// Reel yapping — una persona hablando a cámara, pantalla completa.
// Composición estable: NO se edita por video. Todos los valores llegan por props (Root.tsx).
// Cámara quieta, cortes secos: sin escenas ni zoom. Reglas: .claude/rules/base.md
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { ThumbnailCover } from "./components/ThumbnailCover";
import { PortadaMarca, usaPortada } from "./components/PortadaMarca";
import { Subtitles } from "./components/Subtitles";
import { getBrand } from "./marcas";
import { useBrandFonts } from "./fonts";
import type { ReelProps } from "./schema";

const s = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

export const Reel: React.FC<ReelProps> = ({
  brand,
  videoSrc,
  captionsSrc,
  bgMusicSrc,
  portadaTitulo,
  portadaLinea2,
  portadaBgMs,
  hookText,
  titleCardDurationMs,
  clicksMs,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const b = getBrand(brand);
  useBrandFonts(b);
  const titleCardFrames = s(titleCardDurationMs, fps);
  const conPortada = usaPortada(b) && Boolean(portadaTitulo || portadaLinea2);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Video src={staticFile(videoSrc)} objectFit="cover" style={{ width: "100%", height: "100%" }} volume={1.4} />

      {/* Fondo de la portada: un frame fijo del video (frames 0-1) */}
      {conPortada && portadaBgMs !== undefined && (
        <Sequence durationInFrames={2}>
          <AbsoluteFill>
            <Video
              src={staticFile(videoSrc)}
              trimBefore={s(portadaBgMs, fps)}
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

      {clicksMs.map((ms, i) => (
        <Sequence key={i} from={s(ms, fps)} durationInFrames={3}>
          <Audio src={staticFile("sfx/click.mp3")} volume={0.03} />
        </Sequence>
      ))}

      {/* Portada — frames 0-1, la tapa que muestran IG/TikTok en el feed */}
      {conPortada && (
        <Sequence durationInFrames={2}>
          <PortadaMarca titulo={portadaTitulo} linea2={portadaLinea2} brand={b} />
        </Sequence>
      )}

      {/* Cartel de gancho — primeros segundos */}
      {hookText && titleCardFrames > 0 && (
        <Sequence durationInFrames={titleCardFrames}>
          <ThumbnailCover hookText={hookText} bgColor={b.hookBg} fgColor={b.hookFg} fontFamily={b.subtitleFont} />
        </Sequence>
      )}

      {/* Subtítulos ocultos por opacity (sin desmontar: desmontar reinicia el fetch de captions y
          cuelga el render) en los frames de la portada, para que la tapa no mezcle textos. */}
      <AbsoluteFill style={{ opacity: conPortada && frame < 2 ? 0 : 1 }}>
        <Subtitles captionsSrc={captionsSrc} fontFamily={b.subtitleFont} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
