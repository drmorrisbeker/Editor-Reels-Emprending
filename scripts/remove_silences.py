#!/usr/bin/env python3
"""
Corta silencios de un clip y normaliza el audio, imprimiendo la duración final.

Duración objetivo: 60–90 s. d=2.0 en silencedetect preserva las pausas de impacto.
PAD_SEC agrega aire a cada lado de los segmentos de habla para no cortar palabras.
El último segmento recibe un end-pad extra (0.40 s) de silencio de asiento.

Tres modos de segmentación (exactamente uno):

  # 1) El script corre silencedetect él mismo sobre el input y parsea su stderr:
  python3 scripts/remove_silences.py --input crudo.mp4 --output clip_edit.mp4 \
      --silencedetect [--noise -35] [--min-silence 2.0] [--extend-last 0.5]

  # 2) Silencios desde un archivo (log de ffmpeg silencedetect, o pares "start end"):
  python3 scripts/remove_silences.py --input crudo.mp4 --output clip_edit.mp4 \
      --silences silencios.txt

  # 3) Segmentos a conservar explícitos (segundos) — sin lógica de silencios:
  python3 scripts/remove_silences.py --input clip_edit.mp4 --output clip_edit2.mp4 \
      --keep "0-5,10-15.5,20-30"

Flags comunes: --pad 0.15, --end-pad 0.40, --extend-last <s> (extiende el final del
último segmento conservado, clamp a la duración del input — regla "nunca cortar la
última palabra"), --dry-run (imprime segmentos + duración + comando ffmpeg, sin crear archivo).
"""
import argparse
import os
import re
import subprocess
import sys

# Raíz del proyecto = carpeta padre de scripts/ (portable, no hardcodear rutas absolutas)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def probe_duration(path):
    """Duración del input en segundos vía ffprobe (para clamp de --extend-last)."""
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        cwd=PROJECT_ROOT, capture_output=True, text=True,
    )
    try:
        return float(r.stdout.strip())
    except (ValueError, AttributeError):
        return None


def parse_silence_log(text, duration=None):
    """Extrae pares (start, end) de un log de ffmpeg silencedetect.

    Un silencio que llega hasta el final del archivo no emite silence_end: se cierra
    con la duración del input para que no se pierda ni se conserve como habla.
    """
    starts = [float(m) for m in re.findall(r"silence_start:\s*([0-9.]+)", text)]
    ends = [float(m) for m in re.findall(r"silence_end:\s*([0-9.]+)", text)]
    if len(starts) == len(ends) + 1:
        ends.append(duration if duration is not None else starts[-1])
    return list(zip(starts, ends))


def run_silencedetect(input_path, noise, min_silence, duration=None):
    """Corre ffmpeg silencedetect sobre el input y parsea su stderr (sin shell)."""
    cmd = [
        "ffmpeg", "-i", input_path,
        "-af", f"silencedetect=noise={noise}dB:d={min_silence}",
        "-f", "null", "-",
    ]
    r = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=True, text=True)
    # silencedetect escribe en stderr; ffmpeg puede salir 0 con la info igual presente
    return parse_silence_log(r.stderr, duration)


def load_silences_file(path, duration=None):
    """Carga silencios desde archivo: log de silencedetect, o pares 'start end' por línea."""
    with open(os.path.join(PROJECT_ROOT, path) if not os.path.isabs(path) else path) as f:
        text = f.read()
    if "silence_start" in text or "silence_end" in text:
        return parse_silence_log(text, duration)
    pairs = []
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.replace(",", " ").split()
        if len(parts) >= 2:
            pairs.append((float(parts[0]), float(parts[1])))
    return pairs


def silences_to_speech(silence, pad, end_pad, duration):
    """Convierte silencios (start, end) en segmentos de habla.

    Cada segmento se padea `pad` a cada lado; el último segmento del video recibe
    `end_pad` (pausa de impacto) en vez de `pad`, clampeado a la duración.

    FIX 2026-09-08: el script original solo generaba tramos ENTRE silencios y daba por
    hecho que el último silencio era el final del video. Si el video no termina en un
    silencio ≥ min-silence, todo lo posterior al último silencio se perdía (en un crudo
    de 39 s con un solo silencio en 5–8 s conservaba 0–5.5 s). Ahora se agrega el
    tramo final hasta el fin del archivo, y "sin silencios" = archivo entero.
    """
    if duration is None:
        raise SystemExit("No pude leer la duración del input con ffprobe; abortando.")
    if not silence:
        return [(0.0, min(duration, duration - pad + end_pad))]
    speech = []
    # Segmento antes del primer silencio, si no arranca en 0 (silencio/ruido puro)
    if silence[0][0] > 0.5:
        speech.append((0.0, silence[0][0] + pad))
    # Segmentos entre silencios
    for i in range(len(silence) - 1):
        s = silence[i][1] - pad
        e = silence[i + 1][0] + pad
        if e - s > 0.05:
            speech.append((s, e))
    # Tramo final: del último silencio al fin del archivo (si queda habla)
    last_end = silence[-1][1]
    if duration - last_end > 0.3:
        speech.append((max(0.0, last_end - pad), duration))
    # El último tramo lleva end_pad en lugar de pad (pausa de impacto), sin pasarse del fin
    if speech:
        s, e = speech[-1]
        speech[-1] = (s, min(e - pad + end_pad, duration))
    return speech


