import "./index.css";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { ReelPropsSchema } from "./schema";
import { Reaction } from "./Reaction";
import { ReactionPropsSchema } from "./reactionSchema";
import { Portada } from "./components/Portada";

const FluoxetinaPortada: React.FC = () => (
  <Portada titulo="FLUOXETINA:" linea2="3 DATOS" bgSrc="proyectos/fluoxetina-3-cosas/portada-bg.png" />
);

const SobreestimuladosPortada: React.FC = () => (
  <Portada titulo="PERDIMOS" linea2="EL ABURRIMIENTO." bgSrc="proyectos/sobreestimulados-ansiedad-y-presente/portada-bg.png" />
);

const reelDefaultProps = {
  videoSrc: "proyectos/ansiedad-no-se-elimina/Ediciones/clip_edit.mp4",
  captionsSrc: "proyectos/ansiedad-no-se-elimina/Ediciones/clip_edit_captions.json",
  bgMusicSrc: "",
  brand: "beker" as const,
  hookText: "Si querés dejar de sentir ansiedad, vas a fracasar",
  titleCard: {
    type: "statement" as const,
    lines: [{ text: "", yellow: false }],
  },
  titleCardDurationMs: 5000,
  portadaBgMs: 10770,
  overlays: [],
  durationSeconds: 92.4,
};

// Defaults del reel-REACCIÓN (placeholder: apunta al mismo clip para que el studio abra).
const reactionDefaultProps = {
  brand: "beker" as const,
  reactVideoSrc: "proyectos/ansiedad-no-se-elimina/Ediciones/clip_edit.mp4",
  sourceVideoSrc: "proyectos/ansiedad-no-se-elimina/Ediciones/clip_edit.mp4",
  sourceVolume: 0.5,
  splitBlockSeconds: 30,
  opinionVideoSrc: "proyectos/ansiedad-no-se-elimina/Ediciones/clip_edit.mp4",
  captionsSrc: "proyectos/ansiedad-no-se-elimina/Ediciones/clip_edit_captions.json",
  bgMusicSrc: "",
  hookText: "Reaccioné a esto y no lo podía creer",
  titleCardDurationMs: 5000,
  portadaBgMs: 10770,
  durationSeconds: 60,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition
      id="PortadaOnly"
      component={FluoxetinaPortada}
      durationInFrames={2}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="SobreestimuladosPortada"
      component={SobreestimuladosPortada}
      durationInFrames={2}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="Plantilla-DrBeker-Reels"
      component={Reel}
      schema={ReelPropsSchema}
      defaultProps={reelDefaultProps}
      durationInFrames={Math.round(reelDefaultProps.durationSeconds * 30)}
      fps={30}
      width={1080}
      height={1920}
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.round(props.durationSeconds * 30),
      })}
    />
    <Composition
      id="Plantilla-DrBeker-Reaccion"
      component={Reaction}
      schema={ReactionPropsSchema}
      defaultProps={reactionDefaultProps}
      durationInFrames={Math.round(reactionDefaultProps.durationSeconds * 30)}
      fps={30}
      width={1080}
      height={1920}
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.round(props.durationSeconds * 30),
      })}
    />
    </>
  );
};
