# Base — Workflow Reels Dr. Beker
Composición: `Plantilla-DrBeker-Reels` | 1080×1920 @ 30fps | h264

## Flujo (10 pasos)
1. Video crudo: usar la ruta del video que pase el usuario (carpeta de crudos/screencasts propia)
2. `bash scripts/new_project.sh <nombre>` crea `public/proyectos/<nombre>/{Crudos,Ediciones}/` (media de trabajo) y `Finales/<nombre>/` (donde va el render, fuera de `public/`). Mover el crudo a `Crudos/`. **Los finales NO van dentro de `public/`: hay UNA sola carpeta de finales, `Finales/<nombre>/`.**
3. Detect silences: `ffmpeg -i input.mp4 -af silencedetect=noise=-35dB:d=2.0 -f null -` — PAD_SEC=0.15
4. Cut: `scripts/remove_silences.py` → `clip_edit.mp4` (editar `INPUT`/`OUTPUT`/`SILENCE` en el script o en una copia `scripts/_rs_tmp.py`). Desde 2026-09-08 el script **agrega solo el tramo final** (del último silencio al fin del archivo) — ya no hace falta pegar un "marcador de fin" en `SILENCE`, y sin silencios conserva el archivo entero.
   **Cierre del video:** Siempre verificar que el último segmento incluya la palabra final completa más ~300–500ms de silencio de impacto después. El Dr. cierra con una frase contundente — cortarla a mitad o sin silencio de asiento arruina el remate. Extender el último segmento si hace falta. **CRÍTICO: No aplicar un corte de silencio que tape la última palabra** — si la última sílaba cae dentro de un silencio detectado, mantenerla completa y agregar el buffer manualmente en el segmento final antes de correr `remove_silences.py`.
5. 2da pasada: revisar silencios residuales (<300ms tras frases clave), cortar con ffmpeg filter_complex concat
6. Transcribe: `node scripts/transcribe.mjs public/proyectos/<nombre>/Ediciones/<clip>.mp4` (whisper **large-v3 con división por palabra** desde 2026-09-08 — `medium` derivaba los timestamps; `--model medium` para volver) — `<clip>` es `clip_edit2` si hubo 2da pasada, `clip_edit` si no. Escribe `<clip>_captions.json` al lado del video; **todos los scripts de este documento y de la skill leen ese mismo archivo** (usar el nombre del clip que se transcribió, no uno fijo).
7. Revisar captions: corregir alucinaciones, fusionar tokens, ajustar zero-duration (`endMs = startMs + 50`)
8. Root.tsx: `videoSrc`, `captionsSrc`, `bgMusicSrc`, `hookText`, `titleCardDurationMs`, `durationSeconds`
9. Render: `npx remotion render Plantilla-DrBeker-Reels Finales/<nombre>/<nombre>.mp4`
10. **Cierre/archivado (SOLO con confirmación del usuario, video ya terminado y aprobado).**
    `public/` no debe acumular videos: lo que Remotion no necesita renderizar, sale de `public/` (si no,
    cada bundle copia GB de más). Al cerrar un reel, **preguntar** "¿archivo este proyecto?" y si confirma:
    ```bash
    bash scripts/archive_project.sh <nombre>
    ```
    Saca el material de trabajo de `public/` (nada se borra, todo recuperable):
    - `Crudos/` + `Ediciones/` (material de trabajo pesado) → `_archivo/<nombre>/`
    - `caption.txt` → `Finales/<nombre>/` (el render **ya está ahí** desde el paso 9)
    - snapshot de `src/Reel.tsx` + `src/Root.tsx` → `_archivo/<nombre>/src/` y **reset del
      código a la plantilla en blanco** (`templates/`), para que el próximo video arranque limpio.
    Y elimina la carpeta `public/proyectos/<nombre>/` ya vacía. Para re-renderizar más tarde, mover de
    vuelta `_archivo/<nombre>/{Crudos,Ediciones}` a `public/proyectos/<nombre>/`. **Nunca correr este paso
    sin confirmación** ni con un render pendiente o sin aprobar.

