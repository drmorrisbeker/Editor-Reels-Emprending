#!/usr/bin/env python3
"""
Corte de silencios de reel-yapping (DEFAULT desde 2026-11-17:
"el corte se hace con silencios mayores a 0.10 seg").

Toda pausa con ≥ 0,10 s de silencio real se recorta, dejando 0,04 s de aire a cada lado
(+ las colas naturales de las palabras). Reemplaza el corte viejo con
silencedetect d=2.0 + remove_silences.py (que solo sacaba pausas largas).
Adaptado de ~/.claude/skills/podcast-clips/scripts/desilence.py.

Cómo decide dónde cortar (nunca a mitad de habla):
- Envolvente de audio en ventanas de 10 ms: solo es cortable lo que está por debajo de
  --noise (-42 dB). Bordes de empalme siempre bajo -42 dB (ver memoria "cortes solo en pausas").
- Con --words (captions JSON de transcribe.mjs, startMs/endMs) además nunca corta a menos
  de 30 ms de una palabra.
- Arranque: recorta el aire inicial dejando --lead (0,15 s) antes de la primera palabra.
- Cierre: deja --tail (0,40 s) de silencio de impacto después de la última palabra
  (regla de base.md: última palabra completa + ~300–500 ms).
- Bordes cuantizados a frame exacto + fundido de 8 ms en cada empalme de audio (sin clicks).
- Audio: denoise arnndn (scripts/rnnoise/sh.rnnn) y después loudnorm -14 LUFS (igual que
  remove_silences.py; se hace una sola vez, en este primer corte).

Uso (desde la raíz de vertical-reel):
  python3 scripts/desilence.py <input.mp4> <output.mp4> [keepmap.json]
      [--d 0.10] [--pad 0.04] [--noise -42] [--lead 0.15] [--tail 0.40]
      [--words captions.json] [--dry-run] [--no-denoise] [--no-loudnorm]

- --dry-run: solo informa cuánto duraría el clip (no codifica nada).
- Modo conservador viejo (solo pausas largas): --d 2.0 --pad 0.15.
Imprime la duración final (s) en la última línea de stdout.
"""
import argparse
import json
import math
import os
import subprocess
import sys
from array import array

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RNN = os.path.join(ROOT, "scripts", "rnnoise", "sh.rnnn")

WIN = 0.01          # ventana de la envolvente (s)
WORD_MARGIN = 0.03  # nunca cortar a menos de esto de una palabra (s)
FADE = 0.008        # fundido de audio en cada empalme (s)


def ffdur(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    return float(r.stdout.strip())


def ffps(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                        "stream=r_frame_rate", "-of", "csv=p=0", path], capture_output=True, text=True)
    num, _, den = r.stdout.strip().partition("/")
    try:
        return float(num) / (float(den) if den else 1.0)
    except Exception:
        return 30.0


