#!/usr/bin/env python3
"""
Detecta y mutea sonidos de notificación de WhatsApp en un video.
Estrategia: agrupa bursts de audio en frases (gaps < PHRASE_GAP_S se unen),
luego los eventos aislados que queden cortos son notificaciones.
"""
import subprocess
import re
import sys

VIDEO = sys.argv[1] if len(sys.argv) > 1 else "public/proyectos/sacar-medicacion/ediciones/clip5_edit.mp4"
OUTPUT = sys.argv[2] if len(sys.argv) > 2 else VIDEO.replace(".mp4", "_nowh.mp4")

SILENCE_DB   = -35    # umbral de silencio
SILENCE_MIN  = 0.05   # duración mínima de silencio para cortar
PHRASE_GAP_S = 0.5    # gaps menores a esto → misma frase (une bursts adyacentes)
MAX_NOTIF_S  = 1.1    # frase resultante más corta que esto → notificación
PAD          = 0.10   # padding al mutear

def get_duration(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        capture_output=True, text=True
    )
    return float(r.stdout.strip())

def detect_silence(path):
    cmd = ["ffmpeg", "-i", path,
           "-af", f"silencedetect=noise={SILENCE_DB}dB:d={SILENCE_MIN}",
           "-f", "null", "-"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends   = [float(x) for x in re.findall(r"silence_end: ([\d.]+) \|", r.stderr)]
    return list(zip(starts, ends[:len(starts)]))

def silence_to_raw_events(silences, total):
    """Convierte silencios en eventos de audio (palabras/bursts individuales)."""
    events = []
    prev = 0.0
    for s, e in sorted(silences):
        if s > prev + 0.005:
            events.append((prev, s))
        prev = e
    if prev < total - 0.05:
        events.append((prev, total))
    return events

def merge_phrases(events, gap):
    """Une eventos separados por menos de `gap` segundos en una sola frase."""
    if not events:
        return []
    phrases = [list(events[0])]
    for s, e in events[1:]:
        if s - phrases[-1][1] < gap:
            phrases[-1][1] = e   # extender frase actual
        else:
            phrases.append([s, e])
    return [(s, e) for s, e in phrases]

def main():
    print(f"Analizando: {VIDEO}")
    total = get_duration(VIDEO)
    print(f"Duración: {total:.2f}s")

    silences = detect_silence(VIDEO)
    raw_events = silence_to_raw_events(silences, total)
    phrases = merge_phrases(raw_events, PHRASE_GAP_S)

    notifs = [(s, e) for s, e in phrases if (e - s) <= MAX_NOTIF_S]
    voice  = [(s, e) for s, e in phrases if (e - s) >  MAX_NOTIF_S]

    print(f"Frases de voz detectadas (>{MAX_NOTIF_S}s):       {len(voice)}")
    print(f"Posibles notificaciones (<={MAX_NOTIF_S}s): {len(notifs)}")

    if notifs:
        print("\nTimestamps a mutear:")
        for s, e in notifs:
            print(f"  {s:.3f}s – {e:.3f}s  ({(e-s)*1000:.0f}ms)")

    if not notifs:
        print("\nNo se encontraron notificaciones.")
        return

    mute_filters = []
    for s, e in notifs:
        t0 = max(0, s - PAD)
        t1 = min(total, e + PAD)
        mute_filters.append(f"volume=enable='between(t,{t0:.3f},{t1:.3f})':volume=0")

    af = ",".join(mute_filters)
    print(f"\nAplicando {len(notifs)} mutes...")
    subprocess.run(
        ["ffmpeg", "-y", "-i", VIDEO, "-af", af, "-c:v", "copy", OUTPUT],
        check=True, capture_output=True
    )
    print(f"Guardado: {OUTPUT}")

if __name__ == "__main__":
    main()
