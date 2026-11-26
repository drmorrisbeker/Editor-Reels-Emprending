# Yapping — una persona hablando a cámara

## Cámara quieta, cortes secos, sin zoom ni escenas
Ningún movimiento de cámara (ni zoom de apertura, ni punch-ins, ni pushes) y ninguna escena o
placa de concepto encima del video. Los jump-cuts del corte de silencios van secos. No
proponerlos aunque el contenido "se preste": la plantilla no los tiene.

**Cortes limpios:** ningún tramo entre dos cortes dura menos de 0,5 s
(`desilence.py --min-seg 0.5`, default). Un tramo de 2–13 cuadros se ve como una foto que
rompe la imagen.

## Clicks sutiles
`clicksMs` en Root.tsx: `sfx/click.mp3` a vol 0.03 en las **3–4 frases más contundentes +
el cierre**. Nunca en transiciones ni muletillas. Si no hay frases claramente fuertes, ninguno.
