# Plantillas / Marcas — Reels Dr. Beker

Fuente de verdad **humana** de las dos marcas. El código las implementa en `src/brand.ts`
(`BRANDS`, `getBrand`) — este md es la referencia que la skill/agente carga **solo cuando
la necesita** (elegir marca, ajustar identidad). No hace falta leerlo en cada video.

Los reels soportan **dos marcas**, elegidas al arranque vía prop `brand`
(`"beker"` | `"clubdeterapia"`) en Root.tsx. Difieren en tipografía de portada, color de
acento, portada y cartel de gancho. **Los subtítulos son iguales en ambas**: Inter ExtraBold
(800), renglón junto (modo "page"), todo blanco, 74px.

## Tabla comparativa

| | **beker** (Dr. Morris Beker) | **clubdeterapia** (Club de Terapia) |
|---|---|---|
| Navy base | `#0F2135` | `#0F2135` |
| Acento | cobre-soft `#DFBE9A` | cobre `#A78768` |
| Subtítulos | Inter 800, blanco | Inter 800, blanco |
| Portada — título (línea 1) | **Inter** 900, blanco | **Geist** Black, blanco |
| Portada — gancho (línea 2) | cobre `#DFBE9A` | crema `#FCF0EA` |
| Logo en portada | — (ninguno) | "club de terapia" en **Instrument Serif** (itálica), arriba a la derecha, crema `#FCF0EA` |
| Cartel de gancho (ThumbnailCover) | fondo navy `#0F2135` / texto blanco | fondo blanco / texto navy `#0F2135` |
| Fuente del cartel de gancho | Inter 800 | Inter 800 |

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
