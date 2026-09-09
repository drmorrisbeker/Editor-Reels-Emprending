# Crudos — inbox de grabaciones

Dejá acá los **videos crudos** (grabaciones nuevas) antes de arrancar un reel.
Es el buzón de entrada: nada de esto se versiona (los videos están gitignoreados).

## Cómo se usa
1. Copiás/arrastrás la grabación cruda a esta carpeta (`Crudos/`).
2. Arrancás el proyecto con la skill/agente (o `bash scripts/new_project.sh <nombre>`),
   que crea `public/proyectos/<nombre>/{Crudos,Ediciones,Final}/`.
3. El crudo se mueve desde acá a `public/proyectos/<nombre>/Crudos/` y seguís el workflow.

Para reels de **reacción** son 3 crudos (video reaccionado, vos reaccionando, tu opinión):
dejalos acá los tres y el flujo los reparte al arrancar.

> Esta carpeta es solo el punto de entrada. El material ya en producción vive en
> `public/proyectos/<nombre>/` y los entregables finales en `Finales/` (ver `ESTRUCTURA.md`).
