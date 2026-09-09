---
name: reel-yapping
description: Pipeline de edición para reels verticales donde el Dr. habla a cámara con la Plantilla Dr. Beker (silencios → transcript → propuesta de títulos/escenas/recortes → zoom/clicks/rehook/escenas → render → caption). La invoca el agente `ai-video-editor` después de rutear y elegir perfil, o Morris explícito con `/reel-yapping <ruta>`. Ante "procesá este video" / "armá el reel" NO activarla directo — se lanza el agente `ai-video-editor`, que decide entre esta skill y reel-reaction.
---

# reel-yapping — pipeline de edición

## Modo de ejecución
- **Bajo `ai-video-editor`** (normal): el agente ya eligió `PERFIL` y creó el proyecto. Las pausas de esta skill son bloques `## CHECKPOINT` con los que el agente **termina su corrida**; el hilo principal se lo muestra a Morris y lo reanuda con la respuesta. Un checkpoint por corrida; nunca asumir una respuesta.
- **Directo** (`/reel-yapping`): las pausas son mensajes normales; esperar la respuesta de Morris.
- **Delegación:** si tenés la tool `Agent`, las fases A (transcribir), B (escenas) y C (render) se delegan a `subagent_type: "reel-worker"` con el prompt "Ejecutá `.claude/skills/reel-yapping/tareas/<archivo>` con NOMBRE=… CRUDO=… …" (A y C con `model: "sonnet"`; B sin `model`, prompt "Invocá la skill `reel-scenes` con este spec: …"). Si no tenés `Agent` (o Morris dice "sin subagentes"), ejecutá vos el archivo de tarea al pie de la letra.
- **Contexto:** leé este archivo + `transcript_resumen.md` + `PERFIL` (secciones que necesites) + `.claude/rules/yapping.md` en el paso 8. **Nunca** el JSON de captions completo (solo tokens puntuales con `node -e`), nunca `src/components/scenes/*`, nunca `CLAUDE-YOUTUBE.md`/`CLAUDE-REF.md`/`REEL-MANUAL.md`.
- `PERFIL` default: `estilos/morris-beker/PERFIL.md`. Todo valor de look sale de ahí.

## Paso 0 — Setup
Si falta la ruta del video, pedirla. **No pedir el hook al inicio** (se define con el transcript).
```bash
bash scripts/new_project.sh <slug-provisional> <perfil> <ruta-crudo>   # resetea src/ a la plantilla, crea carpetas, mueve el crudo, escribe PIPELINE.md, línea en REELS.md
```
Slug provisional = fecha `YYYY-MM-DD-<3-palabras>`; el definitivo se decide en el CHECKPOINT. Mantener `public/proyectos/<slug>/PIPELINE.md` (formato en el agente) actualizado al cerrar cada fase.

## Fase A — Transcribir (worker, sonnet)
`tareas/A-transcribir.md` con `NOMBRE`, `CRUDO`, `MODO=inicial`. Devuelve una línea; leer `ediciones/transcript_resumen.md` (~100 líneas: transcript por oración con ms, repeticiones, tokens dudosos, pausas, última palabra, `portadaBgMs`). Si dice `REVISAR` en última palabra y el worker no lo resolvió, re-lanzar A con `EXTEND_LAST=0.4`.

## Paso 7 — Revisión y PAUSA OBLIGATORIA (un solo mensaje)
Leer el resumen completo. Antes de tocar Root.tsx, Reel.tsx o renderizar, presentar la propuesta entera y **esperar**. Guardar el mismo texto en `ediciones/propuesta.md`. Contenido:

1. **Título de portada** — aparece en el feed (grid IG/TikTok). Breve, 1–2 líneas en mayúsculas, genera curiosidad para abrir. Ej: "CALLATE LA / BOCA." 2–3 opciones con una línea de justificación.
2. **Gancho / hook** — texto de los primeros 2–3 s (ThumbnailCover). Toca un dolor concreto o una pregunta urgente para frenar el scroll. Suele ser distinto al título. 2–3 opciones justificadas.
3. **Rehook (evaluar si aplica)** — placa corta que confirma o tensiona el gancho ("La respuesta corta: SÍ.", "Pero hay un problema."). No obligatoria. **El timestamp debe coincidir exactamente con el momento en que el Dr. dice esa frase** — si la dice en el segundo 15, va en el 15. 1.5–2 s. Verificar que no contradiga el audio en ese instante.
4. **Escenas de concepto (opcional, recomendadas)** — 1–3 momentos donde una scene full-screen refuerce o explique algo. Por cada una: timestamp, qué dice el Dr., qué haría visualmente y por qué, y si reutiliza una scene del catálogo (`node scripts/scenes_catalog.mjs`, leer solo la tabla) o es nueva. Reglas: nunca antes de los 3 s, nunca para cerrar, 90 frames cada una. No forzar escenas.
5. **Recortes de fluidez** — segmentos que bajan retención, ordenados por impacto, con timestamp, texto exacto, duración y razón: repeticiones de contexto (mismo concepto varias veces sin info nueva), hedges largos (≥5 s de aclaraciones que diluyen la frase anterior), transiciones vacías ("y te voy a explicar por qué", "como te digo", "obviamente"). Proponer los segmentos a **conservar** en formato `KEEP`.
6. **Repeticiones detectadas** (sección del resumen) — cada una con sus segundos: ¿cuál conservar? No eliminar automático: puede ser error de grabación o repetición retórica.
7. **Música de fondo** — ¿sí (ruta) / no? (volumen del perfil, muy sutil).
8. **Caption** — ¿CTA de engagement o lead magnet? Si lead magnet: qué comentar y qué reciben.
9. **Nombre de carpeta definitivo** — kebab-case por el concepto central (ej. `ansiedad-no-se-elimina`). Nunca dejar nombre de fecha.
Si el perfil no es `morris-beker`, avisar acá que los componentes aún tienen el look por defecto (Nivel 2 pendiente).

