# Tarea A — Transcribir (corte de silencios → transcript → resumen)

Ejecutor: `reel-worker` (model sonnet) o la skill en modo directo. Cwd: raíz de `vertical-reel`. Salida valiosa = `ediciones/transcript_resumen.md`; **nunca** imprimir el transcript ni el JSON en la respuesta.

## Parámetros
- `NOMBRE` — slug del proyecto (`public/proyectos/<NOMBRE>/`)
- `CRUDO` — ruta del video de entrada (`Crudos/<archivo>.mp4` en modo inicial; el clip anterior en modo recorte)
- `MODO` — `inicial` (default) | `recorte`
- `KEEP` — solo en `recorte`: segmentos a conservar en segundos `"0-41.2,46.9-78.4"` (ya aprobados por Morris)
- `EXTEND_LAST` — opcional, segundos que se agregan al final del último segmento (regla de la última palabra)
- `PERFIL` — no se usa acá (la voz se normaliza con el loudnorm del script, que es el del perfil default)

## Modo inicial
```bash
P=public/proyectos/$NOMBRE/ediciones
python3 scripts/remove_silences.py --input "$CRUDO" --output $P/clip_edit.mp4 --silencedetect ${EXTEND_LAST:+--extend-last $EXTEND_LAST}
node scripts/transcribe.mjs $P/clip_edit.mp4            # → $P/clip_edit_captions.json (whisper medium, es)
node scripts/captions_resumen.mjs $P/clip_edit_captions.json --video $P/clip_edit.mp4 --fix-zero-duration --out $P/transcript_resumen.md
```
Defaults del corte: silencios `noise=-35dB:d=2.0`, `PAD_SEC=0.15`, colchón final 0.40 s, loudnorm. Guardar la salida de `remove_silences.py` (segmentos conservados + `durationSeconds:`) para las notas.

## Modo recorte
```bash
P=public/proyectos/$NOMBRE/ediciones
N=<número siguiente al clip actual: clip_edit → clip_edit2 → clip_edit3>
python3 scripts/remove_silences.py --input "$CRUDO" --output $P/clip_edit$N.mp4 --keep "$KEEP" ${EXTEND_LAST:+--extend-last $EXTEND_LAST}
node scripts/transcribe.mjs $P/clip_edit$N.mp4
node scripts/captions_resumen.mjs $P/clip_edit${N}_captions.json --video $P/clip_edit$N.mp4 --fix-zero-duration --out $P/transcript_resumen.md
```
El resumen anterior se sobreescribe (los timestamps viejos ya no sirven). No borrar el clip anterior.

## Cierre de la tarea
1. Leer `transcript_resumen.md` **solo** las 4 primeras líneas + sección "Última palabra". Si dice `REVISAR` (margen < 0.30 s), re-correr el corte con `--extend-last 0.4` (o `KEEP` con el último segmento extendido) y regenerar.
2. Anexar al final del resumen:
   ```
   ## Notas del worker
   Segmentos conservados: <n> (<s-e, …>) | silencios detectados: <n> | extend-last: <no|X s> | modo: <inicial|recorte>
   <cualquier cosa rara: whisper vacío, token en otro idioma, ruido, audio cortado>
   ```
3. Responder **una sola línea**: `A listo | dur <s> | última palabra <OK|REVISAR> | <n> repeticiones | <n> dudosos | resumen: <ruta>`.
   Si algo falla: `A ERROR | <paso> | <últimas ≤30 líneas del error>` y parar.
