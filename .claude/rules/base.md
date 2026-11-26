# Base — Workflow Reels Dr. Beker
Composición: `Plantilla-DrBeker-Reels` | 1080×1920 @ 30fps | h264

## Flujo (10 pasos)
1. Video crudo: usar la ruta del video que pase el usuario (carpeta de crudos/screencasts propia)
2. `bash scripts/new_project.sh <nombre>` crea `public/proyectos/<nombre>/{Crudos,Ediciones}/` (media de trabajo) y `Finales/<nombre>/` (donde va el render, fuera de `public/`). Mover el crudo a `Crudos/`. **Los finales NO van dentro de `public/`: hay UNA sola carpeta de finales, `Finales/<nombre>/`.**
3–4. **Cortar silencios ≥ 0,10 s (DEFAULT desde 2026-11-17, pedido de Morris: "el corte se hace con silencios mayores a 0.10 seg"):**
   ```bash
   python3 scripts/desilence.py public/proyectos/<nombre>/Crudos/<crudo>.MP4 \
     public/proyectos/<nombre>/Ediciones/clip_edit.mp4 public/proyectos/<nombre>/Ediciones/clip_edit_keep.json
   ```
   Toda pausa con ≥ 0,10 s de silencio real queda en ~0,08 s (0,04 s de aire por lado); nunca corta dentro del habla, bordes a frame exacto + fundido de 8 ms. **Umbral `--noise auto` (default): piso de ruido del crudo + 12 dB, nunca por encima de -42.** Un -42 dB fijo se comió palabras enteras en un crudo grabado bajo (voz a -40/-54 dB, piso -73 → umbral -61; el 2026-11-17, "y una vida más complicada" quedó en 0,3 s y Whisper inventó otra frase). **Tomas repetidas / recortes de fluidez aprobados:** sacarlos en la misma pasada desde el crudo con `--exclude 0-11.0,31.8-38.2` (segundos del CRUDO, bordes dentro de silencio): un solo encode, denoise/loudnorm una vez. Para ubicar una toma, transcribir tramos cortos del crudo (`ffmpeg -ss A -to B` → `transcribe.mjs`): Whisper sobre el clip entero puede "corregir" una repetición inventando texto. Recorta el aire inicial (deja 0,15 s antes de la primera palabra) y deja **0,40 s de silencio de impacto tras la última palabra** (detecta la cola suave de la última sílaba hasta -55 dB, así no se come el remate). Aplica **denoise `arnndn` + `loudnorm`** una sola vez, acá. `--dry-run` informa la duración final sin codificar. **Tramos de solo ruido (desde 2026-11-18):** con el umbral auto (~-60 dB) un roce de mano / tocar el mic / el gesto de pausar la grabación (pico ~-59 dB) contaba como habla y `--min-seg` lo estiraba a 0,5 s → pausa muerta con la mano en cuadro + "fritura" que loudnorm amplifica (Morris, 18/11). Ahora se descarta todo tramo cuyo pico de envolvente no llegue a `--min-voice` (-50 dB; la voz pica a -22/-35). **Golpes secos (desde 2026-11-22):** tocar/agarrar el celular pica a -43 dB (pasa `--min-voice`) pero dura 10 ms, y `--min-seg` lo estiraba a 0,5 s de Morris callado acercándose a la cámara (psicologo-o-psiquiatra ~0:06; Morris tuvo que marcarlo dos veces). Ahora también se descarta todo tramo con menos de `--min-voiced` 0,08 s por encima de -45 dB (el habla más corta medida: 0,38 s). **Control obligatorio tras el corte:** listar los tramos del keep.json de ≤ 0,6 s y mirar sus cuadros; un tramo de exactamente 0,50 s es casi siempre ruido estirado por `--min-seg`. Para re-cortar un clip ya hecho respetando sus cortes (y `--exclude` viejos no registrados): `--keep-from <keep.json viejo>`; remapear los captions vía tiempo del crudo (keep viejo → nuevo), no retranscribir. Sin numpy (python del sistema). Ya NO se usa `silencedetect d=2.0` + `remove_silences.py` (solo sacaba pausas largas; queda como legacy: `--d 2.0 --pad 0.15` reproduce ese modo).
   **Cierre del video:** verificar igual que el final incluya la palabra completa + ~300–500 ms. Si el remate queda cortado, subir `--tail`.
