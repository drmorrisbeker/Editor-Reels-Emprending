# Marcas

Cada marca es una carpeta `marcas/<id>/` (el `<id>` en minúsculas y sin espacios, ej.
`mi-marca`). La arma Claude en el arranque del primer reel (`.claude/rules/arranque.md`), pero
se puede editar a mano. La plantilla la encuentra sola: no hay que registrar nada en el código.

```
marcas/<id>/
  marca.json          ← colores, tipografías, logo y tipo de portada (abajo)
  logo.png            ← opcional
  fuentes/*.ttf       ← opcional, tipografías propias que no están en Google Fonts
  Portada.tsx         ← opcional, portada propia (recreada de tus referencias)
  referencias/        ← opcional, capturas de portadas que te gustan
  cliente-ideal.md    ← opcional, a quién le habla la marca (lo usan títulos, ganchos y caption)
  perfil-caption.md   ← opcional, voz, público, CTA y hashtags propios del caption
```

Las marcas reales no se suben a git (solo este README y `ejemplo/`).

## marca.json

Todo es opcional: lo que falta sale de la marca por defecto.

| campo | qué es |
|---|---|
| `nombre` | nombre de la marca |
| `navy` | color del velo de la portada (detrás del texto, abajo) |
| `accent` | color de acento |
| `portadaTitleFont` | tipografía del título de la portada |
| `portadaHighlight` | color de la segunda línea de la portada |
| `subtitleFont` | tipografía de los subtítulos y del cartel de gancho |
| `hookBg` / `hookFg` | fondo y texto del cartel de gancho |
| `logoText`, `logoFont`, `logoColor` | logo de texto arriba a la derecha de la portada |
| `logoImg`, `logoImgWidth` | logo de imagen (archivo de esta carpeta); pisa al de texto |
| `googleFonts` | familias de Google Fonts a cargar, formato css2: `"Montserrat:wght@700;900"`, `"Instrument Serif:ital@0;1"` |
| `localFonts` | fuentes propias: `[{ "family": "Mi Fuente", "file": "fuentes/MiFuente-Black.ttf", "weight": "900" }]` |
| `portada` | `"default"` (la de la plantilla) · `"propia"` (usa `Portada.tsx` de esta carpeta) · `"ninguna"` |

Los subtítulos son blancos en todas las marcas (con sombra), para que se lean sobre cualquier
video. La tipografía sí cambia por marca.

## Ver cómo queda

```bash
npx remotion still Marca-Preview out/marca-portada.png --frame=0 --props='{"brand":"<id>"}'
npx remotion still Marca-Preview out/marca-gancho.png  --frame=1 --props='{"brand":"<id>"}'
```

## Portada propia

`marcas/<id>/Portada.tsx` exporta `Portada` con estas props (las mismas que la de la plantilla):

```tsx
import { AbsoluteFill } from "remotion";
import type { PortadaProps } from "../../src/marcas";

export const Portada: React.FC<PortadaProps> = ({ titulo, linea2, brand }) => (
  <AbsoluteFill>{/* … */}</AbsoluteFill>
);
```

Se ve solo en los frames 0-1 (la tapa del feed). El texto tiene que quedar dentro de la zona
segura: arriba de y≈1490 y lejos de la columna de botones de la derecha.
