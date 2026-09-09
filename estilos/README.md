# estilos/ — perfiles de estilo

Un perfil = una carpeta `estilos/<perfil>/PERFIL.md` con **todo el look** de los reels de esa persona/marca (paleta, tipografías, tamaños, springs, volúmenes, tono del caption). El look **no vive** en `.claude/rules/` (solo mecánica) ni en las skills (solo workflow).

- Crear un perfil nuevo: copiar `_plantilla/` a `<perfil>/` y completar. Hasta el Nivel 2 (componentes temables), un perfil distinto a `morris-beker` requiere ajustar valores en `src/components/` — el agente lo avisa.
- Cómo lo detecta el orquestador `ai-video-editor`, en este orden: (1) nombre o profesión en el mensaje de Morris ("para la nutricionista", "perfil X"); (2) carpeta de origen del crudo `crudos/<perfil>/`; (3) si existe un solo perfil en `estilos/` (sin contar `_plantilla`), lo usa y lo informa; (4) si hay ≥2 y sigue ambiguo, pregunta con la lista.
- El perfil elegido queda en `PIPELINE.md` (`perfil:`) y se pasa como `PERFIL=<ruta>` a cada skill y sub-agente; nadie lee otro archivo para valores de look.
