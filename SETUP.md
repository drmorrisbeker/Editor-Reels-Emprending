# Instalación

## Requisitos
- **Node.js 18+** y npm
- **ffmpeg / ffprobe** en el PATH (`ffmpeg -version`)
- **Python 3** (corte de silencios)
- Herramientas de compilación de C (`cmake` y un compilador) — solo la primera vez, para
  compilar whisper.cpp
- **Claude Code**

## Pasos
```bash
git clone <este repo> editor-reels
cd editor-reels
npm ci          # instala y crea las carpetas (Crudos, Ediciones, Terminados, marcas)
```

`npm ci` (no `npm install`) instala exactamente las versiones de `package-lock.json`, así el
render sale igual en cualquier máquina.

La **primera transcripción** descarga y compila whisper.cpp y baja el modelo large-v3
(~3 GB, una sola vez). Necesita unos 8 GB de RAM libres: cerrá el navegador si se corta.

## Cliente ideal (opcional)
El paso del cliente ideal usa la skill `cliente-ideal` del plugin **embudo-profesional**. El
repo lo declara en `.claude/settings.json`, así que Claude Code ofrece instalarlo al abrir la
carpeta. Si no, a mano:
```
/plugin marketplace add drmorrisbeker/funnel-marketing-profesional
/plugin install embudo-profesional@embudo-profesional
```

## Probar
```bash
npm run dev     # Remotion Studio: composiciones Reel, Reaccion y Marca-Preview
```
Para ver una marca sin video:
`npx remotion still Marca-Preview out/marca.png --frame=0 --props='{"brand":"ejemplo"}'`
