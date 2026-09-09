/** Escena: ← COMPLETAR (qué muestra: layout + elementos + animación) | Tema: ← COMPLETAR | Reusable: ← COMPLETAR (sí / con cambios (qué) / no (por qué)) */
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Template de concept scene (skill reel-scenes). Copiar a src/components/scenes/<Nombre>Scene.tsx,
// renombrar el export y completar la cabecera de la línea 1. Contrato:
//  - un solo `export const <Nombre>Scene: React.FC<Props>` por archivo; imports solo de "remotion"
//  - raíz <AbsoluteFill> con opacity = min(fadeIn 4f, fadeOut 10f); duration-agnostic (el padre da 60 o 90 frames)
//  - SFX propios: woosh al inicio, plop por elemento, click para el acento final (volúmenes: PERFIL › Sonido)
//  - Paleta (PERFIL › Paleta › Escenas): fondo #f5e9d2 · texto #162a3e · acento #b18060 · dimmed rgba(22,42,62,0.35)
//  - Tipografía: Inter 800–900, letterSpacing -0.02em, lineHeight 1.25
//  - Springs (PERFIL › Animación): punchy damping 11/stiffness 380 · texto tipo subtítulo 20/260 · pills 14/320
//  - Pill/tag: backgroundColor `${COLOR}22` + border `2px solid ${COLOR}88` + borderRadius 50
//  - Errores conocidos: línea blanca en bordes → `width: 1` sin borderRadius + `overflow: "hidden"` en AbsoluteFill

const BG     = "#f5e9d2";
const TEXT   = "#162a3e";
const ACCENT = "#b18060";
const DIMMED = "rgba(22,42,62,0.35)";

export const MiScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in (4 frames) + fade out (10 frames al final) — siempre
  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  // Cada elemento: spring con delay distinto
  const enter1 = spring({ frame: Math.max(0, frame - 3), fps, config: { damping: 11, stiffness: 380 } });
  const enter2 = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 11, stiffness: 380 } });
  // interpolate para opacity + y + scale por elemento
  const op1 = interpolate(enter1, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const y1  = interpolate(enter1, [0, 1], [60, 0]);
  const op2 = interpolate(enter2, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const y2  = interpolate(enter2, [0, 1], [60, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity, overflow: "hidden" }}>
      {/* woosh siempre al inicio */}
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      {/* plop por cada elemento que aparece */}
      <Sequence from={3} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>
      <Sequence from={8} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>
      {/* click para el elemento final/acento */}
      <Sequence from={22} durationInFrames={6}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.07} />
      </Sequence>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 14, padding: "0 60px" }}>
        <div style={{ opacity: op1, transform: `translateY(${y1}px)`, fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 72, color: TEXT, letterSpacing: "-0.02em", lineHeight: 1.25, textAlign: "center" }}>
          {/* texto principal */}
        </div>
        <div style={{ opacity: op2, transform: `translateY(${y2}px)`, fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 44, color: ACCENT, letterSpacing: "-0.02em", lineHeight: 1.25, textAlign: "center" }}>
          {/* acento / segunda línea */}
        </div>
        <div style={{ color: DIMMED }}>{/* elemento atenuado (antes/después, contraste) */}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
