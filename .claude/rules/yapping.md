---
paths:
  - "templates/Reel.template.tsx"
---
# Yapping — Zoom, clicks, rehook y pitfalls post-corte

Este archivo **no se auto-carga**: la skill `reel-yapping` lo lee explícito en el paso 8 (Root/Reel), una vez. **Concept scenes → skill `reel-scenes`** (`.claude/skills/reel-scenes/SKILL.md`). Valores numéricos de escala, ramp y volúmenes → `PERFIL` › Animación / Sonido (default `estilos/morris-beker/PERFIL.md`).

## Zoom
6–8 por video | zoom máximo al cierre | `RAMP_MS` y rango de escala: PERFIL › Animación › Zoom

**Zoom sostenido (CRÍTICO):** El zoom NO es un pulso corto. Entra al inicio de la frase de impacto, **se mantiene en el pico durante toda la frase**, y se aleja recién cuando la frase termina. Definir cada `{ startMs, endMs }` con el `endMs` = timestamp real de fin de la frase de impacto (sacarlo de `transcript_resumen.md`, no inventar ventanas de ~1s). El `interpolate` `[start, start+RAMP, end-RAMP, end] → [1, scale, scale, 1]` ya sostiene el pico entre `start+RAMP` y `end-RAMP`.

Criterios de selección (leer el resumen y priorizar):
- Afirmaciones contundentes o contrasintuitivas ("la medicación NO engorda")
- Momento en que nombra el tema central del video
- Giros emocionales ("pero hay algo que nadie te dice")
- Cierre del video — siempre zoom máximo (tope del rango del perfil)
- Evitar: frases de transición, muletillas, palabras sueltas

**Eliminar ZOOM_PHRASES que caigan dentro del rango de timestamps de una concept scene.** La scene cubre el video completo con `opacity` y el zoom de fondo no es visible — es inútil y puede generar artefactos. Los rangos cubiertos vienen listados en `ediciones/scenes_snippets.md` (sección "Rangos cubiertos"); revisar después de pegar las escenas y sacar los zooms que se superpongan.

```typescript
const ZOOM_PHRASES = [
  { startMs: number, endMs: number, scale: number },
];
```

## PHRASE_SOUNDS
Clicks (`sfx/click.mp3`, volumen: PERFIL › Sonido) solo en los momentos de mayor impacto. **Máx 4–5 por video** — no en cada zoom, solo en los 2–3 más contundentes + cierre. No usar sobre ideas de transición ni muletillas, ni en la entrada de una scene (la scene ya trae su woosh). Menos es más: si hay muchos clicks mientras el Dr. habla, se vuelven ruido.

## Rehook scene
Placa de texto simple que confirma o tensiona el gancho. **No tiene posición fija** — puede aparecer en los primeros segundos o más avanzado el video. Lo que importa es que coincida exactamente con el momento en que el Dr. dice esa frase en el audio.

**Timing (CRÍTICO):** El timestamp del Rehook debe coincidir con el instante en que el Dr. pronuncia la frase mostrada. No ponerlo antes — si el Dr. lo dice en el segundo 15, la placa va en el segundo 15, no en el 4. Si bien lo ideal es que aparezca temprano (genera impacto desde el arranque), si la frase clave ocurre más tarde en el video igual vale usarlo — es mejor que no aparecer. Duración: 1.5–2s (45–60 frames).

**Estilo:** paleta de escenas del perfil (fondo crema, texto azul, línea de acento). Inter 600, ~52px, centrado. Fade in (4f) + fade out (10f).

**Criterio de uso (CRÍTICO):** Antes de incluir el Rehook, verificar que el texto propuesto NO contradiga lo que el Dr. está diciendo en el audio durante ese timestamp. Si el audio tiene al Dr. todavía enumerando hechos, una placa que diga algo distinto crea disonancia. Solo usar cuando el texto de la placa es neutro, complementario, o hay un corte natural en el audio en ese momento.

**Animación:** entra con transición ascendente (slide up desde 80px) + spring suave. **Audio:** `sfx/flash.mp3` como sonido de cámara al inicio (volumen: PERFIL › Sonido). Si el proyecto tiene `sfx/camera.mp3`, usar ese en su lugar. Sin woosh ni plop — la entrada es con cámara solamente.

El componente vive en `src/components/RehookScene.tsx` (props `linea1`, `linea2`, `acento`); no se re-crea por video:
```tsx
<Sequence from={s(55500, fps)} durationInFrames={50}>
  <RehookScene linea1="La respuesta corta:" linea2="" acento="SÍ." />
</Sequence>
```

Usarla solo cuando el video lo justifica. No es obligatoria.

## Concept scenes → skill `reel-scenes`
Estética, tipos, template `MiScene`, workflow de `NumeroConceptoScene` y catálogo viven en `.claude/skills/reel-scenes/SKILL.md`. Este archivo solo cubre zoom, clicks, rehook y pitfalls post-corte. La salida de esa skill es `ediciones/scenes_snippets.md` (imports + Sequences + rangos cubiertos + ocultamientos de captions) que el orquestador pega en `Reel.tsx`.

## Captions tras 2da pasada de cortes — pitfalls (FALLBACK)

**Camino normal (desde 2026-09-08):** los recortes aprobados se aplican con `remove_silences.py --keep` y el clip resultante se **re-transcribe** → timestamps finales, cero offsets. Lo de abajo aplica **solo** si por alguna razón no se re-transcribe y se ajustan offsets a mano sobre los captions del clip anterior.

**1. Zeroing accidental de tokens buenos**
Al zeroing un rango de índices para ocultar tokens repetidos, verificar que el rango no incluya tokens del segmento B que sí deben mostrarse. Después de aplicar, buscar en los captions si falta alguna frase clave que debería estar visible.

**2. Tokens de baja confianza tras offset**
Whisper asigna baja confianza a algunas palabras. Después de aplicar offsets, revisar los tokens en timestamps clave (especialmente el primer token del clip, y tokens en momentos de zoom o concepto). Si `confidence < 0.15`, el filtro de subtítulos los oculta. Fix: `caps[i].confidence = 0.85`.

**3. Agrupación incorrecta de subtítulos en puntos de corte**
En los puntos de empalme entre segmentos, el gap entre el último token del segmento anterior y el primero del siguiente puede ser < GAP_THRESHOLD_MS (380ms), causando que se agrupen en la misma página. Fix: capitalizar el primer token del nuevo segmento para que `isSentenceBoundary` fuerce un corte: `caps[i].text = ' NombreMayúscula'`.

**Workflow de verificación post-offset:**
1. Listar los 5 primeros tokens y los 5 últimos — verificar `confidence` y `endMs` ≤ duración total
2. Listar tokens en los timestamps de zoom phrases — verificar que sean visibles
3. Listar tokens alrededor de cada punto de corte — verificar que no se agrupen palabras de oraciones distintas
