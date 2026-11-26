# Editor de reels — plantilla

Plantilla para editar reels verticales (1080×1920) con Claude Code + Remotion. Dos tipos de
reel, cualquier marca. Cámara quieta y cortes secos: **sin escenas ni zoom.**

**Cómo empezar:**
- **`/reel-yapping`** — una persona hablando a cámara.
- **`/reel-reaction`** — pantalla dividida (el video al que se reacciona + la persona
  reaccionando) y después su opinión a pantalla completa.
- Si no está claro cuál, preguntar: un video de una persona a cámara → yapping; tres videos o
  "reacciono a…" → reacción.

La primera vez, la skill arma la marca (`.claude/rules/arranque.md`): branding, cliente ideal
y portada. Cada pregunta se puede rechazar y se sigue sin eso.

**Reglas (`.claude/rules/`):** `arranque.md` (marca, branding, cliente ideal, portada) ·
`base.md` (carpetas, cortes, transcripción, subtítulos, portada, gancho, render, caption con
SEO) · `yapping.md` · `reaction.md`.

**Carpetas:** `Crudos/<proyecto>/` (originales) · `Ediciones/<proyecto>/` (archivos de
trabajo) · `Terminados/<proyecto>/` (video + `caption.txt` + `ganchos.txt`) · `marcas/<id>/`
(ver `marcas/README.md`). Si faltan, `bash scripts/preparar.sh` las crea.

**Código:** solo `src/Root.tsx` cambia por video (se crea desde `templates/Root.template.tsx`
con `scripts/new_project.sh`). Renderizar siempre con `bash scripts/render_reel.sh`, nunca con
`npx remotion render` a secas (copiaría todas las Ediciones). Hablarle a la persona en
lenguaje simple: qué cambia para ella, no cómo.
