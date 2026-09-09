// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLA EN BLANCO — Root.tsx
// Copiar sobre src/Root.tsx al empezar un video nuevo (lo hace scripts/new_project.sh).
// Solo la composición Plantilla-DrBeker-Reels con defaults genéricos. Completar los
// valores por-video en reelDefaultProps (marcados con ← COMPLETAR) tras revisar captions.
// ─────────────────────────────────────────────────────────────────────────────
import "./index.css";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { ReelPropsSchema } from "./schema";

const reelDefaultProps = {
  videoSrc: "proyectos/creadora-dbt-la-padecia/ediciones/clip_edit2.mp4",
  captionsSrc: "proyectos/creadora-dbt-la-padecia/ediciones/clip_edit2_captions.json",
  bgMusicSrc: "", // sin música (decisión de Morris)
  hookText: "La creadora de la mejor terapia también la padecía",
  titleCardDurationMs: 3500,
  portadaBgMs: 8280,
  portadaTitulo: "LOS MEJORES TERAPEUTAS",
  portadaLinea2: "TAMBIÉN SUFREN",
  overlays: [],
  durationSeconds: 72.92,
};

export const RemotionRoot: React.FC = () => {
  return (
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
  );
};
