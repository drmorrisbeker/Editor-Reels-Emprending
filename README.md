# Editor de reels

Plantilla para que **Claude Code** edite tus reels verticales (Instagram, TikTok, YouTube
Shorts) a partir del video crudo:

- corta los silencios sin cortar palabras y limpia el ruido de fondo
- subtitula palabra por palabra, debajo de la cara
- pone la **portada** (la tapa del feed) y un **cartel de gancho** con tu marca
- renderiza el video final
- te deja el **caption listo para pegar, optimizado para SEO**

Cámara quieta y cortes secos: sin escenas ni zooms.

## Cómo se usa

1. Instalá lo necesario (una sola vez): ver [SETUP.md](SETUP.md).
2. Abrí Claude Code en esta carpeta y escribí **`/reel-yapping`** (una persona a cámara) o
   **`/reel-reaction`** (reacción con pantalla dividida), con la ruta de tu video.
3. La primera vez te pregunta, y podés decir que no a cualquiera:
   - el nombre de tu **marca**
   - tu **branding**: lo pegás, decís colores y tipografía, o usás el de por defecto
   - si querés definir tu **cliente ideal** (con la skill del embudo de ventas)
   - cómo querés la **portada**: recrear tus referencias, la de por defecto o sin portada
4. Te propone títulos, gancho y recortes. Aprobás y renderiza.

## Carpetas

| carpeta | qué va |
|---|---|
| `Crudos/` | tus grabaciones originales, una carpeta por reel |
| `Ediciones/` | los archivos de trabajo de cada reel |
| `Terminados/` | el video final + `caption.txt` + `ganchos.txt` |
| `marcas/` | tus marcas: colores, tipografías, logo, portada, cliente ideal |

Si no existen, se crean solas. Nada de eso se sube a git: solo la plantilla.

## Por dentro

[Remotion](https://remotion.dev) (React) para el video, whisper.cpp para la transcripción y
ffmpeg para los cortes. Las reglas que sigue Claude están en `.claude/rules/`; las marcas se
explican en [marcas/README.md](marcas/README.md).
