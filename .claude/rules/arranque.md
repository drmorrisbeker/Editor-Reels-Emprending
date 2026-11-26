# Arranque — marca, branding, cliente ideal y portada

Lo corren las dos skills (`reel-yapping`, `reel-reaction`) antes del primer paso de edición.
Regla de oro: **cada pregunta se puede rechazar. Si la persona dice que no (o "después",
"no sé", "seguí"), no se usa y se avanza.** No insistir ni volver a preguntarlo en el mismo reel.

Preguntar de a una cosa, con `AskUserQuestion` cuando haya opciones, en lenguaje simple
(sin "props", "JSON", "Remotion"). Lo que se decide se guarda en `marcas/<id>/` para que el
próximo reel no vuelva a preguntarlo.

## 0. Carpetas (siempre, sin preguntar)
`bash scripts/preparar.sh` — crea `Crudos/`, `Ediciones/`, `Terminados/` y `marcas/` si faltan,
conecta `public/ediciones` y lista las marcas guardadas. Si dice `falta instalar`, avisá y
seguí la guía de `SETUP.md`.

## 1. Marca
- **Hay marcas guardadas** (`marcas/<id>/marca.json`): "¿Con qué marca es este reel?" → las
  guardadas + "Una marca nueva". Si elige una guardada, **saltear los pasos 2–4** (ya están
  decididos). Mostrar en una línea qué tiene (colores, portada, si tiene cliente ideal) por si
  quiere cambiar algo puntual.
- **No hay, o elige una nueva**: preguntar el nombre de la marca (cómo se llama la cuenta o el
  negocio). `<id>` = nombre en minúsculas, sin tildes ni espacios (`mi-marca`). Crear
  `marcas/<id>/` y seguir con 2–4.

## 2. Branding
"¿Tenés el branding de tu marca?" con tres opciones:
1. **Lo pego / lo subo** — manual de marca, paleta, tipografías, logo (texto, imagen o PDF).
   Leerlo y sacar: color principal oscuro (→ `navy`, el velo de la portada y fondo del cartel
   de gancho), color de acento (→ `accent`, `portadaHighlight`), tipografía de títulos
   (→ `portadaTitleFont`) y de texto (→ `subtitleFont`), logo (archivo → `marcas/<id>/logo.png`
   + `logoImg`; o el nombre en una tipografía → `logoText`/`logoFont`).
2. **Te digo colores y tipografía** — preguntar: color principal, color de acento, tipografía
   (si no sabe, ofrecer 3 de Google Fonts que vayan con el rubro: una sobria, una moderna,
   una con personalidad).
3. **Usar el de por defecto** — no se pregunta nada más (`marca.json` solo con `nombre`).

Al armar `marca.json` (campos en `marcas/README.md`):
- Tipografías de Google Fonts → `googleFonts` en formato css2 con los pesos que existan
  (ej. `"Montserrat:wght@700;800;900"`); en `portadaTitleFont`/`subtitleFont` el nombre con
  respaldo: `"Montserrat, Inter, sans-serif"`. Fuente propia en archivo → copiar a
  `marcas/<id>/fuentes/` + `localFonts`.
- **Contraste:** el texto del cartel de gancho (`hookFg`) sobre su fondo (`hookBg`) tiene que
  leerse en el celu: oscuro sobre claro o claro sobre oscuro, nunca dos colores medios. Los
  subtítulos son siempre blancos con sombra (no se cambian por marca).
- Mostrar cómo queda con la vista previa (frame 0 = portada, frame 1 = gancho + subtítulos) y
  ajustar hasta que la apruebe:
  ```bash
  npx remotion still Marca-Preview out/marca-0.png --frame=0 --props='{"brand":"<id>"}' --public-dir=<public reducido>
  ```
  (public reducido = carpeta temporal con un symlink a `public/sfx`, como hace `render_reel.sh`:
  nunca renderizar con el `public/` entero.)

## 3. Cliente ideal (buyer persona)
"¿Querés que te ayude a definir tu cliente ideal? Sirve para que los títulos, el gancho y el
texto de cada reel le hablen a esa persona, con sus palabras."
- **Sí** → usar la skill **`embudo-profesional:cliente-ideal`** (plugin del embudo de ventas;
  el repo lo declara en `.claude/settings.json`). Correrla **fuera del embudo** (rubro,
  ciudad, qué vende y a quién). Cuando termina, copiar su ficha (`cliente/avatar.md`, y
  `cliente/cliente-ideal.md` si existe) a **`marcas/<id>/cliente-ideal.md`** y borrar la carpeta
  `cliente/` que dejó en la raíz del repo.
  Si la skill no está disponible: decirle que la instale con
  `/plugin install embudo-profesional@embudo-profesional` (y reiniciar Claude Code), u ofrecer
  seguir sin cliente ideal. No improvisar una versión propia.
- **No** → seguir. Se puede pedir más adelante ("armemos el cliente ideal").

## 4. Portada del reel
La portada es la tapa que muestran Instagram y TikTok en el feed (frames 0-1 del video).
"¿Cómo querés la portada de tus reels?"
1. **Tengo referencias para recrear** — pedir 1–3 capturas de portadas que le gusten.
   Guardarlas en `marcas/<id>/referencias/`, mirarlas y describir en una línea qué tienen en
   común (dónde va el texto, tamaño, fondo, colores, logo). Recrear ese estilo en
   **`marcas/<id>/Portada.tsx`** partiendo de `src/components/Portada.tsx` (mismas props: ver
   `marcas/README.md`), con los colores y tipografías de la marca. `"portada": "propia"`.
   Respetar zonas seguras (texto arriba de y≈1490, nada en la columna de botones de la
   derecha). Mostrar la vista previa (frame 0) junto a las referencias y ajustar hasta el OK.
2. **La de por defecto** — `"portada": "default"`: la cara arriba, el título abajo sobre un
   velo del color de la marca. Mostrar la vista previa.
3. **Sin portada** — `"portada": "ninguna"`: el reel arranca directo con el video; Instagram
   y TikTok usan el primer frame o la tapa que se elija al subir. No se proponen títulos de
   portada en cada reel.

Guardar `marcas/<id>/marca.json` y seguir con el flujo de la skill.
