---
name: reel-yapping
description: Edita un reel vertical (1080×1920) de una persona hablando a cámara a partir del video crudo — corta silencios, subtitula, pone la portada y el cartel de gancho de la marca, renderiza y deja el caption optimizado para SEO. Cámara quieta, cortes secos, sin escenas ni zoom. La primera vez arma la marca (branding, cliente ideal, portada). Usar cuando pasen un video para "armar el reel", "editar este video", "procesá este video" o "hacé el reel" de una sola persona a cámara. Para pantalla dividida (reacción) usar reel-reaction.
---

Antes de empezar, leer:
1. `.claude/rules/arranque.md`
2. `.claude/rules/base.md`
3. `.claude/rules/yapping.md`

Si el mensaje no trae la ruta del video, pedirla (o buscar en `Crudos/` y preguntar cuál es).
No pedir títulos ni gancho al inicio: salen después de transcribir.

## 1. Arranque
Seguir `arranque.md`: carpetas → marca → (si es nueva) branding, cliente ideal, portada. Lo
que la persona rechace no se usa y se sigue.

Preguntar también: **¿Le ponemos música de fondo?** Si sí, pedir el archivo (va muy baja,
vol 0.02). Si no, seguir.

## 2. Edición
Pasos 2–5 de `base.md`: `new_project.sh <proyecto> <marca>` → mover el crudo → cortar
silencios (+ control de tramos cortos) → transcribir → revisar captions y repeticiones.

## 3. ✋ Pausa de títulos (obligatoria, antes de tocar Root.tsx)
En un solo mensaje, para aprobar. Si hay `marcas/<id>/cliente-ideal.md`, escribir pensando en
esa persona y con sus palabras.

1. **Título de portada** (la tapa del feed) — 2–3 opciones, mayúsculas, 2 renglones parejos de
   ~15 caracteres, que despierten curiosidad. Una línea de por qué en cada una. *Saltear si la
   marca tiene `"portada": "ninguna"`.*
2. **Gancho** (cartel de los primeros 5 s) — 2–3 opciones que toquen un dolor concreto o
   abran una pregunta urgente. Suele ser distinto del título.
3. **Recortes para que el video sea más ágil** — repeticiones de una misma idea, aclaraciones
   largas que diluyen la frase anterior, frases de relleno ("como te digo", "obviamente").
   Cada uno con segundos, texto exacto, duración y por qué. Ordenados por impacto. Si se
   aprueban, se aplican desde el crudo con `--exclude` (base.md paso 3) y se remapean o
   retranscriben los captions.

Lo que no se conteste queda aprobado con la primera opción. No proponer escenas ni zoom.

## 4. Render y cierre
Pasos 7–9 de `base.md`: completar `src/Root.tsx` (portada, gancho, `portadaBgMs` con cara
presentable verificada a ojo, `clicksMs`, duración) → `bash scripts/render_reel.sh <proyecto>`
→ revisar el frame 0 y 2–3 cuadros del render → `caption.txt` con SEO → `ganchos.txt`.

Entregar: ruta del video, el caption y qué quedó guardado de la marca (si se creó una).
