# PERFIL — Dr. Morris Beker (médico psiquiatra)

Look completo de los reels del Dr. Beker. Fuente de marca: `~/claude-workspace/brand-design/morris-beker/DESIGN.md` + `tokens.json`. Todo valor visual/sonoro de la plantilla vive **acá** — las rules (`base.md`, `yapping.md`) solo describen mecánica. Los componentes hoy tienen estos valores hardcodeados (Nivel 1); si este perfil cambia, hay que reflejarlo en `src/components/`.

## Identidad
- Nombre: Dr. Morris Beker · Médico Psiquiatra · psiquiatría basada en evidencia con enfoque humanista (Mindfulness, DBT, ACT).
- Esencia: cercanía · equilibrio · claridad · confianza. Dualidad **azul (mente, claridad) + cobre (calidez, presencia)**.
- Tono: voseo rioplatense ("vos/sos/hacés"), cercano pero profesional, sin clichés ("date permiso", "sanar", "empoderar", "tu versión más auténtica").
- Formato: locutor a cámara, full screen, ritmo yapping (zoom sostenido + escenas didácticas cortas).

## Paleta
- navy `#0F2135` (primary) · secondary `#4A6382` · **cobre `#A78768`** (tertiary) · primary-muted `#A4B6C4` · neutral `#CED5DA` · **accent-soft `#DFBE9A`** · surface `#FFFFFF` · background `#F7F5F2`.
- Sobre cobre el texto va en navy, no blanco (contraste). Mucho azul/neutro, poquito cobre.
- **Escenas (paleta rehook):** fondo `#f5e9d2` · texto `#162a3e` · acento `#b18060` · dimmed `rgba(22,42,62,0.35)`.
- **Escenas con blur del video de fondo** (p. ej. `NumeroConceptoScene`): acento `#DFBE9A`, texto blanco, overlay `rgba(0,0,0,0.38)` + `blur(18px)`.
- Fondo de escenas viejas `#0B1929` (azul profundo) sigue válido como variante oscura.
- Deprecado: amarillo `#FFCC00` (no es de la marca). No usarlo en escenas nuevas.

> **Look derivado de podcast-clips** (portada maestra, subtítulos "page", cartel de gancho) **sin logo/mosca y sin énfasis de palabras.** Referencia: los componentes en `~/.claude/skills/podcast-clips/assets/remotion/` (`Portada.tsx`, `SubtitlesClip.tsx` modo "page", `ThumbnailCover.tsx`). Reglas duras del perfil: (1) nada de logo/mosca/watermark; (2) subtítulos todo blanco, sin resaltado de palabras; (3) tipografía **Inter** en todo.

## Tipografía
- **Inter** en TODO el template (perfil Morris Beker).
  - Portada: línea chica 800, línea(s) grande(s) 900, uppercase, `letterSpacing -0.02/-0.03em`.
  - Subtítulos: 800, 74px, `letterSpacing -0.01em`.
  - Gancho/ThumbnailCover: 800, 62px, `letterSpacing -0.015em`.
  - Escenas: 800–900, `letterSpacing -0.02em`, `lineHeight 1.25`. Inter 600 ~52px → Rehook.
- Cargar Inter (600/700/800/900) en `index.css` (`@import` Google Fonts).
- Deprecado en este perfil: **Montserrat** (era portada) y **Poppins** (era subtítulos/gancho) → reemplazados por Inter. El `@import` puede seguir cargándolos, pero ningún componente los usa activamente.

## Subtítulos
- Inter 800, 74px, `letterSpacing -0.01em`, color `#FFFFFF`, **sin contorno negro grueso** — solo sombra suave en capas: `textShadow: "0 4px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.45)"`.
- **Página completa de golpe, sin animación por palabra** (look podcast-clips modo "page"): todas las palabras de la página aparecen juntas, instantáneas, del inicio al fin de la página. Único ajuste temporal: `LEAD_MS = 90` a nivel página (corre el inicio de la página, no por palabra).
- **Sin highlight de palabras** (decisión 2026-09-08): todas las palabras blancas, ningún color de énfasis.
- Corte de página por ancho: `CHAR_W = 48` (Inter 800 74px, sobreestimado a propósito para garantizar una sola línea; Inter es algo más angosta que Poppins).

