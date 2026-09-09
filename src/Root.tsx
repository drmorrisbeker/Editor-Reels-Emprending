// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLA EN BLANCO — Root.tsx
// Copiar sobre src/Root.tsx al empezar un video nuevo (lo hace scripts/new_project.sh).
// Registra AMBAS composiciones: Plantilla-DrBeker-Reels (yapping) y
// Plantilla-DrBeker-Reaccion (reacción). Completá los valores del que uses (← COMPLETAR).
// - reel-yapping   → editar reelDefaultProps + src/Reel.tsx
// - reel-reaction  → editar reactionDefaultProps (Reaction.tsx es estable, no se toca)
// ─────────────────────────────────────────────────────────────────────────────
import "./index.css";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { ReelPropsSchema } from "./schema";
import { Reaction } from "./Reaction";
import { ReactionPropsSchema } from "./reactionSchema";

const reelDefaultProps = {
  videoSrc: "proyectos/prevencion-suicidio-no-un-dia/Ediciones/clip_edit.mp4",
  captionsSrc: "proyectos/prevencion-suicidio-no-un-dia/Ediciones/clip_edit_captions.json",
  bgMusicSrc: "",
  brand: "foropsiquiatria" as const,
  hookText: "Estar atentos no puede ser cosa de un solo día.",
  titleCard: {
    type: "statement" as const,
    lines: [{ text: "", yellow: false }],
  },
  titleCardDurationMs: 5000,
  portadaBgMs: 7850,
  overlays: [],
  durationSeconds: 60.67,
};

// reel-REACCIÓN — bloques fijos: split (arriba 40% yo / abajo 60% reaccionado) → opinión full-screen.
const reactionDefaultProps = {
  brand: "beker" as const, // ← COMPLETAR
  reactVideoSrc: "proyectos/<nombre>/Ediciones/clip_react.mp4", // ← COMPLETAR (yo reaccionando, editado)
  sourceVideoSrc: "proyectos/<nombre>/Ediciones/source.mp4", // ← COMPLETAR (video al que reacciono)
  sourceVolume: 0.5,
  splitBlockSeconds: 30, // ← COMPLETAR (duración del clip de reacción editado)
  opinionVideoSrc: "proyectos/<nombre>/Ediciones/clip_opinion.mp4", // ← COMPLETAR (yo full-screen)
  captionsSrc: "proyectos/<nombre>/Ediciones/clip_reaccion_captions.json", // ← COMPLETAR (react+opinión unidos)
  bgMusicSrc: "",
  hookText: "Gancho de la reacción", // ← COMPLETAR
  titleCardDurationMs: 5000,
  portadaBgMs: 8000, // ← COMPLETAR (frame del clip de opinión)
  durationSeconds: 60, // ← COMPLETAR (splitBlockSeconds + duración del clip de opinión)
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