Morris puede aprobar, ajustar o descartar por partes. **Lo que no contesta queda aprobado tal como se propuso** (regla suya, 2026-09-08): cada ítem lleva una propuesta concreta (en opciones múltiples, la primera es la recomendada), lo "opcional/extra" no se aplica salvo pedido explícito, y solo se re-pregunta lo que no tiene propuesta posible (p. ej. falta una ruta). Anotar cada decisión en `PIPELINE.md` › `decisiones:`.

## Post-aprobación
1. **Recortes** (si aprobó alguno) → worker A con `MODO=recorte`, `CRUDO=<clip actual>`, `KEEP=<segmentos>`. Re-leer el resumen nuevo: todos los timestamps de acá en adelante salen de él (cero remapeo).
2. **Escenas** (si aprobó alguna) → worker B en background con el spec (una línea por escena, ver `reel-scenes`), `NOMBRE`, `PERFIL`. Mientras corre, seguir con 3–5.
3. **Captions** (solo el orquestador toca el JSON, con `node -e` puntual): alucinaciones (`caps[i].text=' correcto'`, fusionar/`splice`), **idea boundaries** — cuando el Dr. termina una idea y empieza otra sin punto ni pausa ≥380 ms, capitalizar el primer token de la idea nueva para que `isSentenceBoundary` abra página nueva (leer el transcript completo del resumen antes de decidir); zero-duration ya corregidos por el worker; los ocultamientos que pida `scenes_snippets.md` › Captions.
4. **Renombrar** `public/proyectos/<provisional>` → `<definitivo>` (`mv`) y actualizar `REELS.md`.
5. **Root.tsx:** `videoSrc` (clip final), `captionsSrc`, `bgMusicSrc` (mp3 copiado a la carpeta del proyecto, o `""`), `hookText`, `titleCardDurationMs` (default 5000), `durationSeconds` (del resumen), `portadaBgMs` (candidato del resumen), `portadaTitulo` / `portadaLinea2` (título de portada aprobado). `titleCard`/`overlays` ya no existen.
6. **Reel.tsx** — leer ahora `.claude/rules/yapping.md`: `ZOOM_PHRASES` (6–8, sostenidos, `endMs` real de la frase; valores de escala/ramp en `PERFIL` › Animación), `PHRASE_SOUNDS` (máx 4–5, click del perfil), Rehook si aprobado. Cuando llegue el worker B: pegar los imports bajo `import { Subtitles }` y las Sequences dentro del bloque `ESCENAS DE CONCEPTO / REHOOK` antes de su `*/}` de cierre; **borrar los zooms/clicks dentro de los "Rangos cubiertos"**; aplicar la sección Captions.
7. `npx tsc --noEmit -p .` sin errores nuevos.

## Fase C — Render (worker, sonnet, background) ‖ caption
`tareas/C-render.md` con `NOMBRE`. Mientras renderiza, escribir `public/proyectos/<NOMBRE>/caption.txt` según `referencias/caption.md` con la respuesta del ítem 8. Si C devuelve ERROR, arreglar Root/Reel y relanzar C.

## Cierre
Reporte: ruta del mp4 (`final/<NOMBRE>.mp4`), `caption.txt`, decisiones aplicadas, y **preguntar** "¿archivo este proyecto?". Solo con confirmación: `bash scripts/archive_project.sh <NOMBRE> <perfil>` (entregable → `Finales/<perfil>/<año>/<fecha>-<NOMBRE>/` con mp4 + caption + portada.png + decisiones.md; pesado → `_archivo/`; `src/` vuelve a la plantilla en blanco; `REELS.md` → archivado). Nunca archivar con un render pendiente o sin aprobar.
