# Base — Workflow Reels Dr. Beker
Composición: `Plantilla-DrBeker-Reels` | 1080×1920 @ 30fps | h264

## Flujo (10 pasos)
1. Video crudo: usar la ruta del video que pase el usuario (carpeta de crudos/screencasts propia)
2. Crear `public/proyectos/<nombre>/{Crudos,ediciones,final}/` y mover el video crudo a `Crudos/`
3. Detect silences: `ffmpeg -i input.mp4 -af silencedetect=noise=-35dB:d=2.0 -f null -` — PAD_SEC=0.15
4. Cut: `scripts/remove_silences.py` → `clip_edit.mp4`
   **Cierre del video:** Siempre verificar que el último segmento incluya la palabra final completa más ~300–500ms de silencio de impacto después. El Dr. cierra con una frase contundente — cortarla a mitad o sin silencio de asiento arruina el remate. Extender el último segmento si hace falta. **CRÍTICO: No aplicar un corte de silencio que tape la última palabra** — si la última sílaba cae dentro de un silencio detectado, mantenerla completa y agregar el buffer manualmente en el segmento final antes de correr `remove_silences.py`.
5. 2da pasada: revisar silencios residuales (<300ms tras frases clave), cortar con ffmpeg filter_complex concat
6. Transcribe: `node scripts/transcribe.mjs public/proyectos/<nombre>/ediciones/<clip>.mp4` — `<clip>` es `clip_edit2` si hubo 2da pasada, `clip_edit` si no. Escribe `<clip>_captions.json` al lado del video; **todos los scripts de este documento y de la skill leen ese mismo archivo** (usar el nombre del clip que se transcribió, no uno fijo).
7. Revisar captions: corregir alucinaciones, fusionar tokens, ajustar zero-duration (`endMs = startMs + 50`)
8. Root.tsx: `videoSrc`, `captionsSrc`, `bgMusicSrc`, `hookText`, `titleCardDurationMs`, `durationSeconds`
9. Render: `npx remotion render Plantilla-DrBeker-Reels public/proyectos/<nombre>/final/<nombre>.mp4`
10. **Cierre/archivado (SOLO con confirmación del usuario, video ya terminado y aprobado).**
    `public/` no debe acumular videos: lo que Remotion no necesita renderizar, sale de `public/` (si no,
    cada bundle copia GB de más). Al cerrar un reel, **preguntar** "¿archivo este proyecto?" y si confirma:
    ```bash
    bash scripts/archive_project.sh <nombre>
    ```
    Divide el proyecto en dos, **ambos fuera de `public/`** (nada se borra, todo recuperable):
    - `Crudos/` + `ediciones/` (material de trabajo pesado) → `_archivo/<nombre>/`
    - `final/` + `caption.txt` (el entregable) → `Finales/<nombre>/`
    - snapshot de `src/Reel.tsx` + `src/Root.tsx` → `_archivo/<nombre>/src/` y **reset del
      código a la plantilla en blanco** (`templates/`), para que el próximo video arranque limpio.
    Y elimina la carpeta `public/proyectos/<nombre>/` ya vacía. Para re-renderizar más tarde, mover de
    vuelta `_archivo/<nombre>/{Crudos,ediciones}` a `public/proyectos/<nombre>/`. **Nunca correr este paso
    sin confirmación** ni con un render pendiente o sin aprobar.

