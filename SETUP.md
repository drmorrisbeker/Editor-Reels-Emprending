# Setup — Editor de Reels (Plantilla Dr. Beker)

Editor de reels verticales **1080×1920** hecho con [Remotion](https://remotion.dev):
locutor a pantalla completa, zoom sostenido en frases de impacto, subtítulos animados
palabra por palabra, portada para el feed, gancho (hook) y escenas de concepto.
Está pensado para manejarse con **Claude Code** mediante la skill `reel-yapping`.

---

## Requisitos

- **Node.js 18+** y npm
- **ffmpeg / ffprobe** en el PATH (`ffmpeg -version`)
- **Python 3** (para el corte de silencios: `scripts/remove_silences.py`)
- Herramientas de build de C (`cmake`, compilador) — solo para la transcripción
  (whisper.cpp se compila la primera vez, ver abajo)
- Opcional: **Claude Code** para usar la skill `/reel-yapping`

## Instalación

```bash
npm ci
```

> Usar `npm ci` (no `npm install`): reconstruye el árbol de dependencias **bit-exacto**
> desde `package-lock.json`, así el render es idéntico al original (misma versión de
> Remotion/React, mismos resultados).

Las fuentes (Montserrat / Inter / Poppins) se cargan desde Google Fonts vía `@import`
en `src/index.css` — no hay que instalar nada.

## Transcripción (whisper.cpp se auto-instala)

La primera vez que corras la transcripción, `@remotion/install-whisper-cpp` **descarga
y compila whisper.cpp y baja el modelo `medium` automáticamente** (~1.5 GB, una sola vez):

```bash
node scripts/transcribe.mjs public/proyectos/<nombre>/ediciones/clip_edit.mp4
```

No hace falta descargar whisper por separado ni versionarlo.

---

## Uso rápido

**Preview en vivo** (Remotion Studio):

```bash
npm run dev
```

Abre la composición `Plantilla-DrBeker-Reels`. Para ver un video real necesitás
colocar un `clip_edit.mp4` + su `clip_edit_captions.json` en
`public/proyectos/<nombre>/ediciones/` y apuntar `videoSrc`/`captionsSrc` en
`src/Root.tsx` (el proyecto `ansiedad-no-se-elimina` incluido trae el `captions.json`
y el `caption.txt` como ejemplo de formato; el `.mp4` no se versiona por peso).

**Render**:

```bash
npm run render                 # → out/reel.mp4
# o, siguiendo la convención del workflow:
npx remotion render Plantilla-DrBeker-Reels public/proyectos/<nombre>/final/<nombre>.mp4
```

---

## Flujo completo con Claude Code

Con Claude Code abierto en esta carpeta, la skill de proyecto `reel-yapping` guía todo
el proceso. Invocá `/reel-yapping` (o pedí *"procesá este video"*) y pasá la ruta del
crudo. Los pasos:

1. Crear la carpeta del proyecto y mover el crudo a `Crudos/`
2. Cortar silencios (`scripts/remove_silences.py`) → `clip_edit.mp4`
3. Transcribir (`scripts/transcribe.mjs`) → `clip_edit_captions.json`
4. Revisar captions (corregir alucinaciones, fusionar tokens)
5. **Pausa de aprobación**: títulos de portada, gancho, escenas y recortes propuestos
6. Configurar `Root.tsx` / `Reel.tsx` (zoom, sonidos, escenas) y **renderizar**
7. **Archivar** el proyecto terminado (recuperable, ver abajo)

Las reglas exactas de estilo, paleta, tipografía, safe-zones y animaciones viven en
`.claude/rules/base.md` y `.claude/rules/yapping.md` — son la fuente de verdad.

### Empezar un video nuevo sin arrastrar el anterior

```bash
bash scripts/new_project.sh <nombre>
```

Crea la estructura del proyecto y **resetea `src/Reel.tsx` y `src/Root.tsx` a la
plantilla en blanco** (`src/_template/`), guardando antes un snapshot del video anterior.
Así cada video arranca de un estado limpio (mejor para el contexto y los tokens) sin
perder nada.

### Archivar un video terminado (recuperable)

```bash
bash scripts/archive_project.sh <nombre>
```

Saca el material pesado de `public/` (para que Remotion no lo copie en cada bundle),
guarda un snapshot del `Reel.tsx`/`Root.tsx` de ese video y resetea el código a la
plantilla. Nada se borra: `Crudos`+`ediciones` van a `_archivo/<nombre>/`, el entregable
a `Finales/<nombre>/`. Para re-renderizar, mover de vuelta esas carpetas a
`public/proyectos/<nombre>/`.

---

## Qué NO está en el repo (y por qué no afecta al render)

- `node_modules/` → lo reconstruye `npm ci` (versiones fijadas en `package-lock.json`)
- `whisper.cpp/` → se auto-instala en la 1ª transcripción
- Videos crudos/renders y carpetas `_archivo/`, `_render_hold/`, `Finales/` → material de
  trabajo por-video; el diseño de la plantilla no depende de ellos

Todo lo que define el look (componentes, reglas, SFX, fuentes vía @import y las versiones
exactas de dependencias) **sí** está versionado, así que el resultado se reproduce igual.