5. 2da pasada: ya no hace falta para silencios residuales (el corte a 0,10 s los saca). Queda solo para **recortes de fluidez aprobados** (frases enteras, bordes en pausa < -42 dB).
6. Transcribe: `node scripts/transcribe.mjs public/proyectos/<nombre>/Ediciones/<clip>.mp4` (whisper **large-v3 con división por palabra** desde 2026-09-08 — `medium` derivaba los timestamps; `--model medium` para volver) — `<clip>` es `clip_edit2` si hubo 2da pasada, `clip_edit` si no. **Nunca dos transcripciones a la vez** (whisper.cpp escribe siempre en `vertical-reel/tmp.json` → se pisan; encolarlas). Escribe `<clip>_captions.json` al lado del video; **todos los scripts de este documento y de la skill leen ese mismo archivo** (usar el nombre del clip que se transcribió, no uno fijo).
   **Si `large-v3` muere con `SIGKILL` (falta de RAM — máquina con Firefox/Chromium abiertos consume 25+ GB):** NO caer directo a `--model medium`: en el 2026-09-10 introdujo alucinaciones (repitió frases) y **se comió una oración entera** en el cierre de un video. Alternativa más segura si ya existe una transcripción `large-v3` previa (del clip antes del 2do corte): remapear esos tokens al nuevo timeline con offsets por segmento (restar/sumar ms según los tramos que se cortaron) en vez de retranscribir — conserva la precisión de `large-v3` sin gastar RAM. Si no hay transcripción previa que remapear, ahí sí usar `medium` pero revisar el texto contra lo que dice el Dr. con más cuidado de lo habitual (comparar frase por frase, no solo mirar timestamps).
7. Revisar captions: corregir alucinaciones, fusionar tokens, ajustar zero-duration (`endMs = startMs + 50`)
8. Root.tsx: `videoSrc`, `captionsSrc`, `bgMusicSrc`, `hookText`, `titleCardDurationMs`, `durationSeconds`
9. Render: `bash scripts/render_reel.sh <nombre>` (→ `Finales/<nombre>/<nombre>.mp4`). Usa un public/ reducido (symlinks a logos/, sfx/ y solo `proyectos/<nombre>`): con proyectos sin archivar, public/ llegó a 15 GB y el bundle moría por RAM (2026-11-18). Nunca correr el render en paralelo con una transcripción (propia o de otra sesión, ej. reel-kit `words_es.py`).
   **Si tira `delayRender() was called but not cleared` / `Target closed` / `ProtocolError`:** casi siempre falta de RAM (misma causa que el punto 6, no un bug del render). Reintentar con `--concurrency=2` en vez de bajar calidad o tocar código.
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
- **`paddingBottom: 500`** (desde 2026-11-18; antes 640) — el renglón queda en y≈1330–1420: **debajo de la cara**. NO bajar a 460: en 2026-06 Morris marcó que con 460 (fin en y≈1460) se metía en la UI de TikTok/Reels. Morris: "los subtítulos tapan la cara… bajalos por debajo de la cara". Con 640 el renglón caía en y≈1190–1280, sobre boca y mentón (su barba llega a y≈1200–1300 en los encuadres de casa). **Regla dura: el subtítulo nunca tapa la cara.** En cada video nuevo, mirar 8–10 cuadros con líneas guía (ffmpeg `drawbox` en y 1200/1300/1400/1500): si el mentón baja de ~1330, avisar antes de renderizar.
- **Una sola línea SIEMPRE, tamaño fijo 74px (NUNCA achicar ni envolver a 2 líneas).** Solución: **cortar la página por ancho en `buildPages`**, no solo por cantidad de palabras. Estimar ancho de palabra (`text.length * 46px` a 74px, sobreestimado) y si `lineW + WORD_GAP + w > MAX_LINE_PX` (860) → `flush()` (página nueva). Render con `flexWrap:"nowrap"` + `whiteSpace:"nowrap"` (las páginas ya entran por construcción). Si 3 palabras no entran, son 2 páginas — nunca doble línea.

**Idea boundaries — capitalizar agresivamente durante revisión de captions:**
Cuando el Dr. termina una idea y empieza otra (aunque no haya punto ni pausa ≥380ms), capitalizar el primer token de la nueva idea para que `isSentenceBoundary` arranque una nueva página. Esto diferencia conceptos visualmente y facilita la lectura en móvil. Identificar los cambios de idea leyendo la transcripción completa antes de editar los captions.

