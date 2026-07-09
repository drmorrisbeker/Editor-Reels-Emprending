# Yapping — Animaciones y Scenes

## Zoom
RAMP_MS=200ms | 6–8 por video | escala 1.08–1.14 | zoom máximo al cierre

**Zoom sostenido (CRÍTICO):** El zoom NO es un pulso corto. Entra al inicio de la frase de impacto, **se mantiene en el pico durante toda la frase**, y se aleja recién cuando la frase termina. Definir cada `{ startMs, endMs }` con el `endMs` = timestamp real de fin de la frase de impacto (sacarlo de los captions JSON, no inventar ventanas de ~1s). El `interpolate` `[start, start+RAMP, end-RAMP, end] → [1, scale, scale, 1]` ya sostiene el pico entre `start+RAMP` y `end-RAMP`.

Criterios de selección (leer captions JSON y priorizar):
- Afirmaciones contundentes o contrasintuitivas ("la medicación NO engorda")
- Momento en que nombra el tema central del video
- Giros emocionales ("pero hay algo que nadie te dice")
- Cierre del video — siempre zoom máximo (1.13–1.14)
- Evitar: frases de transición, muletillas, palabras sueltas

**Eliminar ZOOM_PHRASES que caigan dentro del rango de timestamps de una concept scene.** La scene cubre el video completo con `opacity` y el zoom de fondo no es visible — es inútil y puede generar artefactos. Revisar después de definir las scenes y sacar los zooms que se superpongan.

```typescript
const ZOOM_PHRASES = [
  { startMs: number, endMs: number, scale: number },
];
```

## PHRASE_SOUNDS
Clicks (`sfx/click.mp3`, **vol 0.03**) solo en los momentos de mayor impacto. **Máx 4–5 por video** — no en cada zoom, solo en los 2–3 más contundentes + cierre. No usar sobre ideas de transición ni muletillas. Menos es más: si hay muchos clicks mientras el Dr. habla, se vuelven ruido.

## Rehook scene
Placa de texto simple que confirma o tensiona el gancho. **No tiene posición fija** — puede aparecer en los primeros segundos o más avanzado el video. Lo que importa es que coincida exactamente con el momento en que el Dr. dice esa frase en el audio.

**Timing (CRÍTICO):** El timestamp del Rehook debe coincidir con el instante en que el Dr. pronuncia la frase mostrada. No ponerlo antes — si el Dr. lo dice en el segundo 15, la placa va en el segundo 15, no en el 4. Si bien lo ideal es que aparezca temprano (genera impacto desde el arranque), si la frase clave ocurre más tarde en el video igual vale usarlo — es mejor que no aparecer.

**Estilo:** fondo `#f5e9d2`, texto `#162a3e`, línea de acento `#b18060`. Inter 600, ~52px, centrado. Fade in (4f) + fade out (10f). Sin woosh ni plop — es una placa silenciosa.

**Criterio de uso (CRÍTICO):** Antes de incluir el Rehook, verificar que el texto propuesto NO contradiga lo que el Dr. está diciendo en el audio durante ese timestamp. Si el audio tiene al Dr. todavía enumerando hechos, una placa que diga algo distinto crea disonancia. Solo usar cuando el texto de la placa es neutro, complementario, o hay un corte natural en el audio en ese momento.

**Animación:** La escena entra con transición ascendente (slide up desde 80px) + spring suave. **Audio:** usar `sfx/flash.mp3` vol 0.20 como sonido de cámara al inicio. Si el proyecto tiene `sfx/camera.mp3`, usar ese en su lugar. Sin woosh ni plop — la entrada es con cámara solamente.

```tsx
export const RehookScene: React.FC<{ linea1: string; linea2: string; acento: string }> = ({ linea1, linea2, acento }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 220 } });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" }), fadeOut);
  const y = interpolate(enter, [0, 1], [80, 0]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity, transform: `translateY(${y}px)`, justifyContent: "center", alignItems: "center" }}>
      <Audio src={staticFile("sfx/flash.mp3")} volume={0.20} />
      <div style={{ textAlign: "center", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 52, lineHeight: 1.25, color: "#162a3e", letterSpacing: "-0.01em", padding: "0 60px" }}>
        {linea1}<br/>{linea2}<br/><span style={{ color: "#b18060" }}>{acento}</span>
      </div>
    </AbsoluteFill>
  );
};
```

Usarla solo cuando el video lo justifica. No es obligatoria.

## Concept scenes — estética y duración

**Paleta:** fondo `#f5e9d2` | texto `#162a3e` | acento `#b18060` | dimmed `rgba(22,42,62,0.35)`

**Reglas de placement:**
- Nunca antes de los 3s del clip (el ThumbnailCover aún está activo)
- Nunca para cerrar el video — el cierre siempre es el Dr. en pantalla
- **90 frames (3s) por scene** — menos no es legible en móvil. N `<Sequence>` independientes, NO una larga continua.

