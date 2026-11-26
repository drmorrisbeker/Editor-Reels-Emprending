# Ediciones — los archivos de trabajo de cada proyecto

Una carpeta por reel (`Ediciones/<proyecto>/`) con todo lo que la edición va generando: el clip
con los silencios cortados, la transcripción (`*_captions.json`), los cortes (`*_keep.json`),
la música si hay, y una copia del `Root.tsx` del video (`src/`) para poder volver a renderizarlo.

Remotion lee estos archivos a través de `public/ediciones` (un acceso directo a esta carpeta).
Nada de esto se sube a git.