## Subtitles
- mergeIntoWords: token sin espacio inicial = continuación de palabra anterior
- isSentenceBoundary: detecta `.!?…`, `¿¡`, o inicio con mayúscula `/^[A-ZÁÉÍÓÚÜÑ]/`
- GAP_THRESHOLD_MS=380 | MAX_WORDS_PER_PAGE=3
- **Tipografía: Poppins ExtraBold (800), blanca `#FFFFFF`**, sin contorno negro grueso — solo sombra suave en capas (`textShadow: "0 4px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.45)"`). fontSize 74, letterSpacing -0.01em. Cargar Poppins en `index.css` (`@import` Google Fonts).
- **Animación: aparición palabra por palabra.** Cada palabra de la página se revela cuando el Dr. la dice (no toda la página de golpe): `spring` por palabra con `frame: Math.max(0, frame - wordStartFrame)`, config `{ damping: 20, stiffness: 340 }`. Efecto: fade (0→1, sobre `enter [0,0.55]`) + sube (`translateY` 12→0) + micro-escala (0.95→1). Snappy y sutil.
- **Sincronía con el audio (CRÍTICO):** el spring tarda ~3-4 frames en hacerse visible → la palabra parece llegar con delay. Compensar con `LEAD_MS = 90`: `wordStartFrame = round((word.fromMs - LEAD_MS - page.startMs)/1000*fps)`. La palabra queda visible justo cuando el Dr. la pronuncia.
- **Cierre de signos (CRÍTICO):** Whisper a veces emite la puntuación de cierre (`?`/`!`/`.`) como token aparte SIN espacio inicial. El filtro de limpieza NO debe descartarla: si es continuación (sin espacio) se mantiene y se fusiona en la palabra previa (`"hago" → "hago?"`). Solo descartar puntuación de cierre **suelta** (con espacio inicial). Los signos de apertura `¿¡` se mantienen siempre (inician palabra). Regla: `if (/^[.,;:!?…]+$/.test(t)) return !c.text.startsWith(" ");`
- **`paddingBottom: 640`** (NO 460) — el bloque termina en y≈1280, dentro de la zona segura de TikTok/Reels. Con 460 los subtítulos caen en la franja de UI inferior (1350–1920).
- **Una sola línea SIEMPRE, tamaño fijo 74px (NUNCA achicar ni envolver a 2 líneas).** Solución: **cortar la página por ancho en `buildPages`**, no solo por cantidad de palabras. Estimar ancho de palabra (`text.length * 46px` a 74px Poppins 800, sobreestimado) y si `lineW + WORD_GAP + w > MAX_LINE_PX` (860) → `flush()` (página nueva). Render con `flexWrap:"nowrap"` + `whiteSpace:"nowrap"` (las páginas ya entran por construcción). Si 3 palabras no entran, son 2 páginas — nunca doble línea.
- **Énfasis sutil de palabras clave en cobre `#DFBE9A`** (NO tipografía distinta — mezclar fuentes ensucia). Pocas palabras (≈6 en todo el video), atadas a los momentos de zoom/click (mismas frases de impacto). `const EMPHASIS_MS = [...]; isEmphasis = w => EMPHASIS_MS.some(m => Math.abs(w.fromMs-m)<=90)`. No saturar: el color + zoom + sonido deben coincidir en la misma palabra.

**Idea boundaries — capitalizar agresivamente durante revisión de captions:**
Cuando el Dr. termina una idea y empieza otra (aunque no haya punto ni pausa ≥380ms), capitalizar el primer token de la nueva idea para que `isSentenceBoundary` arranque una nueva página. Esto diferencia conceptos visualmente y facilita la lectura en móvil. Identificar los cambios de idea leyendo la transcripción completa antes de editar los captions.

