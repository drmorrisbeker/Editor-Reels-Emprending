---
name: reel-scenes
description: Diseñar, crear o reutilizar concept scenes full-screen para un reel (placas didácticas de 90 frames con la paleta de escenas del perfil). La invoca reel-yapping (normalmente vía el sub-agente reel-worker) con un spec de escenas ya aprobado por Morris, o Morris explícito ("armame una escena que muestre…", "reutilizá la scene de barras"). NO edita Reel.tsx ni el JSON de captions; entrega `ediciones/scenes_snippets.md` con imports, Sequences, rangos cubiertos y ocultamientos de captions para que el orquestador los pegue.
---

# reel-scenes — concept scenes

Contexto mínimo: este archivo + `PERFIL` (ruta que te pasan; default `estilos/morris-beker/PERFIL.md`, secciones Paleta › Escenas, Tipografía, Animación, Sonido) + el catálogo de abajo. **No leas `src/Reel.tsx`, `src/Root.tsx`, las rules ni el JSON de captions.** Abrí el archivo de UNA scene solo si la vas a reutilizar.

## Entrada (spec)
Una línea por escena, ya aprobada por Morris en el CHECKPOINT:
```
<id> | <ms objetivo> | "<qué dice el Dr. en ese momento>" | <idea visual> | reusar <Escena> / nueva | props: <k=v, …>
```
Parámetros: `NOMBRE` (slug del proyecto), `PERFIL`, `SALIDA` (default `public/proyectos/<NOMBRE>/ediciones/scenes_snippets.md`).

## Catálogo (generado desde el disco, siempre fresco)
!`node scripts/scenes_catalog.mjs`

Leé la columna **Descripción** y **Reusable** para decidir: `sí` → usar tal cual con props; `con cambios (…)` → duplicar el archivo con otro nombre y cambiar solo lo indicado (nunca editar la scene original: otros videos la usan); `no` → crear nueva.

## Reglas de placement
- Nunca antes de los 3s del clip (el ThumbnailCover todavía está activo)
- Nunca para cerrar el video — el cierre siempre es el Dr. en pantalla
- **90 frames (3s) por scene** para legibilidad en móvil; N `<Sequence>` independientes, NO una larga continua. `NumeroConceptoScene`: 60 frames.
- Cada escena tiene que aportar algo real: ilustrar algo abstracto, contrastar un mito, enumerar ítems, mostrar un flujo causal. No forzar escenas si el contenido no las necesita.
- Anotar el rango `[from, from+dur]` en ms de cada Sequence: el orquestador elimina los ZOOM_PHRASES y PHRASE_SOUNDS que caigan adentro (la scene tapa el video).

```tsx
// ✅ Correcto
<Sequence from={s(6240, fps)} durationInFrames={90}><ItemA /></Sequence>
<Sequence from={s(9240, fps)} durationInFrames={90}><ItemB /></Sequence>
// ❌ Incorrecto — una sola Sequence larga tapa al locutor todo el bloque
```

## Estética
Paleta, tipografía, springs, pills y volúmenes: **PERFIL** (Paleta › Escenas · Tipografía · Animación · Sonido). Las scenes son **didácticas y esquemáticas**: flujos con flechas, barras comparativas, listas con íconos, antes/después. No son placas de texto suelto — explican algo visualmente de forma clara.

**Tipos:**
- **Flujo causal:** `A → B → C` con flechas en acento, elementos entrando en secuencia con spring delays (`FlujoCausalScene`, props).
- **Barras comparativas — siempre en DOS Sequences separadas:** (1) estático: estado inicial con barras creciendo desde 0, título "AHORA", 90 frames; (2) dinámico: arranca en el mismo estado y lo invierte con `interpolate` keyframes, título cambia, 90 frames. El espectador necesita leer el estado inicial antes de ver el cambio (`BarrasEstaticoScene` + `InversionBarrasScene`).
- **Antes/después:** dos columnas, izquierda dimmed, derecha en acento.
- **Lista con íconos/pills:** ítems que entran uno a uno con spring.

## NumeroConceptoScene (enumeraciones)
Usar cuando el Dr. enumera puntos explícitamente ("el primero es…", "punto 2…"). Props `numero`, `linea1`, `linea2` (2–3 palabras por línea en MAYÚSCULAS). Blur del video de fondo; woosh interno ya incluido — sin PHRASE_SOUNDS en la entrada.
1. Timestamp de cada número: viene en el spec (del `transcript_resumen.md`).
2. Sequence exactamente cuando dice el número, 60 frames (2s).
3. En `scenes_snippets.md` › Captions, listar para el orquestador: `ocultar token "<n>." @ <ms> (confidence = 0)`; si Whisper no transcribió el número, `insertar { text: ' 1.', startMs: X, endMs: X+40, confidence: 0 }`.

## Crear una scene nueva
- `cp ${CLAUDE_SKILL_DIR}/MiScene.template.tsx src/components/scenes/<Nombre>Scene.tsx`; renombrar el export a `<Nombre>Scene`.
- **Cabecera obligatoria en la línea 1** (el catálogo la lee; sin ella la scene aparece como `⚠ sin descripción`):
  `/** Escena: <qué muestra: layout + elementos + animación> | Tema: <tema/video de origen> | Reusable: sí | con cambios (qué) | no (por qué) */` — una sola línea, ≤ 220 caracteres.
- Contrato: un solo `export const <Nombre>Scene: React.FC<Props>`; imports solo de `remotion`; raíz `<AbsoluteFill>` con `opacity` = min(fade in 4f, fade out 10f); duration-agnostic (`useVideoConfig().durationInFrames`); SFX propios (woosh inicio, plop por elemento, click acento). Texto variable → props (así queda `Reusable: sí`).
- No leas otras scenes salvo la que reutilices.

## Salida — `scenes_snippets.md`
```
# scenes_snippets — <NOMBRE>
Escenas: <A>Scene (reusada) · <B>Scene (NUEVA: src/components/scenes/<B>Scene.tsx) · …
tsc: OK | ERROR (<resumen>)
## Imports (pegar bajo `import { Subtitles }` en src/Reel.tsx)
import { <A>Scene } from "./components/scenes/<A>Scene";
## Sequences (pegar dentro del bloque ESCENAS DE CONCEPTO / REHOOK, antes del `*/}` de cierre)
{/* Escena A — <ms/1000>s: "<qué dice el Dr.>" */}
<Sequence from={s(<ms>, fps)} durationInFrames={90}>
  <<A>Scene prop="…" />
</Sequence>
## Rangos cubiertos (eliminar ZOOM_PHRASES y PHRASE_SOUNDS que caigan acá)
<from>–<from+3000> | …
## Captions (aplica el orquestador)
ocultar token "1." @ <ms> (confidence = 0)    ← NumeroConcepto   (o "(nada)")
```

## Cierre
`npx tsc --noEmit -p .` — sin errores nuevos en los archivos que creaste (los preexistentes en `ConceptCardYT.tsx`, `RootYoutube.tsx`, `MitoScene.tsx`, `CambiaScene.tsx` son conocidos). Escribí `SALIDA` y respondé **una línea**: `B listo | <n> escenas (<m> nuevas) | tsc OK | snippets: <ruta>`. Nada más: nadie lee tu razonamiento.
