// Carga las tipografías de la marca antes de renderizar cada frame.
// · googleFonts: una hoja <link> por familia (si una falla, las otras siguen).
// · localFonts: FontFace con el archivo de la carpeta de la marca.
// Espera a que carguen (delayRender) con un tope de 15 s para no colgar el render.
import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import type { Brand } from "./brand";

const WEIGHTS = ["400", "700", "800", "900"];

const loadLink = (spec: string) =>
  new Promise<void>((resolve) => {
    const href = `https://fonts.googleapis.com/css2?family=${spec.trim().replace(/ /g, "+")}&display=block`;
    if (document.querySelector(`link[data-marca-font="${href}"]`)) return resolve();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.marcaFont = href;
    link.onload = () => resolve();
    link.onerror = () => resolve(); // familia mal escrita: sigue con la fuente de respaldo
    document.head.appendChild(link);
  });

export const useBrandFonts = (b: Brand) => {
  const [handle] = useState(() => delayRender(`fuentes de la marca ${b.id}`));
  useEffect(() => {
    const tasks: Promise<unknown>[] = [];
    for (const spec of b.googleFonts) {
      const family = spec.split(":")[0].trim();
      tasks.push(
        loadLink(spec).then(() =>
          Promise.all(WEIGHTS.map((w) => document.fonts.load(`${w} 40px "${family}"`).catch(() => null))),
        ),
      );
    }
    for (const lf of b.localFonts) {
      const face = new FontFace(lf.family, `url(${lf.url})`, { weight: lf.weight ?? "400", style: lf.style ?? "normal" });
      tasks.push(face.load().then((f) => document.fonts.add(f)).catch(() => null));
    }
    const tope = new Promise((r) => setTimeout(r, 15000));
    Promise.race([Promise.all(tasks), tope]).then(() => continueRender(handle));
    // Una sola vez por montaje: la marca no cambia a mitad de render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);
};
