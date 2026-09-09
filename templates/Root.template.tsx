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
  videoSrc: "proyectos/<nombre>/Ediciones/clip_edit.mp4", // ← COMPLETAR
  captionsSrc: "proyectos/<nombre>/Ediciones/clip_edit_captions.json", // ← COMPLETAR
  bgMusicSrc: "", // opcional: ruta a un mp3 en public/ (música muy sutil, vol 0.02)
  brand: "beker" as const, // ← COMPLETAR (marca: "beker" | "clubdeterapia" — la skill lo pregunta al arranque)
  hookText: "Gancho de los primeros segundos", // ← COMPLETAR (dolor concreto / pregunta urgente)
  titleCard: {
    type: "statement" as const,
    lines: [{ text: "", yellow: false }],
  },
  titleCardDurationMs: 5000,
  portadaBgMs: 8000, // ← COMPLETAR (correr node scripts/portada_bg_pick.mjs <captions.json>)
  overlays: [],
  durationSeconds: 60, // ← COMPLETAR (duración del clip editado)
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
