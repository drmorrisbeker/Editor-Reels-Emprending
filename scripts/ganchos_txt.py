#!/usr/bin/env python3
"""ganchos.txt de un reel (reel-yapping) — los ganchos del video, para el tablero de redes.

Escribe `Finales/<nombre>/ganchos.txt` al lado del video y del caption.txt con:
  - titulo_portada     → el texto de la Portada (frame 0, la tapa del feed)
  - gancho_titulo      → el cartel de gancho de los primeros segundos (hookText)
  - gancho_hablado_3s  → lo que se dice en los primeros 3 s (subtítulos con inicio < 3000 ms)
  - primera_frase      → la primera frase hablada completa (hasta el primer . ? !)
  - titulo_dashboard   → el título con el que el video aparece en el tablero
                         (el gancho título; si no hay, la portada)

Formato `clave: valor`, una por línea: lo lee una persona y lo lee el tablero.

Uso:
  python3 scripts/ganchos_txt.py <nombre>                 # lee Root.tsx/Reel.tsx (src/ o _archivo/<nombre>/src/)
  python3 scripts/ganchos_txt.py <nombre> --gancho "…" --portada "…" --captions <json>   # forzar valores
  python3 scripts/ganchos_txt.py --todos                  # todos los Finales que no tengan ganchos.txt
Solo stdlib.
"""
import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FINALES = REPO / "Finales"
VENTANA_MS = 3000


def carpeta_final(nombre):
    for c in (FINALES / nombre, FINALES / "Subidos" / nombre, FINALES / "Para subir" / nombre):
        if c.is_dir():
            return c
    return FINALES / nombre


def fuentes(nombre):
    """Root.tsx + Reel.tsx del proyecto: el código vivo si apunta a este proyecto, si no el archivado."""
    for d in (REPO / "src", REPO / "_archivo" / nombre / "src"):
        root, reel = d / "Root.tsx", d / "Reel.tsx"
        if root.exists() and f"proyectos/{nombre}/" in root.read_text(encoding="utf-8"):
            return root.read_text(encoding="utf-8"), reel.read_text(encoding="utf-8") if reel.exists() else ""
    return "", ""


def bloque_reel(root):
    m = re.search(r"const reelDefaultProps\s*=\s*\{(.*?)\n\};", root, re.S)
    return m.group(1) if m else root


def valor_str(texto, clave):
    m = re.search(rf'\b{clave}\s*:\s*(["\'`])(.*?)\1', texto, re.S)
    return m.group(2).strip() if m else ""


def attr_jsx(tag, attr):
    m = re.search(rf'\b{attr}\s*=\s*\{{\s*(["\'`])(.*?)\1\s*\}}', tag, re.S) or \
        re.search(rf'\b{attr}\s*=\s*(["\'])(.*?)\1', tag, re.S)
    return m.group(2).strip() if m else ""


def portada(reel):
    m = re.search(r"<Portada\b[^>]*?/>", reel, re.S)
    if not m:
        return ""
    tag = m.group(0)
    partes = [attr_jsx(tag, "titulo"), attr_jsx(tag, "linea2")]
    return " ".join(p for p in partes if p and p not in ("TÍTULO", "GANCHO?"))


def palabras(captions_path):
    data = json.loads(Path(captions_path).read_text(encoding="utf-8"))
    return data if isinstance(data, list) else data.get("captions", [])


def unir(ws):
    return re.sub(r"\s+", " ", "".join(w.get("text", "") for w in ws)).strip()


def hablado(ws, desde_ms=0):
    tres = [w for w in ws if desde_ms <= w.get("startMs", 0) < desde_ms + VENTANA_MS]
    frase = []
    for w in ws:
        if w.get("startMs", 0) < desde_ms:
            continue
        frase.append(w)
        if re.search(r"[.?!…]\s*$", w.get("text", "")) or len(frase) >= 40:
            break
    return unir(tres), unir(frase)


def escribir(dest, campos):
    dest.mkdir(parents=True, exist_ok=True)
    lineas = [f"{k}: {(v or '').replace(chr(10), ' ').strip()}" for k, v in campos.items()]
    (dest / "ganchos.txt").write_text("\n".join(lineas) + "\n", encoding="utf-8")
    return dest / "ganchos.txt"


def uno(nombre, a):
    root, reel = fuentes(nombre)
    props = bloque_reel(root)
    gancho = a.gancho if a.gancho is not None else valor_str(props, "hookText")
    tapa = a.portada if a.portada is not None else portada(reel)
    marca = a.marca or valor_str(props, "brand") or ""
    cap = a.captions
    if not cap:
        rel = valor_str(props, "captionsSrc")
        for base in (REPO / "public", REPO / "_archivo" / nombre / "public"):
            if rel and (base / rel).exists():
                cap = base / rel
                break
    tres, frase = ("", "")
    if cap and Path(cap).exists():
        tres, frase = hablado(palabras(cap))
    if gancho in ("Gancho de la reacción",):
        gancho = ""
    campos = {
        "video": nombre,
        "skill": "reel-yapping",
        "marca": marca,
        "titulo_portada": tapa,
        "gancho_titulo": gancho,
        "gancho_hablado_3s": tres,
        "primera_frase": frase,
        "titulo_dashboard": gancho or tapa,
        "generado": date.today().isoformat(),
    }
    faltan = [k for k in ("titulo_portada", "gancho_titulo", "gancho_hablado_3s") if not campos[k]]
    dest = Path(a.out) if a.out else carpeta_final(nombre)
    ruta = escribir(dest, campos)
    print(f"{ruta}" + (f"  (faltan: {', '.join(faltan)})" if faltan else ""))
    return not faltan


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("nombre", nargs="?")
    p.add_argument("--gancho")
    p.add_argument("--portada")
    p.add_argument("--captions")
    p.add_argument("--marca")
    p.add_argument("--out", help="carpeta destino (default Finales/<nombre>/)")
    p.add_argument("--todos", action="store_true", help="todos los Finales sin ganchos.txt")
    a = p.parse_args()
    if a.todos:
        hechos = 0
        for base in (FINALES, FINALES / "Subidos", FINALES / "Para subir"):
            for d in sorted(base.iterdir()) if base.is_dir() else []:
                if d.is_dir() and d.name not in ("Subidos", "Para subir") and not (d / "ganchos.txt").exists() \
                        and any(d.glob("*.mp4")) and fuentes(d.name)[0]:
                    a.out = str(d)
                    uno(d.name, a)
                    hechos += 1
        print(f"{hechos} ganchos.txt nuevos")
        return
    if not a.nombre:
        p.error("falta <nombre> (o --todos)")
    sys.exit(0 if uno(a.nombre, a) else 1)


if __name__ == "__main__":
    main()