## Subtitles
- mergeIntoWords: token sin espacio inicial = continuación de palabra anterior
- isSentenceBoundary: detecta `.!?…`, `¿¡`, o inicio con mayúscula `/^[A-ZÁÉÍÓÚÜÑ]/`
- GAP_THRESHOLD_MS=380 | MAX_WORDS_PER_PAGE=3
- **Tipografía: Inter ExtraBold (800), blanca `#FFFFFF`** (igual en ambas marcas), sin contorno negro grueso — solo sombra suave en capas (`textShadow: "0 4px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.45)"`). fontSize 74, letterSpacing -0.01em. La fuente llega por prop `fontFamily` desde `brand.subtitleFont` (Inter). Cargar Inter en `index.css`.
- **Animación: renglón junto (modo "page").** El renglón entero aparece de una, SIN animación palabra-por-palabra. Menos ruido visual, más legible en móvil. (El word-by-word con spring y `LEAD_MS` quedó atrás — importado de podcast-clips el 2026-09-08.)
- **Sin énfasis de color: TODAS las palabras blancas.** No hay `EMPHASIS_MS` ni cobre en los subtítulos — el color de acento vive solo en la portada/gancho.
- **Cierre de signos (CRÍTICO):** Whisper a veces emite la puntuación de cierre (`?`/`!`/`.`) como token aparte SIN espacio inicial. El filtro de limpieza NO debe descartarla: si es continuación (sin espacio) se mantiene y se fusiona en la palabra previa (`"hago" → "hago?"`). Solo descartar puntuación de cierre **suelta** (con espacio inicial). Los signos de apertura `¿¡` se mantienen siempre (inician palabra). Regla: `if (/^[.,;:!?…]+$/.test(t)) return !c.text.startsWith(" ");`
- **`paddingBottom: 640`** (NO 460) — el bloque termina en y≈1280, dentro de la zona segura de TikTok/Reels. Con 460 los subtítulos caen en la franja de UI inferior (1350–1920).
- **Una sola línea SIEMPRE, tamaño fijo 74px (NUNCA achicar ni envolver a 2 líneas).** Solución: **cortar la página por ancho en `buildPages`**, no solo por cantidad de palabras. Estimar ancho de palabra (`text.length * 46px` a 74px, sobreestimado) y si `lineW + WORD_GAP + w > MAX_LINE_PX` (860) → `flush()` (página nueva). Render con `flexWrap:"nowrap"` + `whiteSpace:"nowrap"` (las páginas ya entran por construcción). Si 3 palabras no entran, son 2 páginas — nunca doble línea.

**Idea boundaries — capitalizar agresivamente durante revisión de captions:**
Cuando el Dr. termina una idea y empieza otra (aunque no haya punto ni pausa ≥380ms), capitalizar el primer token de la nueva idea para que `isSentenceBoundary` arranque una nueva página. Esto diferencia conceptos visualmente y facilita la lectura en móvil. Identificar los cambios de idea leyendo la transcripción completa antes de editar los captions.

## Portada
Estilo **blur navy abajo**: la cara del locutor queda limpia arriba y el texto va al pie sobre
un velo navy difuminado que sale del borde inferior. La **identidad la define la marca** (`brand`)
— tipografía de título, color de gancho y logo cambian por marca. **Detalle en `.claude/rules/plantillas.md`.**
- Frames 0-1 (~67ms) — thumbnail IG/TikTok. Texto al pie (`bottom: 430`, zona segura), centrado.
- **Velo SUTIL y TRANSICIONAL** (se sigue viendo la foto): `backdropFilter: blur(18px)` en la mitad inferior + `background` en degradé navy (opacidad máx ~0.62) + `maskImage` largo con alfas intermedios que disuelve el desenfoque hacia arriba en vez de cortar con línea. La legibilidad la sostiene el `textShadow` doble, no la opacidad.
- Wired: `<Sequence from={0} durationInFrames={2}><Portada ... brand={b} /></Sequence>`

`portadaBgMs` — correr `node scripts/portada_bg_pick.mjs public/proyectos/<nombre>/Ediciones/<clip>_captions.json`
y usar el `startMs` que imprime en Root.tsx.

## ThumbnailCover
- hookText: **top 270px** (dentro de la zona segura — top ≥245; arriba de la cabeza del Dr.), Inter 800, 72px, spring damping:180, dura `titleCardDurationMs` (default **5000ms** — el gancho necesita tiempo para leerse). Fuente y colores llegan por prop desde la marca (`fontFamily`, `bgColor`, `fgColor`).
- **El gancho usa fondo que ABRAZA cada línea** (estilo IG stories), NO un rectángulo único alrededor del bloque. Usar un `<span>` (no div) con `box-decoration-break: clone` (+ `WebkitBoxDecorationBreak`): cada línea lleva su propio panel redondeado. `fontSize:72, padding:"10px 28px", borderRadius:22, lineHeight:1.45, boxShadow:"0 10px 34px rgba(0,0,0,0.3)"`. Colores por marca: **beker** fondo navy `#0F2135` / texto blanco · **clubdeterapia** fondo blanco / texto navy. Contenedor padre con `textAlign:"center"`. (La Portada, en cambio, usa blur de fondo, no panel.)
- Gradiente: `linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 100%)` en la franja superior (height 22%)

## Tipografía
- **Inter ExtraBold (800)**: subtítulos (74px) y ThumbnailCover/hook (72px) — igual en ambas marcas.
- **Portada por marca** (ver `plantillas.md`): beker → Inter 900 · clubdeterapia → Geist Black + logo Instrument Serif.
- **Inter**: scenes — weight 800, lineHeight 1.25
- `paintOrder: "stroke fill"` con `WebkitTextStroke` solo cuando hay stroke (subtítulos y hook ya NO usan stroke grueso)
- (Poppins queda cargada en `index.css` por compatibilidad con proyectos viejos; ya no se usa.)

