---
name: reel-reaction
description: Reel de reacción en vertical — primera parte en pantalla dividida (video ajeno al que se reacciona + cámara del Dr.) y segunda parte con el Dr. a pantalla completa comentando. Entrada = TRES videos (reaccionado, cámara, comentario). ESQUELETO (2026-09-08): define el flujo, el contrato de carpetas y las preguntas abiertas a resolver con el primer video real; todavía NO tiene composición Remotion ni scripts de composición. La invoca el agente `ai-video-editor` cuando Morris pasa 3 videos o dice "reacción"; no activarla directo ante "procesá este video".
---

# reel-reaction — esqueleto

## Estado
Skill en esqueleto. Hoy hace: validar entradas, crear el proyecto, mover los 3 videos y **terminar con `## PREGUNTAS — reel-reaction`**. No renderiza. Cuando llegue el primer video real, se resuelven las preguntas de abajo y se implementa la composición `Plantilla-DrBeker-Reaction` (misma paleta/tipografía/subtítulos del `PERFIL`).

## Entrada (contrato)
Tres archivos, nombres exactos dentro de `public/proyectos/<slug>/Crudos/` (si vienen de `crudos/<perfil>/<carpeta>/`, `new_project.sh` los mueve; renombrarlos si hace falta):
- `reaccion.mp4` — el video ajeno al que se reacciona (puede ser 9:16 o 16:9).
- `camara.mp4` — la cámara del Dr. grabada **mientras mira** `reaccion.mp4` (para la pantalla dividida).
- `comentario.mp4` — el Dr. a pantalla completa con su comentario/respuesta (se edita como un yapping).
Parámetros: `NOMBRE`, `PERFIL` (default `estilos/morris-beker/PERFIL.md`).

## Flujo previsto
```
Parte 1 — SPLIT (reaccion + camara)
  chequeo de sincronía (offset entre reaccion.mp4 y camara.mp4) → dos paneles verticales 1080×960 (arriba/abajo)
  → subtítulos según lo que se decida → transición
Parte 2 — FULL (comentario)
  comentario.mp4 pasa por el pipeline de reel-yapping SIN cambios: tareas/A-transcribir (silencios+transcript+resumen),
  CHECKPOINT de propuesta (título, gancho, rehook, escenas, recortes, música, CTA, nombre), Root/Reel, tareas/C-render
Portada + gancho: sobre la parte 1 (frame del split) o la 2 — a decidir por video
Salida: idéntica a yapping (final/<slug>.mp4 + caption.txt; archivo con archive_project.sh)
```

## Preguntas a resolver con el primer video real (llevar al `## PREGUNTAS`)
1. **Sincronía:** ¿la cámara se grabó viendo el video en tiempo real? ¿Cómo alineamos el offset (clap, primer gesto, o timestamp manual)?
2. **Audio en el split:** ¿se escucha el video ajeno completo, con ducking cuando habla el Dr., o mudo con subtítulos? ¿El audio de `camara.mp4` se usa o solo la imagen?
3. **Subtítulos en el split:** ¿al Dr., al video ajeno, a ambos (dos estilos), o ninguno?
4. **Layout:** proporción 50/50 vs 60/40, cuál panel arriba, y qué pasa si `reaccion.mp4` es 16:9 (recorte central vs. letterbox).
5. **Silencios:** ¿cortamos silencios en el split? Si sí, hay que cortar ambos streams idénticamente (mismos segmentos `--keep` en los dos).
6. **Transición** split → full: corte seco, wipe, zoom al panel del Dr.
7. **Portada y gancho:** frame del split (muestra el video reaccionado) o frame del Dr.
8. **Duración tope** y cuánto del video ajeno se muestra (derechos / atribución en el caption).
9. **Atribución:** cómo se nombra al autor del video reaccionado (en pantalla, en el caption, ambos).

## Nota técnica para la composición (cuando se implemente)
`@remotion/media` `<Video>` **ignora `objectFit: "cover"`**: conserva el aspecto del archivo y la altura pedida, así que un 16:9 dentro de un panel queda como franja con negro. Hacer el cover a mano: fijar la ALTURA del panel, dejar que el ancho se derive del aspecto, y centrar con `overflow: hidden` (gotcha documentado en `podcast-clips/assets/remotion/CropVideo.tsx`, que también trae el crop suave con `RAMP_SEC`). Subtítulos, portada, gancho y escenas: reutilizar los componentes de `src/components/` tal cual (mecánica en `.claude/rules/base.md`, look en `PERFIL`).

## Qué hace hoy (paso a paso)
1. Verificar que existan las 3 rutas (`test -f`); si falta una, pedirla y parar.
2. `bash scripts/new_project.sh <slug-provisional> <perfil> <carpeta-o-primer-video>`; mover/renombrar los 3 archivos a `Crudos/{reaccion,camara,comentario}.mp4`. `PIPELINE.md` → `tipo: reaction`.
3. `ffprobe` de los 3 (duración, resolución, fps) y anotarlo en `PIPELINE.md`.
4. Terminar la corrida con:
```
## PREGUNTAS — reel-reaction (<slug>)
Hecho: proyecto creado, 3 videos en Crudos/ (reaccion <dur>/<res>, camara <dur>/<res>, comentario <dur>/<res>).
La skill está en esqueleto: para producir este reel hay que definir primero:
1. … (las 9 preguntas de arriba, con una recomendación por defecto en cada una)
Cuando Morris responda, se implementa la composición y se continúa por la Parte 2 con reel-yapping.
```
