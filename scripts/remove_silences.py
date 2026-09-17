#!/usr/bin/env python3
"""
Cuts silence from clip.mp4, adjusts captions, prints new overlay timestamps.

Duration target: 60–90s. Use d=2.0 in silencedetect to preserve impactful pauses.
PAD_SEC adds breathing room on each side of speech segments to avoid word-edge cuts.
"""
import json, os, subprocess, sys

# Raíz del proyecto = carpeta padre de scripts/ (portable, no hardcodear rutas absolutas)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def probe_duration(path):
    """Duración del input en segundos (ffprobe). Necesaria para no perder el tramo final."""
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        cwd=PROJECT_ROOT, capture_output=True, text=True,
    )
    try:
        return float(r.stdout.strip())
    except ValueError:
        sys.exit(f"No pude leer la duración de {path} con ffprobe; abortando.")

INPUT  = "public/proyectos/2026-01-30-yapping/Crudos/input.mp4"
OUTPUT = "public/proyectos/2026-01-30-yapping/ediciones/clip_edit.mp4"

# 150ms padding on each side of speech segments — avoids cutting mid-word or mid-breath
PAD_SEC = 0.15

# Detected silences (start, end) in seconds
# Run: ffmpeg -i INPUT -af "silencedetect=noise=-35dB:d=2.0" -f null - 2>&1 | grep silence
SILENCE = [
    (4.260021, 9.247333),    # pausa larga inicio
    (14.599896, 18.785083),
    (23.824292, 27.341333),
    (34.191437, 38.330500),
    (45.224542, 54.809500),  # pausa larga
    (61.402062, 67.433500),
    (76.732229, 86.980200),  # marcador de fin (duración del video)
]

# Speech segments = gaps between silence periods
# Each segment is padded by PAD_SEC on both sides, clamped to the silence boundaries.
speech = []
DURATION = probe_duration(INPUT)

# Skip segment before first silence if it starts at 0 (pure silence/noise)
if SILENCE and SILENCE[0][0] > 0.5:
    speech.append((0, SILENCE[0][0] + PAD_SEC))

# Segments between silences
for i in range(len(SILENCE) - 1):
    s = SILENCE[i][1] - PAD_SEC
    e = SILENCE[i+1][0] + PAD_SEC
    if e - s > 0.05:
        speech.append((s, e))

# FIX 2026-09-08 — tramo final. Antes el script solo generaba tramos ENTRE silencios y daba por
# hecho que el último elemento de SILENCE era el final del video. Si el video NO termina en un
# silencio ≥ d (o si uno se olvidaba de pegar el "marcador de fin"), todo lo posterior al último
# silencio se perdía — en un crudo de 39 s con un solo silencio en 5–8 s quedaban 5.5 s.
if not SILENCE:
    speech = [(0.0, DURATION)]
elif DURATION - SILENCE[-1][1] > 0.3:
    speech.append((max(0.0, SILENCE[-1][1] - PAD_SEC), DURATION))

# Último tramo del video: 400 ms de colchón de impacto en vez de PAD_SEC, sin pasarse del fin
if speech:
    s, e = speech[-1]
    speech[-1] = (s, min(e - PAD_SEC + 0.40, DURATION))

print("Segments to keep:")
for i, (s, e) in enumerate(speech):
    print(f"  {i+1:2d}. {s:7.3f}s – {e:7.3f}s  ({e-s:.2f}s)")
total = sum(e - s for s, e in speech)
print(f"  Total: {total:.2f}s  ({total/60:.1f}min)\n")

# ── Build ffmpeg filter_complex ──────────────────────────────────────────────
n = len(speech)
parts_v, parts_a, filters = [], [], []
for i, (s, e) in enumerate(speech):
    filters.append(f"[0:v]trim={s:.6f}:{e:.6f},setpts=PTS-STARTPTS[v{i}]")
    filters.append(f"[0:a]atrim={s:.6f}:{e:.6f},asetpts=PTS-STARTPTS[a{i}]")
    parts_v.append(f"[v{i}]")
    parts_a.append(f"[a{i}]")
interleaved = "".join(f"[v{i}][a{i}]" for i in range(n))
filters.append(interleaved + f"concat=n={n}:v=1:a=1[v][a_raw]")
# Denoise antes de normalizar — si loudnorm calcula sobre audio con ruido de fondo,
# el gain queda sesgado por ese ruido. Modelo RNNoise entrenado para voz.
filters.append("[a_raw]arnndn=m=scripts/rnnoise/sh.rnnn[a_dn]")
filters.append("[a_dn]loudnorm=I=-14:TP=-1.5:LRA=11[a]")

cmd = [
    "ffmpeg", "-i", INPUT,
    "-filter_complex", ";".join(filters),
    "-map", "[v]", "-map", "[a]",
    "-c:v", "libx264", "-preset", "fast", "-crf", "20",
    "-c:a", "aac", "-b:a", "192k",
    OUTPUT, "-y", "-loglevel", "error",
]
print("Running ffmpeg…")
r = subprocess.run(cmd, cwd=PROJECT_ROOT)
if r.returncode != 0:
    sys.exit(1)
print(f"Created: {OUTPUT}\n")

# ── Helper: map original ms → new ms ────────────────────────────────────────
def to_new(t_ms):
    t = t_ms / 1000
    cum = 0.0
    for s, e in speech:
        if t <= s:
            return cum * 1000
        if t <= e:
            return (cum + (t - s)) * 1000
        cum += (e - s)
    return cum * 1000

print(f"\ndurationSeconds: {round(total)}")