def envelope_db(path):
    """RMS en dB por ventana de 10 ms (sin numpy: el python del sistema no lo trae)."""
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    a = array("h")
    a.frombytes(raw[: len(raw) // 2 * 2])
    if sys.byteorder == "big":
        a.byteswap()
    w = int(16000 * WIN)
    out = []
    for k in range(len(a) // w):
        seg = a[k * w:(k + 1) * w]
        ms = sum(x * x for x in seg) / (w * 32768.0 * 32768.0)
        out.append(20 * math.log10(math.sqrt(ms + 1e-12)))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("keepmap", nargs="?", default=None)
    ap.add_argument("--words", default=None, help="captions JSON (startMs/endMs) del mismo video")
    ap.add_argument("--noise", default="auto",
                    help="umbral de silencio en dB, o 'auto' = piso de ruido (percentil 10) + 12 dB, "
                         "nunca por encima de -42")
    ap.add_argument("--exclude", default="",
                    help="tramos del CRUDO a sacar enteros (tomas repetidas, recortes de fluidez "
                         "aprobados), ej. '0-11.7,32.1-38.3'. Los bordes tienen que caer en silencio.")
    ap.add_argument("--d", type=float, default=0.10, help="silencio mínimo a recortar (s)")
    ap.add_argument("--pad", type=float, default=0.04, help="aire a cada lado del corte (s)")
    ap.add_argument("--lead", type=float, default=0.15, help="aire antes de la primera palabra (s)")
    ap.add_argument("--tail", type=float, default=0.40, help="silencio de impacto tras la última palabra (s)")
    ap.add_argument("--min-seg", type=float, default=0.5,
                    help="duración mínima de cada tramo entre cortes (s); evita destellos de pocos cuadros")
    ap.add_argument("--min-voice", type=float, default=-50.0,
                    help="pico mínimo (dB, envolvente 10 ms) para que un tramo cuente como habla; "
                         "los tramos de solo ruido (mano, roce, pausar la grabación) se descartan")
    ap.add_argument("--min-voiced", type=float, default=0.08,
                    help="tiempo mínimo (s) por encima de -45 dB para que un tramo cuente como habla; "
                         "descarta golpes secos (tocar el celular) que pican fuerte pero duran 10-20 ms")
    ap.add_argument("--keep-from", default=None,
                    help="keep.json de un corte anterior: parte de esos tramos (en vez de recalcular) y "
                         "solo aplica el descarte de ruido y --exclude")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-denoise", action="store_true")
    ap.add_argument("--no-loudnorm", action="store_true")
    args = ap.parse_args()

    dur, fps = ffdur(args.input), ffps(args.input)
    db = envelope_db(args.input)
    m = len(db)
    # Umbral relativo al piso de ruido (2026-11-17): con -42 dB fijo, en un crudo de iPhone
    # grabado bajo (voz a -35/-50 dB, piso a -70) se comía palabras suaves enteras
    # ("y una vida más complicada" quedó en 0,3 s). Piso -70 → umbral -58.
    if str(args.noise).lower() == "auto":
        floor = sorted(db)[len(db) // 10]
        noise = min(-42.0, floor + 12.0)
    else:
        noise = float(str(args.noise).lower().replace("db", ""))
    print(f"umbral de silencio: {noise:.1f} dB", file=sys.stderr)
    ok = [v < noise for v in db]

    words = None
    if args.words:
        words = [(c["startMs"] / 1000, c["endMs"] / 1000) for c in json.load(open(args.words))
                 if str(c.get("text", "")).strip()]
        for s, e in words:
            for k in range(max(0, int((s - WORD_MARGIN) / WIN)), min(m, int((e + WORD_MARGIN) / WIN) + 1)):
                ok[k] = False

    loud = [k for k, v in enumerate(ok) if not v]
    if not len(loud):
        sys.exit("No encontré habla por encima del umbral: revisar --noise")
    # Colas suaves: la última sílaba suele caer bajo -42 dB (ej. -46/-48). Para el cierre y el
    # arranque se extiende el borde mientras haya energía > SOFT_DB dentro de 0,6 s, así el
    # --tail se cuenta desde el final REAL de la última palabra y no se come el remate.
    # Con umbral auto (~-60) la cola suave ya queda adentro: SOFT_DB = umbral. Con noise - 4 se
    # enganchaba ruido de fondo (-62) y dejaba ~1 s de aire al final (IMG_2901, 17/11).
    SOFT_DB, REACH = min(-55.0, noise), int(0.6 / WIN)
    i0, i1 = loud[0], loud[-1]
    for k in range(i1 + 1, min(m, i1 + 1 + REACH)):
        if db[k] > SOFT_DB:
            i1 = k
    for k in range(i0 - 1, max(-1, i0 - 1 - REACH), -1):
        if db[k] > SOFT_DB:
            i0 = k
    first, last = i0 * WIN, (i1 + 1) * WIN
    if words:
        first, last = min(first, min(s for s, _ in words)), max(last, max(e for _, e in words))

    snap = lambda t: round(t * fps) / fps
    start, end = snap(max(0.0, first - args.lead)), snap(min(dur, last + args.tail))

    cuts, i = [], 0
    while i < m:
        if not ok[i]:
            i += 1
            continue
        j = i
        while j < m and ok[j]:
            j += 1
        s, e = i * WIN, j * WIN
        if e - s >= args.d and s > first and e < last:
            r0, r1 = snap(s + args.pad), snap(e - args.pad)
            if r1 - r0 >= 2 / fps:
                cuts.append((r0, r1))
        i = j

    keep, t = [], start
    for r0, r1 in cuts:
        keep.append([t, r0])
        t = r1
    keep.append([t, end])
    if args.keep_from:
        # Re-cortar un clip ya hecho respetando sus cortes (incluidos --exclude viejos que no quedaron
        # registrados) y aplicar solo lo nuevo: descarte de ruido + --exclude de esta corrida.
        keep = [[float(s), float(e)] for s, e in json.load(open(args.keep_from))["segments"]]
        start, end = keep[0][0], keep[-1][1]

    # Tramos que son solo ruido (2026-11-18): con el umbral auto (~-60 dB) un roce de mano, tocar el
    # mic o el gesto de pausar la grabación (pico ~-59 dB) cuenta como "habla", y después --min-seg
    # lo estira a 0,5 s → pausa muerta con la mano en cuadro + "fritura" que loudnorm amplifica
    # (18/11). La voz pica a -22/-35 dB. Si el pico de la envolvente del tramo no llega a
    # --min-voice, el tramo se descarta (salvo que contenga una palabra de --words). En los bordes,
    # el vecino recupera el aire de --lead/--tail dentro del silencio que los separaba.
    def peak(s, e):
        w = db[int(s / WIN):max(int(s / WIN) + 1, int(e / WIN))]
        return max(w) if w else -120.0
    # Golpes secos (2026-11-22): tocar/agarrar el celular pica a -43 dB (pasa --min-voice) pero
    # dura 10 ms; --min-seg lo estiraba a 0,5 s de la persona callada acercándose a la cámara
    # (caso real, ~0:06). El habla más corta medida pasa 0,38 s por encima de -45 dB.
    def voiced(s, e):
        return sum(v > -45.0 for v in db[int(s / WIN):int(e / WIN)]) * WIN
    def has_word(s, e):
        return bool(words) and any(ws < e and we > s for ws, we in words)
    i, dropped = 0, []
    while i < len(keep) and len(keep) > 1:
        s, e = keep[i]
        if (peak(s, e) < args.min_voice or voiced(s, e) < args.min_voiced) and not has_word(s, e):
            dropped.append((round(s, 2), round(e, 2)))
            if i == 0:
                keep[1][0] = snap(max(e, keep[1][0] - (args.lead - args.pad)))
            elif i == len(keep) - 1:
                keep[-2][1] = snap(min(s, keep[-2][1] + (args.tail - args.pad)))
            del keep[i]
            continue
        i += 1
    if dropped:
        print(f"descarto {len(dropped)} tramos de solo ruido (pico < {args.min_voice:.0f} dB o "
              f"< {args.min_voiced}s sobre -45 dB): {dropped}",
              file=sys.stderr)
    # Tramos excluidos a mano (en tiempo del crudo)
    for rng in filter(None, args.exclude.split(",")):
        x0, x1 = (snap(float(v)) for v in rng.split("-"))
        nk = []
        for s, e in keep:
            if e <= x0 or s >= x1:
                nk.append([s, e])
                continue
            if s < x0:
                nk.append([s, x0])
            if e > x1:
                nk.append([x1, e])
        keep = [[s, e] for s, e in nk if e - s >= 2 / fps]

    # Tramo mínimo (2026-11-18): un tramo de pocos cuadros entre dos cortes se ve como un destello /
    # "foto" que rompe la imagen ("frame roto… aparece mi imagen como foto"). Cada tramo más
    # corto que --min-seg se alarga hacia el silencio que lo rodea (primero hacia adelante, después
    # hacia atrás), nunca dentro de un --exclude. Si se come todo el silencio, se une al vecino.
    excl = [tuple(snap(float(v)) for v in r.split("-")) for r in filter(None, args.exclude.split(","))]
    def fwd_limit(t, nxt):
        lim = nxt if nxt is not None else end
        for x0, x1 in excl:
            if x0 >= t - 1e-6:
                lim = min(lim, x0)
        return lim
    def back_limit(t, prv):
        lim = prv if prv is not None else start
        for x0, x1 in excl:
            if x1 <= t + 1e-6:
                lim = max(lim, x1)
        return lim
    i = 0
    while i < len(keep):
        s, e = keep[i]
        need = args.min_seg - (e - s)
        if need > 1e-6:
            nxt = keep[i + 1][0] if i + 1 < len(keep) else None
            e2 = min(e + need, fwd_limit(e, nxt))
            need -= e2 - e
            prv = keep[i - 1][1] if i > 0 else None
            s2 = max(s - max(need, 0), back_limit(s, prv)) if need > 1e-6 else s
            keep[i] = [snap(s2), snap(e2)]
            if i + 1 < len(keep) and keep[i][1] >= keep[i + 1][0] - 1e-6:   # se tocan: unir
                keep[i] = [keep[i][0], keep[i + 1][1]]
                del keep[i + 1]
                continue
            if i > 0 and keep[i][0] <= keep[i - 1][1] + 1e-6:
                keep[i - 1] = [keep[i - 1][0], keep[i][1]]
                del keep[i]
                i -= 1
                continue
        i += 1
    short = [round(e - s, 2) for s, e in keep if e - s < args.min_seg - 1e-6]
    if short:
        print(f"aviso: {len(short)} tramos siguen < {args.min_seg}s (sin silencio alrededor): {short}", file=sys.stderr)
    kept = sum(e - s for s, e in keep)
    print(f"raw {dur:.2f}s · habla {first:.2f}–{last:.2f}s · {len(cuts)} silencios recortados "
          f"→ queda {kept:.2f}s (−{dur - kept:.1f}s)", file=sys.stderr)
    if args.dry_run:
        print(round(kept, 3))
        return

    n, f = len(keep), []
    for i, (s, e) in enumerate(keep):
        L = e - s
        f.append(f"[0:v]trim={s:.6f}:{e:.6f},setpts=PTS-STARTPTS[v{i}]")
        f.append(f"[0:a]atrim={s:.6f}:{e:.6f},asetpts=PTS-STARTPTS"
                 + (f",afade=t=in:d={FADE},afade=t=out:st={max(0.0, L - FADE):.6f}:d={FADE}" if n > 1 else "")
                 + f"[a{i}]")
    f.append("".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][araw]")
    chain = "[araw]"
    if not args.no_denoise:
        f.append(f"{chain}arnndn=m='{RNN}'[adn]")
        chain = "[adn]"
    f.append(f"{chain}anull[a]" if args.no_loudnorm else f"{chain}loudnorm=I=-14:TP=-1.5:LRA=11[a]")
    r = subprocess.run(["ffmpeg", "-y", "-i", args.input, "-filter_complex", ";".join(f),
                        "-map", "[v]", "-map", "[a]",
                        "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart",
                        args.output, "-loglevel", "error"])
    if r.returncode != 0:
        sys.exit("ffmpeg falló")

    if args.keepmap:
        json.dump({"rawDurationSec": round(dur, 4), "keptDurationSec": round(kept, 4), "padSec": args.pad,
                   "minSilenceSec": args.d, "segments": [[round(s, 4), round(e, 4)] for s, e in keep]},
                  open(args.keepmap, "w"), indent=2)
    print(f"OK → {args.output}", file=sys.stderr)
    print(round(kept, 3))


if __name__ == "__main__":
    main()
