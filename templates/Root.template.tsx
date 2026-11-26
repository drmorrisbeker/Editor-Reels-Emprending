// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLA EN BLANCO — Root.tsx
// scripts/new_project.sh la copia sobre src/Root.tsx al empezar cada video (y guarda el Root
// del video anterior en Ediciones/<anterior>/src/). Es el ÚNICO archivo que se edita por video:
// Reel.tsx y Reaction.tsx son estables. Completá lo marcado con ← COMPLETAR.
//   · Reel     → reel yapping (una persona a cámara)
//   · Reaccion → reel de reacción (pantalla dividida + opinión)
//   · Marca-Preview → vista previa de la marca (sin video)
// ─────────────────────────────────────────────────────────────────────────────
import "./index.css";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { ReelPropsSchema } from "./schema";
import { Reaction } from "./Reaction";
import { ReactionPropsSchema } from "./reactionSchema";
import { MarcaPreview, MarcaPreviewSchema } from "./MarcaPreview";

const MARCA = "default"; // ← COMPLETAR (carpeta en marcas/, la elige el arranque)
const PROYECTO = "<nombre>"; // ← COMPLETAR (carpeta en Ediciones/)

const reelDefaultProps = {
  brand: MARCA,
  videoSrc: `ediciones/${PROYECTO}/clip_edit.mp4`,
  captionsSrc: `ediciones/${PROYECTO}/clip_edit_captions.json`,
  bgMusicSrc: "", // opcional: mp3 en Ediciones/<proyecto>/ → `ediciones/${PROYECTO}/musica.mp3`
  portadaTitulo: "", // ← COMPLETAR (aprobado en la pausa de títulos; "" = sin portada)
  portadaLinea2: "",
  portadaBgMs: 0, // ← COMPLETAR (frame con la cara presentable, verificado a ojo)
  hookText: "", // ← COMPLETAR (aprobado en la pausa de títulos)
  titleCardDurationMs: 5000,
  clicksMs: [] as number[], // 3-4 frases clave + cierre (ms del clip editado)
  durationSeconds: 60, // ← COMPLETAR (duración del clip editado)
};

const reactionDefaultProps = {
  brand: MARCA,
  reactVideoSrc: `ediciones/${PROYECTO}/clip_react.mp4`, // vos reaccionando (sin silencios)
  sourceVideoSrc: `ediciones/${PROYECTO}/source.mp4`, // el video al que reaccionás
  sourceVolume: 0.5,
  splitBlockSeconds: 30, // ← COMPLETAR (duración de clip_react.mp4)
  opinionVideoSrc: `ediciones/${PROYECTO}/clip_opinion.mp4`, // vos a pantalla completa
  captionsSrc: `ediciones/${PROYECTO}/clip_reaccion_captions.json`, // react + opinión unidos
  bgMusicSrc: "",
  portadaTitulo: "", // ← COMPLETAR
  portadaLinea2: "",
  hookText: "", // ← COMPLETAR
  titleCardDurationMs: 5000,
  portadaBgMs: 0, // ← COMPLETAR (frame del clip de opinión)
  durationSeconds: 60, // ← COMPLETAR (splitBlockSeconds + duración de clip_opinion)
};

const video = { fps: 30, width: 1080, height: 1920 };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel"
        component={Reel}
        schema={ReelPropsSchema}
        defaultProps={reelDefaultProps}
        durationInFrames={Math.round(reelDefaultProps.durationSeconds * 30)}
        {...video}
        calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.durationSeconds * 30) })}
      />
      <Composition
        id="Reaccion"
        component={Reaction}
        schema={ReactionPropsSchema}
        defaultProps={reactionDefaultProps}
        durationInFrames={Math.round(reactionDefaultProps.durationSeconds * 30)}
        {...video}
        calculateMetadata={({ props }) => ({ durationInFrames: Math.round(props.durationSeconds * 30) })}
      />
      <Composition
        id="Marca-Preview"
        component={MarcaPreview}
        schema={MarcaPreviewSchema}
        defaultProps={MarcaPreviewSchema.parse({ brand: MARCA })}
        durationInFrames={2}
        {...video}
      />
    </>
  );
};
