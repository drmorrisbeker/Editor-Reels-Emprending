# Base — flujo común de los reels
Composiciones: `Reel` (yapping) · `Reaccion` · `Marca-Preview` | 1080×1920 @ 30fps | h264.
**Sin escenas ni zoom:** cámara quieta, cortes secos. No proponerlos.

## Carpetas
```
Crudos/<proyecto>/      ← las grabaciones originales (no se tocan)
Ediciones/<proyecto>/   ← todo lo que genera la edición: clip cortado, captions, keep.json, música, src/
Terminados/<proyecto>/  ← <proyecto>.mp4 + caption.txt + ganchos.txt (lo que se publica)
marcas/<id>/            ← la marca (ver marcas/README.md y arranque.md)
```
Remotion lee `Ediciones/` a través de `public/ediciones` → en `Root.tsx` las rutas son
`ediciones/<proyecto>/…`. El único archivo que se edita por video es **`src/Root.tsx`**
(`Reel.tsx` y `Reaction.tsx` son estables).

## Flujo
1. **Arranque** (`arranque.md`): carpetas, marca, branding, cliente ideal, portada.
2. **Proyecto:** `bash scripts/new_project.sh <proyecto> <marca>` — crea las 3 carpetas del
   proyecto, guarda el `Root.tsx` del video anterior en `Ediciones/<anterior>/src/` y deja
   `src/Root.tsx` en blanco con el proyecto y la marca puestos. Mover el crudo a
   `Crudos/<proyecto>/`. `<proyecto>` en kebab-case descriptivo del tema (si todavía no se
   sabe, un nombre provisorio y se renombra en el paso 9).
3. **Cortar silencios** (pausas ≥ 0,10 s):
   ```bash
   python3 scripts/desilence.py Crudos/<p>/<crudo>.MP4 Ediciones/<p>/clip_edit.mp4 Ediciones/<p>/clip_edit_keep.json
   ```
   Cada pausa queda en ~0,08 s; nunca corta dentro del habla (bordes a frame exacto + fundido
   de 8 ms). Umbral `--noise auto`: piso de ruido del crudo + 12 dB, nunca arriba de -42 (un
   -42 fijo se come palabras en crudos grabados bajos). Recorta el aire inicial (deja 0,15 s) y
   deja **0,40 s después de la última palabra** (detecta la cola de la última sílaba hasta
   -55 dB). Aplica **denoise `arnndn` + `loudnorm` una sola vez, acá**.
   - Tomas repetidas / recortes aprobados: en la misma pasada desde el crudo con
     `--exclude 0-11.0,31.8-38.2` (segundos del CRUDO, bordes dentro de silencio).
   - Descarta solo-ruido: tramos que no llegan a `--min-voice` (-50 dB) y golpes secos con
     menos de `--min-voiced` 0,08 s por encima de -45 dB (tocar el celular, roce de mano).
   - **Control obligatorio:** listar los tramos del keep.json de ≤ 0,6 s y mirar sus cuadros
     (ffmpeg `tile`). Uno de exactamente 0,50 s suele ser ruido estirado por `--min-seg`:
     se ve como un destello de la persona callada. Sacarlo con `--keep-from` + `--exclude`.
   - Re-cortar un clip ya hecho respetando sus cortes: `--keep-from <keep.json viejo>`.
   - `--dry-run` informa la duración final sin codificar. Si el remate queda cortado, subir `--tail`.
4. **Transcribir:** `node scripts/transcribe.mjs Ediciones/<p>/clip_edit.mp4` (whisper
   large-v3, palabra por palabra) → `clip_edit_captions.json` al lado.
   **Nunca dos transcripciones a la vez** (whisper.cpp escribe siempre en `tmp.json` del repo).
   Si muere con `SIGKILL` es falta de RAM: cerrar navegadores y reintentar. No bajar a `medium`
   sin avisar: alucina y se come frases; si no queda otra, revisar el texto frase por frase.
5. **Revisar captions:** corregir alucinaciones, fusionar tokens, zero-duration
   (`endMs = startMs + 50`), capitalizar el inicio de cada idea nueva (fuerza renglón nuevo).
   Repeticiones: `node scripts/detect_repeats.mjs Ediciones/<p>/clip_edit_captions.json` →
   reportarlas con los segundos y preguntar cuál conservar (no borrar solo).
6. **✋ Pausa de títulos** (ver la skill): portada + gancho + recortes. Esperar OK.
7. **Completar `src/Root.tsx`:** `portadaTitulo`/`portadaLinea2`, `hookText`, `portadaBgMs`,
   `clicksMs`, `durationSeconds` (`ffprobe` del clip). Música: mp3 en `Ediciones/<p>/`, vol 0.02.
8. **Render:** `bash scripts/render_reel.sh <p> [Reel|Reaccion]` → `Terminados/<p>/<p>.mp4`.
   Usa un `public/` reducido (solo `sfx/` + `ediciones/<p>`): **nunca** `npx remotion render`
   a secas, porque copiaría todas las Ediciones en el bundle. No renderizar en paralelo con
   una transcripción. `delayRender() was called but not cleared` / `Target closed` = falta de
   RAM: reintentar con `CONCURRENCY=1 bash scripts/render_reel.sh <p>`.
