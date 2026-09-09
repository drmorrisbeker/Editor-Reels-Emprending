import "./index.css";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { ReelPropsSchema } from "./schema";
import { Portada } from "./components/Portada";

const FluoxetinaPortada: React.FC = () => (
  <Portada titulo="FLUOXETINA:" linea2="3 DATOS" bgSrc="proyectos/fluoxetina-3-cosas/portada-bg.png" />
);

const SobreestimuladosPortada: React.FC = () => (
  <Portada titulo="PERDIMOS" linea2="EL ABURRIMIENTO." bgSrc="proyectos/sobreestimulados-ansiedad-y-presente/portada-bg.png" />
);

const reelDefaultProps = {
  videoSrc: "proyectos/ansiedad-no-se-elimina/ediciones/clip_edit.mp4",
  captionsSrc: "proyectos/ansiedad-no-se-elimina/ediciones/clip_edit_captions.json",
  bgMusicSrc: "",
  hookText: "Si querés dejar de sentir ansiedad, vas a fracasar",
  titleCardDurationMs: 5000,
  portadaBgMs: 10770,
  portadaTitulo: "DEJAR DE SENTIR",
  portadaLinea2: "ANSIEDAD?",
  overlays: [],
  durationSeconds: 92.4,
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
    </>
  );
};