## Portada
- Frames 0-1 (~67ms) — thumbnail IG/TikTok
- Texto a `top: 45%` (864px) — dentro del safe zone feed (4:5)
- Línea blanca: Montserrat 900, 100px, uppercase, stroke `2px rgba(0,0,0,0.35)`
- Línea de gancho: **cobre/accent de marca `#DFBE9A`** (NO amarillo #FFCC00 — no es de la marca), Montserrat 900, 118px, uppercase
- **Sombreado del párrafo = blur de fondo MUY SUTIL, DETRÁS del texto** (blob oscuro suave, NO una caja cuadrada ni un halo sobre la tipografía). Div hermano con `zIndex:0` + el blob es `position:absolute` → para que quede DETRÁS hay que dar a los divs de texto `position:"relative", zIndex:1` (si no, el absoluto pinta encima). Blob: `inset:"-60px -36px", background:"radial-gradient(closest-side, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.20) 55%, rgba(0,0,0,0) 100%)", filter:"blur(32px)"`. Texto con `textShadow` sutil (`0 3px 16px rgba(0,0,0,0.35)`).
- Wired en Reel.tsx: `<Sequence from={0} durationInFrames={2}><Portada /></Sequence>`

`portadaBgMs` — correr este script y usar el `startMs` resultante en Root.tsx:
```bash
node -e "
const caps = JSON.parse(require('fs').readFileSync('public/proyectos/[nombre]/ediciones/<clip>_captions.json'));
const END_PUNCT = /[.!?…]/;
const good = caps.filter(c =>
  c.confidence > 0.6 &&
  c.endMs > c.startMs + 100 &&
  c.startMs > 3000 && c.startMs < 15000 &&
  !END_PUNCT.test(c.text.trim()) &&
  c.text.startsWith(' ')
);
const pick = good[Math.floor(good.length / 2)];
console.log('portadaBgMs:', pick.startMs, '|', pick.text.trim(), '@', pick.startMs + 'ms');
"
```

## ThumbnailCover
- hookText: **top 270px** (dentro de la zona segura — top ≥245; arriba de la cabeza del Dr.), Poppins 800, 76px, blanco, spring damping:180, dura `titleCardDurationMs` (default **5000ms** — el gancho necesita tiempo para leerse)
- **El gancho usa fondo de color de marca que ABRAZA cada línea** (estilo IG stories), NO un rectángulo único alrededor del bloque. Usar un `<span>` (no div) con `box-decoration-break: clone` (+ `WebkitBoxDecorationBreak`): cada línea de texto lleva su propio panel redondeado que se ajusta a su ancho. `fontSize:72, color:"#FFFFFF", backgroundColor:"#0F2135", padding:"10px 28px", borderRadius:22, lineHeight:1.45, boxShadow:"0 10px 34px rgba(0,0,0,0.3)"`. Contenedor padre con `textAlign:"center"`. (La Portada, en cambio, usa blur de fondo, no panel.)
- Gradiente: `linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 100%)` en la franja superior (height 22%)

## Tipografía
- **Montserrat**: portada — weight 900, uppercase, letterSpacing -0.02em
- **Poppins ExtraBold (800)**: subtítulos (74px) y ThumbnailCover/hook (72–76px)
- **Inter**: scenes — weight 800, lineHeight 1.25
- `paintOrder: "stroke fill"` con `WebkitTextStroke` solo cuando hay stroke (subtítulos y hook ya NO usan stroke grueso)

## Paleta
Usar la **paleta de marca** (Dr. Morris Beker): navy `#0F2135` · secondary `#4A6382` · **cobre `#A78768`** · **accent-soft `#DFBE9A`** (énfasis de palabras clave en subtítulos) · neutral `#CED5DA` · background `#F7F5F2`.
Scenes (paleta rehook): fondo `#f5e9d2` · texto `#162a3e` · acento `#b18060`. El amarillo `#FFCC00` quedó deprecado (no es de la marca).

## Safe zones (medidas del template oficial Jon Loomer, 1080×1920)
- **Vertical:** top seguro **245px** (arriba: username/follow) · bottom seguro **1534px** (abajo: caption/UI)
- **Horizontal:** laterales **71–1028px** arriba · desde y≈864 el límite derecho baja a **~887px** (notch de botones like/comentar/compartir de TikTok/Reels)
- **Subtítulos: `paddingBottom: 640`** (bloque termina en y≈1280, centrado, lejos del notch). Texto importante centrado para no chocar los botones laterales.
- **Hook/ThumbnailCover: top ≥245** (usar 270). El portada-texto al 45% (864px) entra cómodo.

## Caption para redes
Mismo texto para IG y TikTok. Guardar en `public/proyectos/<nombre>/caption.txt`. ~2.200 chars, español rioplatense ("vos/sos/hacés"). Cercano pero profesional. Sin CTAs genéricos.

Antes de escribir el caption, preguntar: **¿CTA de engagement o lead magnet? Si es lead magnet, ¿qué comentar y qué reciben?**

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
