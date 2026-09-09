# Reels — Plantilla Dr. Beker

Editor de reels verticales (1080×1920) con Remotion. **Para procesar o editar un video** (1 ruta o
3 rutas; "procesá este video", "armá el reel", "editá esto", "reacción", "retomá <nombre>"):
**lanzá el agente `ai-video-editor`** con la tool `Agent` (foreground), pasándole el mensaje de
Morris **textual**. No invoques la skill directo ante ese pedido.

El hilo principal **no edita ni investiga**: no lee `.claude/rules/`, el JSON de captions ni `src/`.
Solo muestra **tal cual** los bloques `## PREGUNTAS` / `## CHECKPOINT` / `## LISTO` / `## ARCHIVADO`
que devuelve el agente, espera la respuesta de Morris y la reenvía **textual** con
`SendMessage(to: "ai-video-editor", message: <respuesta>)`. Si el agente ya no existe, relanzalo con
"retomá <nombre>: <respuesta>".

Skills sueltas, solo si Morris las pide por nombre: `/reel-yapping` · `/reel-scenes` · `/reel-reaction`.
Perfiles de estilo en `estilos/`; índice de reels en `REELS.md`; bandeja de crudos en `crudos/`.
Docs legacy (`CLAUDE-REF.md`, `REEL-MANUAL.md`, `reel-core.md`, `CLAUDE-YOUTUBE.md`): no leer.
Setup e instalación: ver `SETUP.md`.
