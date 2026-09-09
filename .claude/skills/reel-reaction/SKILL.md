---
name: reel-reaction
description: Procesar un reel de REACCIÓN con pantalla dividida (Plantilla Dr. Beker). Tres videos — el video al que reacciono, un video mío reaccionando y un video mío a pantalla completa dando mi opinión. Usar cuando Morris pase un video de reacción o pida "armá el reel de reacción" / "reaccioná a este video" / mencione pantalla dividida. Para reels de un solo locutor hablando a cámara usar reel-yapping.
---

Reel de reacción: **bloques fijos** — primero un bloque split (arriba 40% YO reaccionando,
abajo 60% el video al que reacciono) y después YO a pantalla completa dando mi opinión.
Reusa subtítulos/gancho/portada/marca de reel-yapping.

Leer en este orden antes de continuar:
1. `.claude/rules/base.md` (subtítulos, portada, gancho, marca, caption)
2. `.claude/rules/reaction.md` (formato split/opinión, flujo, scripts)

**Solo al elegir marca**, leer `.claude/rules/plantillas.md`. **No pedir el hook text al
inicio** — se define después de transcribir. **No leer** `yapping.md` ni el catálogo de
escenas: la reacción no usa zoom, escenas ni rehook.

**Paso 0 — Marca (gating, preguntar SIEMPRE):** ¿Morris Beker, Club de Terapia o Foro
Psiquiatría? → prop `brand` (`"beker"` | `"clubdeterapia"` | `"foropsiquiatria"`). Detalle en
`plantillas.md`.

Si el mensaje no incluye los videos, pedir los **3 crudos**: (1) el video al que reacciono,
(2) yo reaccionando, (3) yo dando mi opinión. Preguntar también: **¿música de fondo?**
(opcional, muy sutil, `volume 0.02`).

## Flujo
Seguir los pasos 2–12 de `.claude/rules/reaction.md` (new_project → source/clip_react/
clip_opinion → transcribir cada uno → unir captions con offset → revisar → **pausa de
títulos** → completar `reactionDefaultProps` en Root.tsx → render `Plantilla-DrBeker-Reaccion`
→ renombrar carpeta → caption). Los scripts (`remove_silences.py`, `transcribe.mjs`,
`reaction_captions_merge.mjs`, `portada_bg_pick.mjs`, `detect_repeats.mjs`) están en `scripts/`.

### Pausa obligatoria antes de tocar Root.tsx / render
Presentar en un solo mensaje, para aprobación:
1. **Título de portada** (feed) — 2–3 opciones, breve, mayúsculas, curiosidad.
2. **Gancho / hookText** (primeros ~5s) — 2–3 opciones, dolor/pregunta que frena el scroll.
Esperar OK. (No hay escenas ni zoom en reacción — no proponerlos.)

### Render y cierre
- Render: `npx remotion render Plantilla-DrBeker-Reaccion Finales/<nombre>/<nombre>.mp4`
- **Paso final obligatorio:** renombrar la carpeta a kebab-case descriptivo (nunca fecha) y
  actualizar `reactVideoSrc`/`sourceVideoSrc`/`opinionVideoSrc`/`captionsSrc` en Root.tsx.
- **Caption para redes** (base.md + `.claude/rules/perfiles-caption.md` para el contexto del
  perfil): preguntar el CTA **solo si el perfil no lo fija** (**engagement o lead magnet**),
  luego guardar en `public/proyectos/<nombre>/caption.txt`.