```tsx
// ✅ Correcto
<Sequence from={s(6240, fps)} durationInFrames={90}><ItemA /></Sequence>
<Sequence from={s(9240, fps)} durationInFrames={90}><ItemB /></Sequence>
// ❌ Incorrecto — una sola Sequence larga tapa al locutor todo el bloque
```

**Tipos de scenes didácticas:**
- **Flujo causal:** `A → B → C` con flechas en `#b18060`, elementos entrando en secuencia con spring delays
- **Barras comparativas — siempre en DOS Sequences separadas:**
  1. Primera Sequence (estático): muestra el estado inicial con barras creciendo desde 0. Título "AHORA". 90 frames.
  2. Segunda Sequence (dinámica): empieza en el mismo estado inicial, luego invierte las barras con `interpolate` keyframes. Título cambia al nuevo estado. 90 frames.
  El espectador necesita leer el estado inicial antes de ver el cambio — si se hace todo en una sola scene, no da tiempo.
- **Antes/después:** dos columnas, izquierda dimmed, derecha en acento
- **Lista con íconos/pills:** ítems que entran uno a uno con spring

## NumeroConceptoScene
Recibe `numero`, `linea1`, `linea2`. Renderiza: blur del video de fondo, número grande en #FFCC00, divisor blanco, concepto en 2 líneas bold.
Usar cuando: el Dr. enumera puntos explícitamente ("el primero es…", "punto 2…").

Workflow:
1. Identificar timestamp de cada número en captions JSON
2. Suprimir número del subtítulo: `caps[i].confidence = 0`
3. Si Whisper no transcribió el número: `caps.splice(idx, 0, { text: ' 1.', startMs: X, endMs: X+40, confidence: 0 })`
4. Sequence exactamente cuando dice el número, 60 frames (2s)
5. 2–3 palabras por línea en MAYÚSCULAS | woosh interno ya incluido — no agregar PHRASE_SOUNDS en la entrada

```tsx
<Sequence from={s(5440, fps)} durationInFrames={60}>
  <NumeroConceptoScene numero="1" linea1="SE TOMA" linea2="A LA MAÑANA" />
</Sequence>
```

## Scenes disponibles (referencia)
`NumeroConceptoScene` | `MitoScene` | `PuertaScene` | `AlgoDistintoScene` | `NeuroplasticidadScene`
`CambiaScene` | `SacarMedicacionScene` | `CelebrarProgresoScene` | `RumiacionScene`
`TieneTratatamientoScene` | `LuchaRefuerzaScene` | `ModoHacerSerScene`
`FlujoCausalScene` | `BarrasEstaticoScene` | `InversionBarrasScene`

**Eficiencia de contexto (IMPORTANTE):** `src/components/scenes/` es una librería que
crece con cada video (decenas de scenes, casi todas de temas viejos). **No leer el cuerpo
de toda la carpeta.** Esta lista de nombres es el catálogo; leé el archivo de UNA scene
solo si la vas a reutilizar, e importá en Reel.tsx únicamente las scenes que use este
video. Para crear una scene nueva, seguí el template `MiScene` de más arriba (no hace
falta abrir las demás).

## Captions tras 2da pasada de cortes — pitfalls

Cuando se hace un 2nd pass con ffmpeg filter_complex concat (segmentos A/B/C), los captions del clip_edit.mp4 original necesitan ajuste de offsets. Errores frecuentes:

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

```tsx
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const MiScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in (4 frames) + fade out (10 frames al final) — siempre
  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  // Cada elemento: spring con delay distinto
  const enter1 = spring({ frame: Math.max(0, frame - 3), fps, config: { damping: 11, stiffness: 380 } });
  const enter2 = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 11, stiffness: 380 } });
  // interpolate para opacity + y + scale por elemento
  const op1 = interpolate(enter1, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const y1  = interpolate(enter1, [0, 1], [60, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      {/* woosh siempre al inicio */}
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      {/* plop por cada elemento que aparece */}
      <Sequence from={3} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>
      <Sequence from={8} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>
      {/* click para el elemento final/acento */}
      <Sequence from={22} durationInFrames={6}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.07} />
      </Sequence>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 14, padding: "0 60px" }}>
        <div style={{ opacity: op1, transform: `translateY(${y1}px)` }}>
          {/* texto principal */}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
```

**Pill/tag:** `backgroundColor: \`${COLOR}22\`` + `border: \`2px solid ${COLOR}88\`` + `borderRadius: 50`

**Spring configs:**
- Palabras rápidas/punchy: `damping: 11, stiffness: 380`
- Subtítulos: `damping: 20, stiffness: 260`
- Tags/pills: `damping: 14, stiffness: 320`

**Tipografía en scenes:** Inter, weight 800–900, letterSpacing -0.02em
