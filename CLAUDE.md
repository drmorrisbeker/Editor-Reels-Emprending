# Reels — Plantilla Dr. Beker

Editor de reels verticales (1080×1920) con Remotion. Dos tipos de reel y **dos marcas**
(Morris Beker / Club de Terapia, prop `brand`).

**Cómo empezar:**
- Si no está claro el tipo, usar el agente **`reel-editor`**: pregunta la marca, detecta el
  tipo (yapping vs reacción) y despacha a la skill correcta.
- Directo: **`/reel-yapping`** (un locutor a cámara, full-screen con zoom/escenas) o
  **`/reel-reaction`** (pantalla dividida: video reaccionado + yo reaccionando + mi opinión).

**Reglas (`.claude/rules/`, fuente de verdad):**
`base.md` (común: subtítulos, portada, gancho, marca, caption) · `yapping.md` (zoom/escenas) ·
`reaction.md` (split/opinión) · `plantillas.md` (marcas, on-demand) · `scenes.md` (catálogo de
escenas reutilizables). Config de marcas en código: `src/brand.ts`. Setup: ver `SETUP.md`.
