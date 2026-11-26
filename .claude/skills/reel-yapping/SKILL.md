---
name: reel-yapping
description: Procesar un video crudo con la Plantilla Dr. Beker estilo yapping — locutor full screen, zoom phrases, animaciones completas y concept scenes de enumeración. Usar cuando Morris pase un video para editar como reel vertical con la plantilla completa. También usar si pide "procesa este video" o "armá el reel" sin especificar tipo.
---

Leer en este orden antes de continuar:
1. `.claude/rules/base.md`
2. `.claude/rules/yapping.md`

Si el mensaje no incluye ruta del video, pedirla antes de continuar. **No pedir el hook text al inicio** — se define después de transcribir.

**Paso 0 — Marca / plantilla (gating obligatorio, preguntar SIEMPRE al arranque):**
Preguntar **¿Morris Beker, Club de Terapia o Foro Psiquiatría?** No asumir. El valor va en el
prop `brand` de Root.tsx (`"beker"` | `"clubdeterapia"` | `"foropsiquiatria"`). Cada marca cambia tipografía de portada, acento,
portada y cartel de gancho; los subtítulos son iguales. **Detalle de cada marca en
`.claude/rules/plantillas.md`** (leerlo solo acá, al elegir). Config en `src/brand.ts`.

Al recibir la ruta del video:
1. Arrancar el proyecto con estado limpio: `bash scripts/new_project.sh <nombre>` — crea
   `public/proyectos/<nombre>/{Crudos,Ediciones,Final}/` y **resetea `src/Reel.tsx` y
   `src/Root.tsx` a la plantilla en blanco** (guardando snapshot del video anterior si no
   se archivó). Esto evita arrastrar zoom/sonidos/escenas del video previo.
2. Mover el video crudo a `public/proyectos/<nombre>/Crudos/` con `mv`
3. Usar esa ruta como `input.mp4` en todos los pasos siguientes

> **Eficiencia:** no leer el cuerpo de toda `src/components/scenes/` (crece con cada
> video). El catálogo de scenes está en `.claude/rules/scenes.md`; abrir solo la que se vaya a reutilizar.

Preguntar también: **¿Querés agregar música de fondo?** Si sí, pedir la ruta del archivo. La música debe ser muy sutil, de fondo (`volume: 0.02`) sin tapar la voz. Copiar el mp3 a la carpeta del proyecto en `public/` y setear `bgMusicSrc` en Root.tsx.

## Flujo de trabajo

Seguir los pasos 1–7 de base.md (cortar silencios → transcribir → revisar captions).

**Corte de silencios = `scripts/desilence.py`, silencios ≥ 0,10 s** (default desde 2026-11-17,
pedido de Morris). Ya no se usa `silencedetect d=2.0` + `remove_silences.py`. Detalle en el
paso 3–4 de base.md. **No reutilizar `scripts/_rs_tmp.py`**: es una copia de otro proyecto y,
si se corre, pisa el `clip_edit.mp4` de ese proyecto.

**Control de tramos cortos (OBLIGATORIO tras cada corte, desde 2026-11-22):** listar los tramos
del `clip_edit_keep.json` de ≤ 0,6 s y mirar sus cuadros (ffmpeg `tile`). Si no hay habla (Morris
callado, mirando abajo, agarrando el celular), sacarlo con `--keep-from` + `--exclude`. Un tramo de
exactamente 0,50 s es casi siempre un golpe/roce estirado por `--min-seg`. El filtro
`--min-voiced` ya descarta los golpes secos, pero el control a ojo sigue: Morris tuvo que marcar
dos veces el mismo tipo de frame en `psicologo-o-psiquiatra`. **Si Morris marca un frame roto,
revisar todos los tramos cortos de todos los videos de la tanda, no solo el que marcó.**

**Detección de frases repetidas (parte del paso 7):** Antes de proponer títulos, correr el script para detectar secuencias de 3 palabras que aparezcan más de una vez. `<clip>` es el nombre del video transcripto en el paso 6 (`clip_edit2` si hubo 2da pasada, `clip_edit` si no):

```bash
node scripts/detect_repeats.mjs public/proyectos/<nombre>/Ediciones/<clip>_captions.json
```

Si hay repeticiones, **no eliminar automáticamente** — reportarlas al usuario con los segundos de cada ocurrencia y preguntar cuál conservar. El Dr. puede haberse equivocado al grabar o puede ser repetición retórica intencional.

### Pausa obligatoria tras el paso 7 — propuesta de títulos y escenas

Antes de tocar Root.tsx, Reel.tsx o renderizar, presentar una propuesta completa en un solo mensaje para aprobación. Incluye tres partes:

---

**1. Título de portada** — aparece en el feed (Instagram/TikTok grid). Breve, 1–2 líneas en mayúsculas. Genera curiosidad para que abran el video. Ejemplo: "CALLATE LA / BOCA."
Proponer 2–3 opciones con una línea de justificación cada una.

**2. Gancho / hook title** — texto de los primeros 2–3 segundos (ThumbnailCover). Tiene que tocar un dolor concreto o generar una pregunta urgente para detener el scroll. Suele ser diferente al título de portada.
Proponer 2–3 opciones con una línea de justificación cada una.

**3. Rehook (evaluar si aplica)** — escena de texto simple con una frase corta que confirma o tensiona el gancho ("La respuesta corta: SÍ.", "Pero hay un problema.", etc.). No es obligatoria. **El timestamp del Rehook debe coincidir exactamente con el momento en que el Dr. dice esa frase en el audio** — no va siempre a los 3–4s. Si la frase clave ocurre en el segundo 15, el Rehook va en el segundo 15. Duración: 1.5–2s (45–60 frames).

