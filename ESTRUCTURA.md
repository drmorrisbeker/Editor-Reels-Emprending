# Estructura del repo — dónde está cada cosa

Mapa de orientación del editor de reels (Plantilla Dr. Beker). Fuente de verdad del
workflow: `.claude/rules/`. Setup/instalación: `SETUP.md`.

## Entrada (cómo se arranca un reel)
- **Agente `reel-editor`** (universal, en `~/.claude/agents/`) — pregunta marca, detecta tipo
  (yapping vs reacción) y despacha a la skill. Invocable desde cualquier carpeta.
- **Skills** (`.claude/skills/`): `reel-yapping` (locutor full-screen) · `reel-reaction`
  (pantalla dividida, 3 videos).

## Reglas (`.claude/rules/`) — fuente de verdad, se cargan on-demand
| archivo | qué contiene |
|---|---|
| `base.md` | workflow común: cortes, transcripción, subtítulos, portada, gancho, caption |
| `yapping.md` | zoom, PHRASE_SOUNDS, rehook, concept scenes (solo yapping) |
| `reaction.md` | formato split (40% arriba / 60% abajo) + opinión full-screen (solo reacción) |
| `plantillas.md` | las 3 marcas (beker / clubdeterapia / foropsiquiatria): colores, fuentes, portada, logo |
| `scenes.md` | catálogo de las ~48 escenas reutilizables (qué muestra / cuándo / props) |

## Código (`src/`)
- `brand.ts` — config de las 3 **marcas** (`BRANDS`, `getBrand`). Tocar colores/fuentes acá.
- `schema.ts` / `reactionSchema.ts` — props (zod) de cada composición.
- `Reel.tsx` — composición **yapping** (`Plantilla-DrBeker-Reels`). Se edita por-video (zoom/escenas).
- `Reaction.tsx` — composición **reacción** (`Plantilla-DrBeker-Reaccion`). Props-driven, estable.
- `Root.tsx` — registra ambas composiciones + sus defaultProps. `index.css` — fuentes.
- `components/` — `Portada`, `ThumbnailCover`, `Subtitles` (compartidos) + escenas sueltas.
- `components/scenes/` — librería de escenas (ver catálogo en `scenes.md`).

## Plantillas en blanco (`templates/`)
`Reel.template.tsx` + `Root.template.tsx` — estado limpio que `new_project.sh` copia a `src/`
al empezar un video. (No hay template de `Reaction.tsx`: es estable.)

## Scripts (`scripts/`)
- `new_project.sh <nombre>` — crea `public/proyectos/<nombre>/{Crudos,Ediciones,Final}` + resetea src.
- `archive_project.sh <nombre>` — cierra: Crudos+Ediciones → `_archivo/`, Final+caption → `Finales/`.
- `remove_silences.py` — corta silencios → clip editado.
- `transcribe.mjs` (`transcribe-en.mjs`) — whisper large-v3 palabra-por-palabra → `_captions.json`.
- `detect_repeats.mjs` — secuencias de 3 palabras repetidas en los captions.
- `portada_bg_pick.mjs` — elige `portadaBgMs` desde los captions.
- `reaction_captions_merge.mjs` — une captions react+opinión con offset (solo reacción).
- `scenes_catalog.mjs` — aid de mantenimiento del catálogo de escenas.

## Media de trabajo (bajo `public/`, lo que Remotion necesita)
```
public/
  proyectos/<nombre>/
    Crudos/      ← videos crudos originales
    Ediciones/   ← clips cortados + *_captions.json + assets de trabajo
    Final/       ← el reel renderizado
    caption.txt  ← copy para redes
  logos/         ← logos de marca (ej. foropsiquiatria.png, clubterapia-navy-sinbarras.png)
  sfx/           ← efectos de sonido (click, woosh, plop…)
```
Los .mp4/.png/.mp3 de `proyectos/` están gitignoreados (no se versionan).

## Archivo (FUERA de `public/`, gitignoreado — no se copia en cada bundle de Remotion)
- `_archivo/<nombre>/` — Crudos + Ediciones (material pesado) + snapshot de `src/` del video.
- `Finales/<nombre>/` — Final + caption.txt (el entregable).
- `_render_hold/` — proyectos viejos en pausa.

## Docs / config
`docs/` (material legacy: CLAUDE-REF, reel-core, REEL-MANUAL, scene-preview) · `SETUP.md`
(instalación) · `CLAUDE.md` (guía del proyecto) · `README.md` (boilerplate Remotion).

## Ciclo de vida de un proyecto
`new_project.sh` → trabajar en `public/proyectos/<nombre>/` → render a `Final/` →
(con confirmación) `archive_project.sh` → queda en `_archivo/` + `Finales/`, y `public/` limpio.
