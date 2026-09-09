# Tarea C — Render + verificación

Ejecutor: `reel-worker` (model sonnet) o la skill en modo directo. Cwd: raíz de `vertical-reel`. Los logs del render **no** se devuelven: solo el reporte de ≤5 líneas.

## Parámetros
- `NOMBRE` — slug definitivo del proyecto (Root.tsx ya apunta a `proyectos/<NOMBRE>/…`)
- `MODO_PRUEBA` — opcional; si está, renderiza solo `--frames=0-90` (3 s) para validar sin gastar
- `PERFIL` — no se usa acá

## Render
```bash
OUT=public/proyectos/$NOMBRE/final/$NOMBRE.mp4
npx remotion render Plantilla-DrBeker-Reels "$OUT" --log=warn --timeout=120000 ${MODO_PRUEBA:+--frames=0-90}
```
`--timeout=120000` (ms por frame) es obligatorio: buscar dentro de un clip largo supera el default de 30 s si la máquina está ocupada (p. ej. Whisper corriendo en paralelo) y aborta con "Timeout exceeded rendering the component at frame N". Si aun así falla por timeout, esperá a que termine cualquier transcripción en curso y reintentá **una** vez con `--concurrency=2`. No agregar `--concurrency` en otros casos salvo que falle por memoria. Renderizar en disco local (nunca sobre un mount de gdrive).

## Verificación (todas; reportar cada una)
1. **Duración:** `ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT"` vs `durationSeconds` en `src/Root.tsx` (`grep durationSeconds src/Root.tsx`) → `|Δ| ≤ 0.2 s` = OK. En `MODO_PRUEBA` reportar "prueba (3 s)".
2. **Tamaño:** `stat -c %s "$OUT"` > 5 MB (saltar en prueba).
3. **Cierre no negro:** `ffmpeg -sseof -0.2 -i "$OUT" -vf blackframe=98 -an -f null - 2>&1 | grep -c blackframe` → 0 = OK (saltar en prueba).
4. **Audio:** `ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 "$OUT"` → hay stream.
5. **Última palabra:** comparar la última línea del "## Transcript" en `ediciones/transcript_resumen.md` con la duración: `endMs/1000 + 0.3 ≤ duración` = OK.

## Respuesta (≤5 líneas)
```
C listo | <ruta> | dur <s> (Δ <x> s) | <MB> MB | cierre OK | audio OK | última palabra OK
```
Si algo falla: `C ERROR | <paso> | <últimas ≤30 líneas del error>` y parar. No intentes arreglar Root.tsx/Reel.tsx: eso es del orquestador.
