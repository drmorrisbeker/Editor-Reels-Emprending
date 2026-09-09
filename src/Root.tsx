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
  videoSrc: "proyectos/<nombre>/ediciones/clip_edit.mp4", // ← COMPLETAR
  captionsSrc: "proyectos/<nombre>/ediciones/clip_edit_captions.json", // ← COMPLETAR
  bgMusicSrc: "", // opcional: ruta a un mp3 en public/ (música muy sutil, vol 0.02)
  hookText: "Gancho de los primeros segundos", // ← COMPLETAR (dolor concreto / pregunta urgente)
  titleCardDurationMs: 5000,
  portadaBgMs: 8000, // ← COMPLETAR (usar el "portadaBgMs candidato" de ediciones/transcript_resumen.md, lo calcula scripts/captions_resumen.mjs)
  portadaTitulo: "", // ← COMPLETAR (línea chica de contexto, uppercase)
  portadaLinea2: "", // ← COMPLETAR (línea(s) grande(s) de remate; usar " / " para dos líneas)
  overlays: [],
  durationSeconds: 60, // ← COMPLETAR (duración del clip editado)
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
