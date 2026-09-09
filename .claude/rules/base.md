---
paths:
  - "src/components/**/*.tsx"
  - "templates/*.tsx"
---
# Base — Mecánica de los componentes (independiente del perfil)

Mecánica de los componentes de la Plantilla Dr. Beker. **Look** (paleta, tipografías, tamaños, sombras, springs, volúmenes) → `estilos/<perfil>/PERFIL.md` (default `estilos/morris-beker/PERFIL.md`). **Workflow** → `.claude/skills/reel-yapping/SKILL.md`. Este archivo se carga solo al editar `src/components/**` o `templates/`.

Composición: `Plantilla-DrBeker-Reels` | 1080×1920 @ 30fps | h264

## Subtitles (`src/components/Subtitles.tsx`)
- mergeIntoWords: token sin espacio inicial = continuación de palabra anterior
- isSentenceBoundary: detecta `.!?…`, `¿¡`, o inicio con mayúscula `/^[A-ZÁÉÍÓÚÜÑ]/`
- GAP_THRESHOLD_MS=380 | MAX_WORDS_PER_PAGE=3
- Filtro de tokens: `confidence <= 0.15` → oculto (`confidence = 0` es la forma documentada de ocultar un token); texto vacío, `[…]` y `endMs <= startMs` se descartan.
- **Animación: aparición palabra por palabra.** Cada palabra de la página se revela cuando el Dr. la dice (no toda la página de golpe): `spring` por palabra con `frame: Math.max(0, frame - wordStartFrame)` (config del spring: PERFIL › Animación). Efecto: fade (0→1, sobre `enter [0,0.55]`) + sube (`translateY` 12→0) + micro-escala (0.95→1). Snappy y sutil.
- **Sincronía con el audio (CRÍTICO):** el spring tarda ~3-4 frames en hacerse visible → la palabra parece llegar con delay. Compensar con `LEAD_MS = 90`: `wordStartFrame = round((word.fromMs - LEAD_MS - page.startMs)/1000*fps)`. La palabra queda visible justo cuando el Dr. la pronuncia.
- **Cierre de signos (CRÍTICO):** Whisper a veces emite la puntuación de cierre (`?`/`!`/`.`) como token aparte SIN espacio inicial. El filtro de limpieza NO debe descartarla: si es continuación (sin espacio) se mantiene y se fusiona en la palabra previa (`"hago" → "hago?"`). Solo descartar puntuación de cierre **suelta** (con espacio inicial). Los signos de apertura `¿¡` se mantienen siempre (inician palabra). Regla: `if (/^[.,;:!?…]+$/.test(t)) return !c.text.startsWith(" ");`
- **`paddingBottom: 640`** (NO 460) — el bloque termina en y≈1280, dentro de la zona segura de TikTok/Reels. Con 460 los subtítulos caen en la franja de UI inferior (1350–1920).
- **Una sola línea SIEMPRE, tamaño fijo (NUNCA achicar ni envolver a 2 líneas).** Solución: **cortar la página por ancho en `buildPages`**, no solo por cantidad de palabras. Estimar ancho de palabra (`text.length * 46px`, sobreestimado; calibrado para la fuente/tamaño del perfil — si cambian, recalibrar) y si `lineW + WORD_GAP + w > MAX_LINE_PX` (860) → `flush()` (página nueva). Render con `flexWrap:"nowrap"` + `whiteSpace:"nowrap"` (las páginas ya entran por construcción). Si 3 palabras no entran, son 2 páginas — nunca doble línea.
- **Sin énfasis de palabras:** todas las palabras del mismo color; no hay highlight (función eliminada 2026-09-08 por decisión de Morris).
- Fuente, tamaño, color y sombra: PERFIL › Subtítulos.

## Portada (`src/components/Portada.tsx`)
- Frames 0-1 (~67ms) — thumbnail IG/TikTok
- Texto a `top: 45%` (864px) — dentro del safe zone feed (4:5)
- Dos líneas: `titulo` (línea principal) + `linea2` (línea de gancho en color de acento). Ambas llegan desde Root.tsx (`portadaTitulo`, `portadaLinea2`); Reel.tsx no hardcodea texto de portada.
- **Sombreado del párrafo = blur de fondo MUY SUTIL, DETRÁS del texto** (blob oscuro suave, NO una caja cuadrada ni un halo sobre la tipografía). Div hermano con `zIndex:0` + el blob es `position:absolute` → para que quede DETRÁS hay que dar a los divs de texto `position:"relative", zIndex:1` (si no, el absoluto pinta encima). Valores del blob y del textShadow: PERFIL › Portada.
- `paintOrder: "stroke fill"` con `WebkitTextStroke` solo cuando hay stroke (la portada lo usa; subtítulos y hook NO usan stroke grueso).
- Fondo: frame congelado del clip en `portadaBgMs` (Root.tsx) — el candidato lo propone `scripts/captions_resumen.mjs`.
- Wired en Reel.tsx: `<Sequence from={0} durationInFrames={2}><Portada /></Sequence>`

## ThumbnailCover (gancho)
- `hookText` en **top 270px** (zona segura: top ≥245; arriba de la cabeza del Dr.); dura `titleCardDurationMs` (default **5000ms** — el gancho necesita tiempo para leerse).
- **El fondo de color ABRAZA cada línea** (estilo IG stories), NO un rectángulo único alrededor del bloque: usar un `<span>` (no div) con `box-decoration-break: clone` (+ `WebkitBoxDecorationBreak`): cada línea lleva su propio panel redondeado ajustado a su ancho. Contenedor padre con `textAlign:"center"`. (La Portada, en cambio, usa blur de fondo, no panel.)
- Gradiente oscuro en la franja superior (height 22%) para legibilidad. Colores, tamaño, padding, radio, sombra, spring y gradiente: PERFIL › Gancho.

## Safe zones (medidas del template oficial Jon Loomer, 1080×1920)
- **Vertical:** top seguro **245px** (arriba: username/follow) · bottom seguro **1534px** (abajo: caption/UI)
- **Horizontal:** laterales **71–1028px** arriba · desde y≈864 el límite derecho baja a **~887px** (notch de botones like/comentar/compartir de TikTok/Reels)
- **Subtítulos: `paddingBottom: 640`** (bloque termina en y≈1280, centrado, lejos del notch). Texto importante centrado para no chocar los botones laterales.
- **Hook/ThumbnailCover: top ≥245** (usar 270). El portada-texto al 45% (864px) entra cómodo.

## Errores frecuentes
| Error | Causa | Fix |
|-------|-------|-----|
| Línea blanca en escenas | `borderRadius` en div con transform | `width: 1` sin borderRadius + `overflow: "hidden"` en AbsoluteFill |
| Subtítulo mezcla oraciones | `isSentenceBoundary` no detecta mayúscula | Añadir `/^[A-ZÁÉÍÓÚÜÑ]/` al check |
| Token hallucination | Whisper confunde palabra poco común | `caps[i].text=' correcto'`, `endMs=caps[j].endMs`, `splice(i+1, n)` |
| Token zero-duration | `startMs === endMs` | `caps[i].endMs = caps[i].startMs + 50` (lo hace `captions_resumen.mjs --fix-zero-duration`) |
| Silencio residual | PAD_SEC=0.15 deja ~300ms | 2da pasada con `remove_silences.py --keep` |
| `objectFit` warning | Video recibe `style.objectFit` | Mover a prop `objectFit` del componente |
| Root no valida | Falta un campo requerido del schema | `titleCard`/`overlays` ya son opcionales; revisar `src/schema.ts` |
