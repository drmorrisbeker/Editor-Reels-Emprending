# Reacción — pantalla dividida + opinión

Composición `Reaccion` (1080×1920 @ 30fps). Usa la misma marca, portada, cartel de gancho y
subtítulos que el yapping (`base.md`). Sin zoom, sin escenas.

## Formato (bloques fijos)
1. **Bloque split** (`0 .. splitBlockSeconds`): **arriba 40% la persona reaccionando**,
   **abajo 60% el video al que reacciona**. Audio: el video reaccionado bajo
   (`sourceVolume`, default 0.5) + la voz de quien reacciona.
2. **Bloque opinión** (resto): la persona a pantalla completa dando su opinión.

- El **cartel de gancho** va sobre la línea divisoria (40%/60%), no en el tercio de arriba:
  ahí tapa la cara de quien reacciona. (Ya resuelto en `Reaction.tsx`.)
- **Sincronía (crítico):** `clip_react` tiene que arrancar en el mismo instante en que arranca
  el contenido real de `source`. Si el crudo de reacción empieza con la persona
  acomodándose, ese tramo se recorta; si no, parece que no reacciona a lo que se escucha.
- Se subtitula solo la voz de quien reacciona (captions de los dos bloques unidos con offset).
  La portada usa un frame del clip de opinión.

## Los 3 crudos (en `Crudos/<proyecto>/`)
- el video al que se reacciona → `Ediciones/<p>/source.mp4` (recortado al tramo que se usa)
- la persona reaccionando → `Ediciones/<p>/clip_react.mp4`
- la persona opinando → `Ediciones/<p>/clip_opinion.mp4`

## Flujo
1. Arranque (`arranque.md`) y `bash scripts/new_project.sh <p> <marca>`. Mover los 3 crudos a
   `Crudos/<p>/`.
2. **source:** recortar el video reaccionado al tramo deseado (ffmpeg) → `source.mp4`. Tiene que
   durar ≥ `splitBlockSeconds`.
3. **clip_react** y **clip_opinion:** cortar silencios de cada uno con `scripts/desilence.py`
   (como el paso 3 de `base.md`). La duración de `clip_react` es `splitBlockSeconds`.
4. **Transcribir** cada clip por separado (de a uno): `node scripts/transcribe.mjs
   Ediciones/<p>/clip_react.mp4` y lo mismo con `clip_opinion.mp4`.
5. **Unir captions** con el offset del bloque split:
   ```bash
   node scripts/reaction_captions_merge.mjs Ediciones/<p>/clip_react_captions.json \
     Ediciones/<p>/clip_opinion_captions.json <splitBlockMs> > Ediciones/<p>/clip_reaccion_captions.json
   ```
   `splitBlockMs` = duración de `clip_react.mp4` en ms. Revisar el JSON unido (paso 5 de `base.md`).
6. **✋ Pausa de títulos** (portada + gancho). Esperar OK.
7. **Root.tsx** → `reactionDefaultProps`: `splitBlockSeconds`, `portadaTitulo`/`portadaLinea2`,
   `hookText`, `portadaBgMs` (frame del clip de opinión, cara presentable), `durationSeconds`
   = `splitBlockSeconds` + duración de `clip_opinion`. Las rutas ya vienen puestas.
8. **Render:** `bash scripts/render_reel.sh <p> Reaccion` → `Terminados/<p>/<p>.mp4`.
9. **Cierre** igual que `base.md` paso 9 (renombrar si hace falta, `caption.txt`, `ganchos.txt`).
