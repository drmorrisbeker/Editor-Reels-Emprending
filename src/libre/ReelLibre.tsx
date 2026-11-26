import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { SubtitlesLibre } from "./SubtitlesLibre";
import { ProgressChips } from "./ProgressChips";
import { ConceptBand } from "./ConceptBand";
import { Hook } from "./Hook";
import { PortadaLibre } from "./PortadaLibre";
import { COLORS, SECTIONS } from "./theme";

// ─────────────────────────────────────────────────────────────────────────────
// ReelLibre — versión estilo libre del reel "Día de la Salud Mental".
// Sin punch-zoom (pedido del cliente): el locutor queda quieto. El movimiento vive
// en el texto (gancho cinético, chips 1·2·3, franjas de concepto). Subtítulos TODO
// BLANCO. Cobre solo en chips / franjas / portada / gancho. Sin música.
// ─────────────────────────────────────────────────────────────────────────────

const VIDEO_SRC = "proyectos/dia-salud-mental/Ediciones/clip_edit3.mp4";
const CAPTIONS_SRC = "proyectos/dia-salud-mental/Ediciones/clip_edit3_captions.json";
const PORTADA_BG_MS = 21750; // frame presentable: ojos abiertos, sonriendo, a cámara

const BANDS = [
  { from: SECTIONS.c1, to: SECTIONS.c2, headline: "No esperes a estar mal" },
  { from: SECTIONS.c2, to: SECTIONS.c3, headline: "Buscá fuentes de calidad" },
  { from: SECTIONS.c3, to: SECTIONS.cierre, headline: "Pedir ayuda es valentía" },
];

// Sound design sutil (nunca tapa la voz):
const SWIPES_MS = [SECTIONS.c1, SECTIONS.c2, SECTIONS.c3, SECTIONS.cierre]; // transición de tramo
const CLICKS_MS = [39490, 46310]; // "valentía" · "estar bien vos"

export const ReelLibre: React.FC = () => {
  const { fps, durationInFrames } = useVideoConfig();
  const f = (ms: number) => Math.round((ms / 1000) * fps);

  const hookFrames = f(SECTIONS.hookEnd);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Video del locutor, quieto (sin zoom). Audio normalizado del clip. */}
      <Video
        src={staticFile(VIDEO_SRC)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        volume={1.4}
      />

      {/* Scrim inferior sutil para cohesión con los subtítulos. */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(10,24,38,0.5) 0%, rgba(10,24,38,0.18) 20%, rgba(10,24,38,0) 36%)",
          pointerEvents: "none",
        }}
      />

      {/* Barra de progreso 1·2·3 (todo el video; en frame 0 está en opacidad ~0). */}
      <ProgressChips />

      {/* Gancho 0 → 4,44 s */}
      <Sequence from={0} durationInFrames={hookFrames}>
        <Hook durationFrames={hookFrames} />
      </Sequence>

      {/* Franjas de concepto por consejo */}
      {BANDS.map((b, i) => (
        <Sequence key={i} from={f(b.from)} durationInFrames={f(b.to) - f(b.from)}>
          <ConceptBand headline={b.headline} />
        </Sequence>
      ))}

      {/* Cierre */}
      <Sequence from={f(SECTIONS.cierre)} durationInFrames={durationInFrames - f(SECTIONS.cierre)}>
        <ConceptBand headline="Compartilo con quien lo necesite" big />
      </Sequence>

      {/* Subtítulos (todo blanco, sin highlight) */}
      <SubtitlesLibre captionsSrc={CAPTIONS_SRC} />

      {/* Sound design */}
      {SWIPES_MS.map((ms, i) => (
        <Sequence key={`sw${i}`} from={f(ms)} durationInFrames={10}>
          <Audio src={staticFile("sfx/swipe.mp3")} volume={0.09} />
        </Sequence>
      ))}
      {CLICKS_MS.map((ms, i) => (
        <Sequence key={`ck${i}`} from={f(ms)} durationInFrames={4}>
          <Audio src={staticFile("sfx/click.mp3")} volume={0.035} />
        </Sequence>
      ))}
      <Sequence from={f(SECTIONS.cierre)} durationInFrames={6}>
        <Audio src={staticFile("sfx/pop.mp3")} volume={0.08} />
      </Sequence>

      {/* Portada (frame 0-2): fondo still presentable + overlay de texto. Va ARRIBA
          de todo para que el thumbnail del feed sea sólo la tapa. */}
      <Sequence from={0} durationInFrames={2}>
        <AbsoluteFill>
          <Video
            src={staticFile(VIDEO_SRC)}
            trimBefore={Math.round((PORTADA_BG_MS / 1000) * fps)}
            volume={0}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <PortadaLibre />
        </AbsoluteFill>
      </Sequence>

      {/* marcador de color (referencia de token, no visible) */}
      <div style={{ display: "none", color: COLORS.copper }} />
    </AbsoluteFill>
  );
};
