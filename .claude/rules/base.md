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
- **Animación: página completa de golpe, SIN animación por palabra** (look podcast-clips modo "page"). Todas las palabras de la página se renderizan juntas, instantáneas (sin fade/escala/spring), desde el inicio de la página hasta su fin. No hay timing por palabra.
- **Sincronía con el audio:** único ajuste temporal = `LEAD_MS = 90` a nivel PÁGINA (no por palabra): el inicio de la página se corre `startFrame = round((page.startMs - LEAD_MS)/1000*fps)` para que la página no llegue tarde. El fin se calcula al inicio de la próxima página (última: `+400ms`).
- **Cierre de signos (CRÍTICO):** Whisper a veces emite la puntuación de cierre (`?`/`!`/`.`) como token aparte SIN espacio inicial. El filtro de limpieza NO debe descartarla: si es continuación (sin espacio) se mantiene y se fusiona en la palabra previa (`"hago" → "hago?"`). Solo descartar puntuación de cierre **suelta** (con espacio inicial). Los signos de apertura `¿¡` se mantienen siempre (inician palabra). Regla: `if (/^[.,;:!?…]+$/.test(t)) return !c.text.startsWith(" ");`
- **`paddingBottom: 640`** (NO 460) — el bloque termina en y≈1280, dentro de la zona segura de TikTok/Reels. Con 460 los subtítulos caen en la franja de UI inferior (1350–1920).
- **Una sola línea SIEMPRE, tamaño fijo (NUNCA achicar ni envolver a 2 líneas).** Solución: **cortar la página por ancho en `buildPages`**, no solo por cantidad de palabras. Estimar ancho de palabra (`text.length * CHAR_W`; `CHAR_W = 48` calibrado para Inter 800 74px, sobreestimado a propósito — si cambia fuente/tamaño, recalibrar) y si `lineW + WORD_GAP + w > MAX_LINE_PX` (860) → `flush()` (página nueva). Render con `flexWrap:"nowrap"` + `whiteSpace:"nowrap"` (las páginas ya entran por construcción). Si 3 palabras no entran, son 2 páginas — nunca doble línea.
- **Sin énfasis de palabras:** todas las palabras del mismo color; no hay highlight (función eliminada 2026-09-08 por decisión de Morris).
- Fuente, tamaño, color y sombra: PERFIL › Subtítulos.

## Portada (`src/components/Portada.tsx`)
- Frames 0-1 (~67ms) — thumbnail IG/TikTok
- Layout maestra (derivado de podcast-clips, SIN logo/mosca): bloque de texto **alineado a la izquierda en el tercio inferior**, todo blanco.
  - `titulo` = línea CHICA de contexto (arriba); `linea2` = línea(s) GRANDE(s) de remate (abajo). `linea2` admite `\n` o ` / ` para dos líneas grandes. Ambas llegan desde Root.tsx (`portadaTitulo`, `portadaLinea2`); Reel.tsx no hardcodea texto de portada.
  - Geometría (zonas seguras): contenedor `left:76` · `right:200` (borde derecho ≈880, bajo el notch x≈887) · `bottom:580` (el bloque termina ≈ y1340, dentro del bottom seguro 1534). `flexDirection:column`, `alignItems:flex-start`.
- **Legibilidad por degradé, NO por blob ni caja:** degradé oscuro desde el borde inferior (`height:"45%"`, `linear-gradient(to top, …0.88 → 0)`). Sin blob radial, sin `WebkitTextStroke`, sin cobre — todo blanco con sombra suave (valores: PERFIL › Portada).
- Fondo: frame congelado del clip en `portadaBgMs` (Root.tsx, `<Sequence>` propio en Reel.tsx detrás de la Portada) — el candidato lo propone `scripts/captions_resumen.mjs`. `Portada` soporta `bgSrc` por si se quiere hornear la foto en el componente, pero hoy no se usa.
- Wired en Reel.tsx: `<Sequence from={0} durationInFrames={2}><Portada /></Sequence>`

## ThumbnailCover (gancho)
- Cartel **único blanco con texto navy** (look podcast-clips), redondeado, sombra suave; el texto corre **centrado dentro** del cartel (`whiteSpace:"pre-line"` respeta saltos manuales). Dura `titleCardDurationMs` (default **5000ms** — el gancho necesita tiempo para leerse).
- **Posición ABAJO** (no arriba): `bottom:760` (borde inferior ≈ y1160), apoyado arriba de la banda de subtítulos (paddingBottom 640 → banda ≈ y1190–1280) para no pisarla. Contenedor `left:76 / right:200` para no cruzar el notch de botones de TikTok/Reels (x≈887 debajo de y≈864). El cartel se achica al ancho del texto (`maxWidth:"100%"`, `alignItems:"center"`).
- Sin gradiente superior propio (el cartel blanco ya despega del fondo; Reel.tsx aporta su degradé inferior). Colores, tamaño, padding, radio, sombra y spring: PERFIL › Gancho.
- Contrato de props: Reel.tsx pasa solo `hookText`; `bgColor` (blanco) y `fgColor` (navy) son opcionales.

## Safe zones (medidas del template oficial Jon Loomer, 1080×1920)
- **Vertical:** top seguro **245px** (arriba: username/follow) · bottom seguro **1534px** (abajo: caption/UI)
- **Horizontal:** laterales **71–1028px** arriba · desde y≈864 el límite derecho baja a **~887px** (notch de botones like/comentar/compartir de TikTok/Reels)
- **Subtítulos: `paddingBottom: 640`** (bloque termina en y≈1280, centrado, lejos del notch). Texto importante centrado para no chocar los botones laterales.
- **Hook/ThumbnailCover:** cartel abajo (`bottom:760`, borde inferior ≈y1160), arriba de la banda de subtítulos; contenedor `left:76 / right:200` (borde ≈880) para esquivar el notch de botones.
- **Portada:** bloque de texto en el tercio inferior a la izquierda (`left:76`, `right:200`, `bottom:580`, termina ≈y1340).

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