## Portada
- Layout maestra (izquierda, tercio inferior, TODO BLANCO, sin logo):
- Línea chica de contexto (`portadaTitulo`): blanca, Inter 800, 54px, uppercase, `letterSpacing -0.02em`, `lineHeight 1.05`.
- Línea(s) grande(s) de remate (`portadaLinea2`): blanca, Inter 900, 92px, uppercase, `letterSpacing -0.03em`, `lineHeight 0.98`. Admite `\n` o ` / ` para dos líneas grandes. **92px calibrado para que un remate largo (ej "TAMBIÉN SUFREN", 14 chars, una sola línea) no cruce x≈887** — si el remate es más largo, usar ` / ` para partirlo en dos líneas grandes.
- Degradé de legibilidad desde el borde inferior (~45% del cuadro): `linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.70) 26%, rgba(0,0,0,0.38) 58%, rgba(0,0,0,0) 100%)`. Sombra del texto: `0 4px 20px rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.60)`.
- Zona segura del bloque: `left 76` · `right 200` (borde ≈880, bajo el notch) · `bottom 580` (bloque termina ≈ y1340). Sin blob radial, sin cobre, sin stroke grueso.

## Gancho (ThumbnailCover)
- Cartel **blanco** con texto **navy** (look podcast-clips), Inter 800, `fontSize:62`, `color:"#0F2135"`, `letterSpacing:-0.015em`, `lineHeight:1.14`, centrado, spring `damping:180`.
- Cartel: `backgroundColor:"#FFFFFF"`, `borderRadius:26`, `padding:"22px 34px"`, `boxShadow:"0 14px 44px rgba(0,0,0,0.38)"`, `maxWidth:"100%"`.
- Posición: ABAJO, `bottom:760` (borde inferior ≈ y1160), arriba de la banda de subtítulos (paddingBottom 640). Contenedor `left:76 / right:200` para no cruzar el notch de botones (x≈887 debajo de y≈864). Sin gradiente superior propio.

## Escenas
- Didácticas y esquemáticas: flujos con flechas, barras comparativas, listas con íconos, antes/después. No placas de texto suelto.
- Pill/tag: `backgroundColor: \`${COLOR}22\`` + `border: \`2px solid ${COLOR}88\`` + `borderRadius: 50`.
- Fade in 4 frames + fade out 10 frames, siempre. 90 frames (3 s) por scene; `NumeroConceptoScene` 60 frames (2 s).

## Animación
- **Zoom:** escala 1.08–1.14 (cierre 1.13–1.14), `RAMP_MS = 200`, sostenido durante toda la frase.
- **Springs:** palabras rápidas/punchy `damping 11, stiffness 380` · subtítulos (componente Subtitles) `damping 20, stiffness 340` · texto tipo subtítulo dentro de scenes `damping 20, stiffness 260` · tags/pills `damping 14, stiffness 320` · Rehook entrada `damping 15, stiffness 220` (slide up 80px) · número de `NumeroConceptoScene` `damping 10, stiffness 350`.
- **Duración:** máx 2 s por ítem animado; volver al locutor con fade; N Sequences cortas, nunca una larga continua.

## Sonido
- `sfx/click.mp3` **0.03** (PHRASE_SOUNDS, máx 4–5 por video) · dentro de una scene, click del elemento final 0.07.
- `sfx/woosh.mp3` 0.18 (scenes genéricas) / 0.20 (`NumeroConceptoScene`) — siempre al inicio de una scene.
- `sfx/plop.mp3` 0.12 por elemento que aparece.
- `sfx/flash.mp3` 0.20 (Rehook, sonido de cámara; `sfx/camera.mp3` si existe).
- Música de fondo (`bgMusicSrc`): **0.02**, muy sutil, nunca tapa la voz.
- Voz: loudnorm `I=-14:TP=-1.5:LRA=11` en el corte de silencios.

## Caption (redes)
- Español rioplatense, ~2.200 chars, mismo texto IG/TikTok. Estructura y CTA → `.claude/skills/reel-yapping/referencias/caption.md`.
- Hashtags base (12–15, mix alta búsqueda + nicho): `#saludmental #psiquiatria #neurociencia #bienestar #ansiedad #depresion #saludmentalargentina #saludmentallatam #terapia #cerebro #neuroplasticidad #mindfulness`.

## Assets
- `public/sfx/{click,woosh,plop,flash}.mp3` · logo: `~/claude-workspace/brand-design/morris-beker/logo/` · fuente vía Google Fonts: **Inter** (Poppins/Montserrat quedan en el `@import` solo como legado; ningún componente los usa).