9. **Cierre:** si el nombre era provisorio, renombrar las 3 carpetas a kebab-case descriptivo y
   actualizar `PROYECTO` en Root.tsx. Escribir **`Terminados/<p>/caption.txt`** (abajo) y
   `python3 scripts/ganchos_txt.py <p>` → `Terminados/<p>/ganchos.txt`. Confirmar las rutas.

## Subtítulos (iguales en todas las marcas; solo cambia la tipografía)
- Blancos `#FFFFFF`, peso 800, 74px, una sola línea siempre (la página se corta por ancho,
  máx. 860px y 3 palabras), renglón entero de una (sin animación palabra por palabra), sin
  colores de énfasis, sombra suave en capas.
- `paddingBottom: 500` → renglón en y≈1330–1420: **debajo de la cara y arriba de la UI**.
  **Regla dura: el subtítulo nunca tapa la cara.** En cada video, mirar 8–10 cuadros con
  líneas guía (ffmpeg `drawbox` en y 1200/1300/1400/1500): si el mentón baja de ~1330, avisar
  antes de renderizar.
- Puntuación de cierre que Whisper emite como token aparte sin espacio se fusiona a la palabra
  previa (`hago` → `hago?`); `¿¡` se mantienen.
- Ocultos por opacity (no desmontados) en los frames de la portada.

## Portada (frames 0-1, la tapa del feed)
- Según la marca: la de la plantilla, la propia (`marcas/<id>/Portada.tsx`) o ninguna.
- Título en 2 renglones parejos: entran ~15 caracteres por renglón (título 106px) y ~14 en la
  línea destacada. Más largo envuelve a 3-4 renglones y pierde fuerza.
- **Regla dura — cara presentable:** el frame de fondo (`portadaBgMs`) muestra a la persona con
  los ojos abiertos, mirando a cámara, idealmente sonriendo; nunca parpadeo, boca a mitad de
  sílaba ni movimiento. `node scripts/portada_bg_pick.mjs <captions.json>` da un punto de
  partida (no ve la cara): armar una hoja de contactos de candidatos (ffmpeg `tile`), elegir a
  ojo y verificar el frame 0 del render.

## Cartel de gancho (primeros 5 s)
Un panel de ancho completo arriba de la cabeza (`top 270`, dentro de la zona segura), 76px,
peso 800, colores `hookBg`/`hookFg` de la marca. ~22 caracteres por renglón; un gancho de ~45
caracteres va a 3 renglones.

## Zonas seguras (1080×1920)
Arriba ≥ 245px · abajo ≤ 1534px · laterales 71–1028px; desde y≈864 el límite derecho baja a
~887px (botones de like/comentar/compartir). Texto importante centrado.

## Caption (`Terminados/<p>/caption.txt`) — listo para pegar, optimizado para SEO
Hoy Instagram, TikTok y YouTube se buscan como buscadores: el texto tiene que tener las
palabras que la gente escribe.
1. **Palabra clave principal:** cómo buscaría este tema el cliente ideal
   (`marcas/<id>/cliente-ideal.md` si existe; si no, el tema en palabras comunes, no técnicas).
   Va **en la primera línea**, dentro de los primeros ~125 caracteres (lo que se ve antes del
   "más"), y la primera línea es además el gancho: sin "Hola", sin emojis de arranque.
2. **Desarrollo** (2–3 párrafos cortos): quien lo lea sin ver el video entiende la idea. Suma
   contexto o un ejemplo que no esté en el video; no transcribir. Meter 2–3 variantes o
   sinónimos de la palabra clave de forma natural (nunca listas de keywords).
3. **Cierre** — una frase que quede.
4. **CTA** — preguntar engagement o lead magnet, salvo que el perfil de la marca lo fije.
   Engagement: una pregunta concreta. Lead magnet: "Comentá X y te mando [recurso]".
5. **Hashtags: 3–5** (Instagram admite hasta 5), específicos del tema, al final.
Registro y voz: `marcas/<id>/perfil-caption.md` si existe; si no, español rioplatense
cercano (vos), sin clichés. Mismo texto para Instagram, TikTok y Shorts. En temas sensibles
(suicidio, autolesión, consumo), incluir líneas de ayuda locales.

## Errores frecuentes
| Error | Causa | Arreglo |
|---|---|---|
| Subtítulo mezcla oraciones | no detecta el cambio de idea | capitalizar el primer token de la idea nueva |
| Palabra inventada | Whisper confunde una palabra rara | `caps[i].text=' correcta'`, ajustar `endMs`, `splice` |
| Token de duración cero | `startMs === endMs` | `endMs = startMs + 50` |
| Destello de un cuadro | tramo corto de ruido estirado | control de tramos ≤ 0,6 s (paso 3) |
| El bundle no termina | se copió el `public/` entero | renderizar con `render_reel.sh` |
| Fuente de marca no aparece | nombre mal escrito en `googleFonts` | revisar en fonts.google.com, formato css2 |