## Marca / plantilla (`brand`)
Dos marcas (`"beker"` | `"clubdeterapia"`), elegidas al arranque vía prop `brand` en Root.tsx.
Config en `src/brand.ts`; **detalle de identidad (fuentes, colores, portada, gancho) en
`.claude/rules/plantillas.md`** — cargarlo solo al elegir marca o tocar identidad. Los subtítulos
son iguales en ambas. `Reel.tsx`/`Reaction.tsx` hacen `const b = getBrand(brand)` y pasan `b`.

## Paleta
Paleta por marca → **`.claude/rules/plantillas.md`** (navy `#0F2135` común; acento beker `#DFBE9A`,
CdT `#A78768`+crema `#FCF0EA`). Scenes (paleta rehook): fondo `#f5e9d2` · texto `#162a3e` · acento
`#b18060`. El amarillo `#FFCC00` quedó deprecado.

## Safe zones (medidas del template oficial Jon Loomer, 1080×1920)
- **Vertical:** top seguro **245px** (arriba: username/follow) · bottom seguro **1534px** (abajo: caption/UI)
- **Horizontal:** laterales **71–1028px** arriba · desde y≈864 el límite derecho baja a **~887px** (notch de botones like/comentar/compartir de TikTok/Reels)
- **Subtítulos: `paddingBottom: 640`** (bloque termina en y≈1280, centrado, lejos del notch). Texto importante centrado para no chocar los botones laterales.
- **Hook/ThumbnailCover: top ≥245** (usar 270). La **portada** lleva el texto al pie (`bottom: 430`), dentro de la zona segura inferior.

## Caption para redes
Mismo texto para IG y TikTok. Guardar en `public/proyectos/<nombre>/caption.txt`. ~2.200 chars. Registro por defecto rioplatense ("vos/sos/hacés"), cercano pero profesional, sin CTAs genéricos.

**Contexto por perfil (CRÍTICO):** antes de escribir, cargar el bloque de la marca del reel en
**`.claude/rules/perfiles-caption.md`** — define público, registro/voz, contexto institucional,
cómo nombrar al orador (con su cargo), CTA típico y hashtags. Ese perfil puede pisar los defaults
de arriba (ej. `foropsiquiatria` es registro formal, público profesional, contexto Fundación Foro,
CTA institucional — NO lead magnet).

Antes de escribir el caption, preguntar: **¿CTA de engagement o lead magnet? Si es lead magnet, ¿qué comentar y qué reciben?** (salvo que el perfil ya fije el tipo de CTA, ej. foropsiquiatria = institucional). En temas sensibles (suicidio, autolesión, consumo) incluir **líneas de ayuda** locales.

Estructura:
1. **Gancho** — la idea más provocadora. Sin emojis, sin "Hola". Directo.
2. **Desarrollo** (2-3 párrafos) — quien lea la descripción sin ver el video debe entender el concepto central. Retomar el hilo del video pero profundizar: agregar contexto, ejemplos o perspectiva que no estén en el video. No transcribir frases literales del video.
3. **Cierre** — frase que se quede
4. **CTA** — según respuesta:
   - Engagement: invitar a comentar algo concreto ("¿A vos qué te pasa cuando…?")
   - Lead magnet: "Comentá X y te mando [recurso]"
5. Línea en blanco + tres líneas `.`
6. **Hashtags SEO** (12-15, mix alta búsqueda + nicho): `#saludmental #psiquiatria #neurociencia #bienestar #ansiedad #depresion #saludmentalargentina #saludmentallatam #terapia #cerebro #neuroplasticidad #mindfulness`

Sin clichés: "date permiso", "sanar", "empoderar", "tu versión más auténtica"

## Errores frecuentes
| Error | Causa | Fix |
|-------|-------|-----|
| Línea blanca en escenas | `borderRadius` en div con transform | `width: 1` sin borderRadius + `overflow: "hidden"` en AbsoluteFill |
| Subtítulo mezcla oraciones | `isSentenceBoundary` no detecta mayúscula | Añadir `/^[A-ZÁÉÍÓÚÜÑ]/` al check |
| Token hallucination | Whisper confunde palabra poco común | `caps[i].text=' correcto'`, `endMs=caps[j].endMs`, `splice(i+1, n)` |
| Token zero-duration | `startMs === endMs` | `caps[i].endMs = caps[i].startMs + 50` |
| Silencio residual | PAD_SEC=0.15 deja ~300ms | 2da pasada ffmpeg filter_complex concat |
| `objectFit` warning | Video recibe `style.objectFit` | Mover a prop `objectFit` del componente |
