# Reaction — Reel de reacción con pantalla dividida

Composición: `Plantilla-DrBeker-Reaccion` | 1080×1920 @ 30fps | h264. Reusa Portada /
ThumbnailCover / Subtitles / brand de reel-yapping (ver `base.md` + `plantillas.md`).
**Scope acotado:** subtítulos + gancho + portada + split/opinión. SIN zoom, SIN escenas
didácticas, SIN rehook (menos piezas = más rápido). Estilo/marca: idénticos a yapping.

## Formato (bloques fijos)
Tres videos crudos → un reel en dos bloques secuenciales:
1. **Bloque split** (frames `0 .. splitBlockSeconds`): **arriba 40% YO reaccionando**,
   **abajo 60% el video al que reacciono** (prioridad al video reaccionado). Audio: el
   video reaccionado bajo (`sourceVolume`, default 0.5) + mi voz reaccionando (1.4).
2. **Bloque opinión** (resto): **YO a pantalla completa** dando mi opinión. Audio: mi voz.

Se subtitula **mi voz** en los dos bloques (captions unidos con offset). La portada usa un
frame del clip de opinión (cara full-screen).

## Los 3 crudos (en `public/proyectos/<nombre>/Crudos/`)
- **video reaccionado** → `source` (va abajo en el split). Recortar al tramo que se usa.
- **yo reaccionando** → `clip_react` (arriba en el split).
- **yo opinión** → `clip_opinion` (bloque full-screen).

## Flujo (replica reel-yapping, adaptado)
1. **Paso 0 — marca** (preguntar; ver `plantillas.md`) → prop `brand`.
2. `bash scripts/new_project.sh <nombre>` (crea carpetas, resetea Root/Reel a plantilla en
   blanco con AMBAS composiciones). Mover los 3 crudos a `Crudos/`.
3. **source**: recortar el video reaccionado al tramo deseado → `Ediciones/source.mp4`
   (`scripts/cut_clip`/ffmpeg si hace falta). Debe durar ≥ `splitBlockSeconds`.
4. **clip_react**: cortar silencios del video "yo reaccionando" con `scripts/remove_silences.py`
   → `Ediciones/clip_react.mp4`. Su duración final = **`splitBlockSeconds`**.
5. **clip_opinion**: cortar silencios del video "yo opinión" (igual que yapping, cierre con
   la última palabra completa + ~400ms) → `Ediciones/clip_opinion.mp4`.
6. **Transcribir** por separado (mi voz): `node scripts/transcribe.mjs Ediciones/clip_react.mp4`
   y `node scripts/transcribe.mjs Ediciones/clip_opinion.mp4` → dos `*_captions.json`.
7. **Unir captions** con offset del bloque split:
   ```bash
   node scripts/reaction_captions_merge.mjs \
     Ediciones/clip_react_captions.json Ediciones/clip_opinion_captions.json <splitBlockMs> \
     > Ediciones/clip_reaccion_captions.json
   ```
   `splitBlockMs` = duración de `clip_react.mp4` en ms. Revisar el JSON unido contra el audio
   (misma revisión de captions que base.md: alucinaciones, zero-duration, capitalizar inicios
   de idea). Detección de repeticiones opcional: `node scripts/detect_repeats.mjs <json>`.
8. **Pausa (títulos)**: proponer **título de portada** + **gancho** (2–3 opciones c/u,
   marca-aware) y esperar OK. No hay escenas ni zoom en reacción.
9. **Root.tsx** → completar `reactionDefaultProps`: `brand`, `reactVideoSrc`, `sourceVideoSrc`,
   `sourceVolume`, `splitBlockSeconds`, `opinionVideoSrc`, `captionsSrc`, `hookText`,
   `portadaBgMs` (`node scripts/portada_bg_pick.mjs Ediciones/clip_opinion_captions.json`),
   `durationSeconds` = `splitBlockSeconds` + duración de `clip_opinion`.
10. **Render**:
    ```bash
    npx remotion render Plantilla-DrBeker-Reaccion public/proyectos/<nombre>/Final/<nombre>.mp4
    ```
11. **Renombrar carpeta** a kebab-case descriptivo (nunca dejar fecha) y actualizar rutas en
    Root.tsx. Confirmar la ruta final.
12. **Caption para redes** (base.md; preguntar CTA engagement vs lead magnet primero) →
    `public/proyectos/<nombre>/caption.txt`.

## Sync del split (nota)
El split muestra `clip_react` (yo) y `source` (reaccionado) en paralelo desde t=0; `source` se
corta al llegar a `splitBlockSeconds`. No requiere sync frame-a-frame (es vibe reacción). Si
querés que el video reaccionado empiece en un punto puntual, recortá `source.mp4` a ese tramo.
