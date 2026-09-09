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

## Tipografía
- **Montserrat** 900, uppercase, `letterSpacing -0.02em` → portada.
- **Poppins ExtraBold (800)** → subtítulos (74px) y gancho/ThumbnailCover (72–76px). Cargar Poppins en `index.css` (`@import` Google Fonts).
- **Inter** 800–900, `letterSpacing -0.02em`, `lineHeight 1.25` → escenas. Inter 600 ~52px → Rehook.

## Subtítulos
- Poppins 800, 74px, `letterSpacing -0.01em`, color `#FFFFFF`, **sin contorno negro grueso** — solo sombra suave en capas: `textShadow: "0 4px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.45)"`.
- **Sin highlight de palabras** (decisión 2026-09-08): todas las palabras blancas, ningún color de énfasis.

## Portada
- Línea principal (`portadaTitulo`): blanca, Montserrat 900, 100px, uppercase, stroke `2px rgba(0,0,0,0.35)`.
- Línea de gancho (`portadaLinea2`): **accent-soft `#DFBE9A`** (NO amarillo), Montserrat 900, 118px, uppercase.
- Blob de sombreado detrás del texto: `inset:"-60px -36px"`, `background:"radial-gradient(closest-side, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.20) 55%, rgba(0,0,0,0) 100%)"`, `filter:"blur(32px)"`. Texto con `textShadow: "0 3px 16px rgba(0,0,0,0.35)"`.

## Gancho (ThumbnailCover)
- Poppins 800, `fontSize:72`, `color:"#FFFFFF"`, spring `damping:180`.
- Panel por línea: `backgroundColor:"#0F2135"`, `padding:"10px 28px"`, `borderRadius:22`, `lineHeight:1.45`, `boxShadow:"0 10px 34px rgba(0,0,0,0.3)"`.
- Gradiente superior: `linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 100%)` (height 22%).

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
- `public/sfx/{click,woosh,plop,flash}.mp3` · logo: `~/claude-workspace/brand-design/morris-beker/logo/` · fuentes vía Google Fonts (Poppins, Montserrat, Inter).