## Portada
Estilo **blur navy abajo**: la cara del locutor queda limpia arriba y el texto va al pie sobre
un velo navy difuminado que sale del borde inferior. La **identidad la define la marca** (`brand`)
— tipografía de título, color de gancho y logo cambian por marca. **Detalle en `.claude/rules/plantillas.md`.**
- Frames 0-1 (~67ms) — thumbnail IG/TikTok. Texto al pie (`bottom: 430`, zona segura), centrado.
- **Largo de renglón (2026-11-18):** en 960px entran ~15 caracteres en el título blanco (106px) y ~14 en la línea cobre (116px). Más largo envuelve a 3-4 renglones y pierde fuerza: proponer títulos que entren en 2 renglones parejos (ej. "FUNCIONÁS, PERO / NO ESTÁS BIEN", "¿TU TERAPIA / FUNCIONA?") y verificar el frame 0.
- **Velo SUTIL y TRANSICIONAL** (se sigue viendo la foto): `backdropFilter: blur(18px)` en la mitad inferior + `background` en degradé navy (opacidad máx ~0.62) + `maskImage` largo con alfas intermedios que disuelve el desenfoque hacia arriba en vez de cortar con línea. La legibilidad la sostiene el `textShadow` doble, no la opacidad.
- Wired: `<Sequence from={0} durationInFrames={2}><Portada ... brand={b} /></Sequence>`
- **`<Subtitles>` debe ir oculto por opacity (NO desmontado) durante los frames 0-1**, si no el primer subtítulo se solapa con el texto de la Portada en el thumbnail de feed (bug real, encontrado 2026-09-10). Ya corregido en `templates/Reel.template.tsx` y `Reaction.tsx`: `<AbsoluteFill style={{ opacity: frame < 2 ? 0 : 1 }}><Subtitles .../></AbsoluteFill>`. **Ojo:** condicionar con `{frame >= 2 && <Subtitles/>}` (desmontar) rompe el render — `Subtitles` hace `delayRender()` al montar y el fetch de captions no llega a resolver a tiempo cuando se remonta a mitad de render.

**REGLA DURA — cara digna de portada:** el frame de fondo de la portada tiene que mostrar al Dr. con **ojos abiertos**, mirando a cámara, idealmente **sonriendo** o con expresión presentable. NUNCA ojos cerrados, parpadeo, boca a mitad de sílaba rara ni barrido de movimiento. `portada_bg_pick.mjs` solo elige por captions (no ve la cara) → **siempre verificar visualmente**: armar una hoja de contactos de candidatos (ffmpeg `tile`) a lo largo del clip, elegir los mejores, mirarlos de cerca y recién ahí fijar `portadaBgMs`. Verificar también el frame 0 del render final.

`portadaBgMs` — punto de partida (después verificar la cara a ojo): correr `node scripts/portada_bg_pick.mjs public/proyectos/<nombre>/Ediciones/<clip>_captions.json`
y usar el `startMs` que imprime en Root.tsx.

## ThumbnailCover
- hookText: **top 270px** (dentro de la zona segura — top ≥245; arriba de la cabeza del Dr.), Inter 800, 76px, spring damping:180, dura `titleCardDurationMs` (default **5000ms** — el gancho necesita tiempo para leerse). Fuente y colores llegan por prop desde la marca (`fontFamily`, `bgColor`, `fgColor`).
- **El gancho es UN panel de ancho completo** (desde 2026-11-21, Morris: el cartel que abrazaba cada línea quedaba "muy estrecho", "ocupar más espacio horizontal"). `<div>` con `left/right: 36`, `fontSize:76, padding:"30px 40px", borderRadius:30, lineHeight:1.2, textWrap:"balance", boxShadow:"0 10px 34px rgba(0,0,0,0.3)"`, texto centrado. Entra ~22 caracteres por renglón: un gancho de ~45 caracteres va a 3 renglones (sigue arriba de la cabeza). Colores por marca: **beker** fondo navy `#0F2135` / texto blanco · **clubdeterapia** fondo blanco / texto navy. Ya NO se usa el `<span>` con `box-decoration-break: clone`. (La Portada, en cambio, usa blur de fondo, no panel.)
- Gradiente: `linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 100%)` en la franja superior (height 22%)

## Tipografía
- **Inter ExtraBold (800)**: subtítulos (74px) y ThumbnailCover/hook (76px) — igual en ambas marcas.
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
- **Subtítulos: `paddingBottom: 500`** (renglón en y≈1330–1420, debajo de la cara, centrado, lejos del notch). Texto importante centrado para no chocar los botones laterales.
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
| Silencio residual | Corte viejo d=2.0 (pre 2026-11-17) | `scripts/desilence.py` (default `--d 0.10`) |
| `objectFit` warning | Video recibe `style.objectFit` | Mover a prop `objectFit` del componente |
