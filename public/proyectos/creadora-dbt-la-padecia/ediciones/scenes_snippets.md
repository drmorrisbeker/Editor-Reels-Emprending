# scenes_snippets — reel-2026-05-07
Escenas: NombreConceptoScene (NUEVA: src/components/scenes/NombreConceptoScene.tsx)
tsc: OK (sin errores nuevos; los preexistentes en _archivo/, RootYoutube.tsx, CambiaScene.tsx, MitoScene.tsx, ConceptCardYT.tsx son conocidos)

## Imports (pegar bajo `import { Subtitles }` en src/Reel.tsx)
import { NombreConceptoScene } from "./components/scenes/NombreConceptoScene";

## Sequences (pegar dentro del bloque ESCENAS DE CONCEPTO / REHOOK, antes del `*/}` de cierre)
{/* Escena Marsha Linehan — ~5s: Morris la presenta como creadora de la DBT. Placa nombre+concepto sobre blur del video. Ajustar el `from` (ms) al momento real en que dice el nombre. */}
<Sequence from={s(5000 /* ← PLACEHOLDER: ajustar al ms real */, fps)} durationInFrames={85}>
  <NombreConceptoScene
    nombre="Marsha Linehan"
    concepto="Creadora de la DBT"
    detalle="La terapia con más evidencia para el trastorno límite de personalidad"
  />
</Sequence>

## Rangos cubiertos (eliminar ZOOM_PHRASES y PHRASE_SOUNDS que caigan acá)
5000–5834  (85 frames @ 30fps ≈ 2.83s; el rango real depende del `from` que fije el ms exacto)

## Captions (aplica el orquestador)
(nada)

## Notas
- Duración 85 frames ≈ 2.83s (dentro del ~2.5–3s pedido). Fade in 4 / fade out 10 y woosh al inicio ya vienen dentro del componente.
- La escena usa `backdropFilter: blur(18px)` → blurea el frame del video que quede detrás; overlay `rgba(0,0,0,0.38)`. Acento cobre #DFBE9A, texto blanco (estilo NumeroConceptoScene del PERFIL).
- Reusable: props `nombre` / `concepto` / `detalle` (detalle opcional).
- Placement OK: cae a ~5s del clip, después del ThumbnailCover (≥3s), y no es el cierre del video.