**4. Escenas de concepto (opcional pero recomendadas)** — leer el contenido del video e identificar 1–3 momentos donde una scene full-screen reforzaría el impacto o explicaría un concepto visualmente. Para cada momento propuesto, indicar:
- Timestamp aproximado (en segundos del clip editado)
- Qué dice el Dr. en ese momento
- Qué haría la escena visualmente y por qué refuerza el concepto
- Si usaría una scene existente (ver lista en yapping.md) o habría que crear una nueva

**Estética de todas las scenes:** usar la paleta rehook — fondo `#f5e9d2`, texto `#162a3e`, acento `#b18060`. Las scenes deben ser **didácticas y esquemáticas**: flujos con flechas, barras comparativas, listas con íconos, antes/después. No son placas de texto suelto — explican algo visualmente de forma clara.

**Reglas de placement:**
- Nunca antes de los 3s del clip (el ThumbnailCover todavía está activo)
- Nunca para cerrar el video — el cierre siempre es el Dr. en pantalla
- **90 frames (3s) por scene** para legibilidad en móvil; N Sequences independientes, no una larga continua

No forzar escenas si el contenido no las necesita. La prioridad es que cada escena aporte algo real: ilustrar algo abstracto, contrastar un mito, enumerar ítems, mostrar un flujo causal.

**5. Recortes de fluidez** — leer el transcript completo e identificar segmentos que reducen la retención. Proponer cada corte con timestamp, texto exacto, duración y razón:
- **Repeticiones de contexto**: el Dr. nombra el mismo concepto o condición (ej. "cuando estás con ansiedad") varias veces sin información nueva
- **Hedges largos** (≥5s de aclaraciones que diluyen el impacto de la frase anterior): "si bien a veces en algunos casos puede ser utilizado de cierta forma..."
- **Frases de transición vacías**: "y te voy a explicar por qué", "como te digo", "obviamente"

Ordenar por impacto estimado en retención. **No ejecutar automáticamente** — esperar aprobación. El usuario puede aprobar parcialmente. Si se aprueban cortes, aplicarlos con ffmpeg filter_complex concat y regenerar los captions con offsets ajustados antes de renderizar.

---

Esperar respuesta antes de continuar. El usuario puede aprobar, ajustar, o descartar partes de la propuesta.

### Pasos 8–9 (después de la aprobación)

Configurar Root.tsx y Reel.tsx con los títulos aprobados. **Setear `brand`** en `reelDefaultProps` de Root.tsx con la marca elegida en el Paso 0. **Cámara quieta, cortes secos, SIN ZOOM** (default desde 2026-11-18, Morris: "cortes limpios sin
zoom"; ni zoom sostenido, ni el estilo reel-kit de settles/punches). **Sin escenas ni rehooks** en las
ediciones nuevas (Morris, 17/11) — saltear las partes 3 y 4 de la propuesta salvo que las pida.

**PHRASE_SOUNDS:** usar clicks sutiles (`sfx/click.mp3`, vol 0.03) para resaltar conceptos clave — en las frases clave + cierre, máx 3–4 por video. No usar en transiciones ni palabras de relleno — solo en los momentos más contundentes.

Renderizar.

Solo si hay que crear una scene nueva: seguir la sección **"Concept scenes — estética y duración"** de `.claude/rules/yapping.md` (paleta rehook `#f5e9d2`/`#162a3e`/`#b18060`, template `MiScene` con woosh/plops, spring configs).

### Paso 10 — Renombrar carpeta del proyecto (OBLIGATORIO, nunca saltear)

**Nunca dejar la carpeta con nombre de fecha** (ej. `2026-04-29-00-18`). Después del render exitoso, siempre renombrar a un nombre descriptivo en kebab-case basado en el concepto central del video:

```bash
mv public/proyectos/<carpeta-actual> public/proyectos/<nombre-descriptivo>
```

Actualizar en Root.tsx las rutas `videoSrc` y `captionsSrc` con el nuevo nombre de carpeta. Confirmarle al usuario la ruta final del video renderizado.

### Paso 11 — Caption para redes (OBLIGATORIO, nunca saltear)

Cargar el **contexto del perfil** de la marca en `.claude/rules/perfiles-caption.md` (público,
registro, contexto institucional, crédito del orador, CTA, hashtags). Preguntar el CTA **solo si el
perfil no lo fija**: **¿engagement o lead magnet? Si es lead magnet, ¿qué comentar y qué reciben?**

Luego generar el caption según base.md + el perfil, y guardarlo en `public/proyectos/<nombre>/caption.txt`.

### Paso 12 — Ganchos del video (`ganchos.txt`) (OBLIGATORIO, junto con el caption)

Al lado del video y del `caption.txt`, cada reel lleva `Finales/<nombre>/ganchos.txt`: el título de
la portada, el gancho título (`hookText`) y lo que se dice en los primeros 3 s. Es para el tablero
de redes: ahí el título del video es el gancho título (si no hay, la portada), y sirve para analizar
por qué funcionó un video (¿el gancho escrito o el hablado?). Se genera solo, de Root.tsx/Reel.tsx
+ los subtítulos (con el nombre ya definitivo del paso 10):

```bash
python3 scripts/ganchos_txt.py <nombre>
```

Formato `clave: valor`: `titulo_portada`, `gancho_titulo`, `gancho_hablado_3s`, `primera_frase`,
`titulo_dashboard`. Si imprime `(faltan: …)`, pasar el dato con `--gancho "…"` / `--portada "…"` /
`--captions <json>`. Correrlo de nuevo pisa el archivo (si cambia el gancho o la portada). Si se
saltea, `archive_project.sh` lo genera igual antes de archivar.
