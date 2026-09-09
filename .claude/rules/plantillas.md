# Plantillas / Marcas — Reels Dr. Beker

Fuente de verdad **humana** de las dos marcas. El código las implementa en `src/brand.ts`
(`BRANDS`, `getBrand`) — este md es la referencia que la skill/agente carga **solo cuando
la necesita** (elegir marca, ajustar identidad). No hace falta leerlo en cada video.

Los reels soportan **tres marcas**, elegidas al arranque vía prop `brand`
(`"beker"` | `"clubdeterapia"` | `"foropsiquiatria"`) en Root.tsx. Difieren en tipografía de
portada, color de acento/velo, portada y cartel de gancho. **Los subtítulos son iguales en
todas**: Inter ExtraBold (800), renglón junto (modo "page"), todo blanco, 74px.

## Tabla comparativa

| | **beker** (Dr. Morris Beker) | **clubdeterapia** (Club de Terapia) | **foropsiquiatria** (Foro Psiquiatría) |
|---|---|---|---|
| Velo de portada (`navy`) | `#0F2135` | `#0F2135` | `#070C53` (navy profundidad) |
| Acento | cobre-soft `#DFBE9A` | cobre `#A78768` | amarillo `#EFA501` |
| Subtítulos | Inter 800, blanco | Inter 800, blanco | Inter 800, blanco |
| Portada — título (línea 1) | **Inter** 900, blanco | **Geist** Black, blanco | **Inter** 900, blanco |
| Portada — gancho (línea 2) | cobre `#DFBE9A` | crema `#FCF0EA` | amarillo `#EFA501` |
| Logo en portada | — | "club de terapia" (**Instrument Serif** itálica), arriba-der. | sello **imagen** `logos/foropsiquiatria.png`, arriba-der. |
| Cartel de gancho (bg / texto) | navy `#0F2135` / blanco | blanco / navy `#0F2135` | azul `#0A127F` / blanco |
| Fuente del cartel de gancho | Inter 800 | Inter 800 | Inter 800 |

### Paleta institucional Foropsiquiatría (referencia completa)
Obligatorios: Azul `#0A127F` · Amarillo `#EFA501` · Navy `#070C53` (profundidad).
Fondos claros: Marfil `#F7F4EE` · Mist `#E7E7F2` · Soft gold `#FDF2D9` · Blanco `#FFFFFF`.
Estados del azul: Hover `#0C1699` · Press `#080F66`. (Guardados en `brand.foropsiquiatria.palette`.)
El logo es un **sello circular** (patrón floral azul/amarillo + "FORO PSIQUIATRÍA" en blanco) →
va como imagen en `public/logos/foropsiquiatria.png` (`logoImgSrc`).

## Portada (común a ambas) — estilo "blur navy abajo"
La cara del locutor queda **limpia arriba**; el texto va **al pie** (`bottom: 430`, zona segura)
sobre un velo navy difuminado que sale del borde inferior. El velo es **sutil y transicional**
(se sigue viendo la foto): `backdropFilter: blur(18px)` en la mitad inferior + `background` en
degradé navy (opacidad máx ~0.62) + `maskImage` largo con alfas intermedios que disuelve el
desenfoque hacia arriba en vez de cortar con línea. La legibilidad la sostiene el `textShadow`
doble, no la opacidad. Frames 0-1 (thumbnail del feed).

## Fuentes (cargadas en `src/index.css`)
Inter, Montserrat, Geist, Instrument Serif (+ Poppins por compatibilidad con proyectos viejos).
Si agregás una marca nueva, cargá su fuente acá y sumá la entrada en `src/brand.ts`.

## Cómo se aplica en el código
`Reel.tsx`/`Reaction.tsx` hacen `const b = getBrand(brand)` y pasan `b` (o sus campos) a
`Portada` (`brand={b}`), `ThumbnailCover` (`bgColor`/`fgColor`/`fontFamily`) y `Subtitles`
(`fontFamily`). Para tocar colores/fuentes de una marca, editar **solo** `src/brand.ts`.

## Agregar una marca nueva
1. Cargar su tipografía en `src/index.css`.
2. Agregar la entrada en `BRANDS` de `src/brand.ts` (navy, accent, subtitleFont,
   portadaTitleFont, portadaHighlight, hookBg, hookFg, y opcional logoText/logoFont/logoColor).
3. Sumar el id al `z.enum([...])` de `src/schema.ts` (y `src/reactionSchema.ts`).
4. Documentar acá en la tabla.