def parse_keep(spec):
    """Parsea "s-e,s-e,…" a lista de (start, end) en segundos."""
    segs = []
    for chunk in spec.split(","):
        chunk = chunk.strip()
        if not chunk:
            continue
        a, b = chunk.split("-")
        segs.append((float(a), float(b)))
    return segs


def main():
    p = argparse.ArgumentParser(
        description="Corta silencios / conserva segmentos y normaliza el audio.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("--input", required=True, help="Video de entrada")
    p.add_argument("--output", required=True, help="Video de salida")
    mode = p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--silencedetect", action="store_true",
                      help="Corre ffmpeg silencedetect sobre el input y parsea su stderr")
    mode.add_argument("--silences", metavar="FILE",
                      help="Archivo con log de silencedetect o pares 'start end'")
    mode.add_argument("--keep", metavar="SPEC",
                      help='Segmentos a conservar en segundos: "s-e,s-e,…"')
    p.add_argument("--noise", type=float, default=-35,
                   help="Umbral silencedetect en dB (default -35)")
    p.add_argument("--min-silence", type=float, default=2.0,
                   help="Duración mínima de silencio en s (default 2.0)")
    p.add_argument("--pad", type=float, default=0.15,
                   help="Padding a cada lado de los segmentos (default 0.15)")
    p.add_argument("--end-pad", type=float, default=0.40,
                   help="Padding extra al final del último segmento (default 0.40)")
    p.add_argument("--extend-last", type=float, default=0.0,
                   help="Extiende el final del último segmento conservado (clamp a la duración)")
    p.add_argument("--dry-run", action="store_true",
                   help="Imprime segmentos + duración + comando, sin crear el archivo")
    args = p.parse_args()

    # ── Determinar segmentos a conservar ────────────────────────────────────
    if args.keep is not None:
        speech = parse_keep(args.keep)
    else:
        duration = probe_duration(args.input)
        if args.silencedetect:
            silence = run_silencedetect(args.input, args.noise, args.min_silence, duration)
        else:
            silence = load_silences_file(args.silences, duration)
        if not silence:
            print("No se detectaron silencios: se conserva el archivo entero.", file=sys.stderr)
        else:
            print(f"Silencios detectados: {len(silence)}")
            for i, (s, e) in enumerate(silence):
                print(f"  {i+1:2d}. {s:7.3f}s – {e:7.3f}s  ({e-s:.2f}s)")
            print()
        speech = silences_to_speech(silence, args.pad, args.end_pad, duration)

    if not speech:
        print("No hay segmentos para conservar.", file=sys.stderr)
        sys.exit(1)

    # ── extend-last: nunca cortar la última palabra ─────────────────────────
    if args.extend_last > 0:
        s, e = speech[-1]
        e += args.extend_last
        dur = probe_duration(args.input)
        if dur is not None:
            e = min(e, dur)
        speech[-1] = (s, e)

    # ── Reporte de segmentos ────────────────────────────────────────────────
    print("Segments to keep:")
    for i, (s, e) in enumerate(speech):
        print(f"  {i+1:2d}. {s:7.3f}s – {e:7.3f}s  ({e-s:.2f}s)")
    total = sum(e - s for s, e in speech)
    print(f"  Total: {total:.2f}s  ({total/60:.1f}min)\n")

    # ── Construir filter_complex ────────────────────────────────────────────
    n = len(speech)
    filters = []
    for i, (s, e) in enumerate(speech):
        filters.append(f"[0:v]trim={s:.6f}:{e:.6f},setpts=PTS-STARTPTS[v{i}]")
        filters.append(f"[0:a]atrim={s:.6f}:{e:.6f},asetpts=PTS-STARTPTS[a{i}]")
    interleaved = "".join(f"[v{i}][a{i}]" for i in range(n))
    filters.append(interleaved + f"concat=n={n}:v=1:a=1[v][a_raw]")
    filters.append("[a_raw]loudnorm=I=-14:TP=-1.5:LRA=11[a]")

    cmd = [
        "ffmpeg", "-i", args.input,
        "-filter_complex", ";".join(filters),
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-c:a", "aac", "-b:a", "192k",
        args.output, "-y", "-loglevel", "error",
    ]

    if args.dry_run:
        print("ffmpeg command (dry-run, no se crea archivo):")
        print(" ".join(cmd))
        print(f"\ndurationSeconds: {round(total)}")
        return

    print("Running ffmpeg…")
    r = subprocess.run(cmd, cwd=PROJECT_ROOT)
    if r.returncode != 0:
        sys.exit(1)
    print(f"Created: {args.output}\n")

    print(f"\ndurationSeconds: {round(total)}")


if __name__ == "__main__":
    main()
