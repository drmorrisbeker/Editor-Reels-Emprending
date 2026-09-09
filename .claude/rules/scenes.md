# Catálogo de escenas reutilizables

Catálogo de las scenes/overlays ya construidos, para reusarlos sin abrir cada archivo.
**Leé el cuerpo de UNA scene solo si la vas a reutilizar** (e importá en `Reel.tsx` solo las que use este video). Para crear una nueva NO copies estas: seguí el template `MiScene` de `.claude/rules/yapping.md`.
Estética canónica = **paleta rehook** (fondo `#f5e9d2`, texto `#162a3e`, acento `#b18060`). OJO: muchas scenes legacy usan la variante **navy** (fondo `#0B1929`, azul `#4A9EFF`, dim `#A8C4E0`) y los 3 overlays viejos usan **amarillo `#FFD700` + Montserrat con stroke negro (deprecado)** — anotado en cada bullet. Todas: fade in/out, woosh/plop/click de `sfx/`.

## Flujo causal / esquemas con flechas (A ↓ B ↓ C)
- **FlujoCausalScene** (`src/components/scenes/FlujoCausalScene.tsx`) — props: `{ label1?, sub1?, label2?, sub2?, label3?, sub3? }` (default MALESTAR→MEDICACIÓN→HERRAMIENTAS). 3 pills apiladas con flechas ↓, nodo 2 en acento. rehook. **El flujo causal genérico y parametrizable — usalo para cualquier "A lleva a B lleva a C".**
- **MedicacionEnseñaScene** (`src/components/scenes/MedicacionEnseñaScene.tsx`) — sin props. MALESTAR ↓ PASTILLA DE REFUERZO ↓ el cerebro aprende "NO PUEDO SOLO". rehook. Cuando explica que medicar de más genera dependencia.
- **ReconocerSaludScene** (`src/components/scenes/ReconocerSaludScene.tsx`) — sin props. RECONOCER lo que sentís ↓ MEJOR SALUD MENTAL. navy. Nombrar/registrar emociones mejora la salud mental.
- **LuchaRefuerzaScene** (`src/components/scenes/LuchaRefuerzaScene.tsx`) — sin props. PELEAR con la emoción ↓ LA REFUERZA + pill "la paradoja del sufrimiento". navy. Resistir la emoción la agranda.

## Círculos viciosos
- **CirculoViciosoScene** (`src/components/scenes/CirculoViciosoScene.tsx`) — sin props. Stack vertical PENSAMIENTOS↕EMOCIONES↕SENSACIONES "se retroalimenta" + banners PASO 1 / PASO 2 con delays internos hardcodeados. navy. Ansiedad como ciclo pensamiento-emoción-cuerpo.
- **CirculoViciosoPanicoScene** (`src/components/scenes/CirculoViciosoPanicoScene.tsx`) — sin props. 4 nodos en círculo (SENSACIÓN FÍSICA→PENSAMIENTO CATASTRÓFICO→EMOCIONES/MIEDO→MÁS SENSACIONES) con anillo giratorio "SE RETROALIMENTA". rehook. Ataque de pánico.
- **CirculoViciosoTocScene** (`src/components/scenes/CirculoViciosoTocScene.tsx`) — sin props. Triángulo OBSESIÓN→COMPULSIÓN→ALIVIO MOMENTÁNEO, anillo giratorio + OBSESIÓN que crece "SE REFUERZA". rehook. Ciclo del TOC.

## Barras y comparativas
- **BarrasEstaticoScene** (`src/components/scenes/BarrasEstaticoScene.tsx`) — sin props. 2 barras verticales "AHORA": MEDICACIÓN alta, HERRAMIENTAS baja. rehook. Estado inicial (par con InversionBarras de scenes/). **DUPLICADO de nombre.**
- **InversionBarrasScene** (`src/components/scenes/InversionBarrasScene.tsx`) — sin props. Mismas barras verticales que se invierten, título "LOS ROLES SE INVIERTEN"→"EN EL FUTURO". rehook. Segundo tiempo del par. **DUPLICADO de nombre.**
- **BarrasEstaticoScene** (`src/components/BarrasEstaticoScene.tsx`) — props: `{ titulo, subtitulo?, barras: {label,value,color?}[] }`. Barras HORIZONTALES genéricas que crecen. rehook. Versión parametrizable. **DUPLICADO de nombre (contenido distinto: genérico vs. hardcodeado).**
- **InversionBarrasScene** (`src/components/InversionBarrasScene.tsx`) — props: `{ tituloInicial, tituloFinal, barras: {label,valorInicial,valorFinal,color?}[] }`. Barras horizontales que pasan de inicial→final con títulos cross-fade. rehook. Versión parametrizable. **DUPLICADO de nombre.**
- **PlazosEstaticoScene** (`src/components/scenes/PlazosEstaticoScene.tsx`) — sin props. 2 barras "AL PRINCIPIO": TOLERANCIA alta, URGENCIA baja (rojo). rehook. Adicciones/tolerancia, estado inicial.
- **PlazosInversionScene** (`src/components/scenes/PlazosInversionScene.tsx`) — sin props. Barras que se invierten "LOS PLAZOS SE ACORTAN"→"CÍRCULO VICIOSO" (rojo). rehook. Segundo tiempo del par de plazos.
- **EtiquetarScene** (`src/components/scenes/EtiquetarScene.tsx`) — sin props. Dos paneles con barra de intensidad: EMOCIÓN INTENSA sin nombre (alta, roja) →NOMBRARLA→ EMOCIÓN IDENTIFICADA con nombre (baja, azul). navy. Poner nombre a la emoción baja su intensidad.

## Antes/después y dos columnas
- **AcompanyarScene** (`src/components/scenes/AcompanyarScene.tsx`) — sin props. Izq "Lo habitual" MOTIVAR/"todo va a estar bien" (dimmed) vs der "Lo que funciona" ESCUCHAR/ESTAR AHÍ (acento). rehook. Cómo acompañar a alguien.
- **CulpaResponsabilidadScene** (`src/components/scenes/CulpaResponsabilidadScene.tsx`) — sin props. NO SOS CULPABLE de lo que te pasó (dimmed) | SÍ SOS RESPONSABLE de qué hacés hoy (acento). rehook. Culpa vs responsabilidad.
- **EliminarVsRegularScene** (`src/components/scenes/EliminarVsRegularScene.tsx`) — sin props. ELIMINAR ✕ "dejar de ser humano" (dimmed) vs REGULAR ✓ "que no te desborde" (acento), separador "vs". rehook. No se elimina la ansiedad, se regula.
- **ModoHacerSerScene** (`src/components/scenes/ModoHacerSerScene.tsx`) — sin props. modo "HACER" (resistir·luchar) →→ modo "SER" (aceptar·estar). navy. Cambio de modo mental.
- **MismoEfectoScene** (`src/components/scenes/MismoEfectoScene.tsx`) — sin props. 2 ítems: MISMO EFECTO POSITIVO ✓ / SIN EL EFECTO ADVERSO ✗; fondo hace fade por ítem (timing hardcodeado). navy. Hay medicación alternativa sin efecto adverso.

## Placas de palabra-impacto (1–2 palabras gigantes + subtítulo/pill)
- **AlgoDistintoScene** (`src/components/scenes/AlgoDistintoScene.tsx`) — sin props. ALGO / DISTINTO. navy. Promesa de algo diferente.
- **CambiaScene** (`src/components/scenes/CambiaScene.tsx`) — sin props. CAMBIA + "tu cerebro · tu vida". navy. El cerebro puede cambiar.
- **CelebrarProgresoScene** (`src/components/scenes/CelebrarProgresoScene.tsx`) — sin props. CELEBRAR / EL PROGRESO + "momento de felicidad". navy. Celebrar avances.
- **ElMaloScene** (`src/components/scenes/ElMaloScene.tsx`) — sin props. EL / MALO + "de la película". navy. La medicación mal vista como villano.
- **LlaveScene** (`src/components/scenes/LlaveScene.tsx`) — sin props. LA LLAVE + "para salvar a esa persona" + "cuando nada más ayuda". navy. La medicación como recurso salvador.
- **RumiacionScene** (`src/components/scenes/RumiacionScene.tsx`) — sin props. SOBRE / PENSAR + "drena tu energía". navy. Rumiación.
- **SacarMedicacionScene** (`src/components/scenes/SacarMedicacionScene.tsx`) — sin props. SACAR / MEDICACIÓN + "el acto más simbólico". navy. Dejar la medicación.
- **SeEntrenaScene** (`src/components/scenes/SeEntrenaScene.tsx`) — sin props. SE / ENTRENA + "es una habilidad". navy. Algo que se practica.
- **TieneTratatamientoScene** (`src/components/scenes/TieneTratatamientoScene.tsx`) — sin props. TIENE / TRATAMIENTO + "lo bueno es esto". navy. El cuadro tiene solución.
- **VidaMediaScene** (`src/components/scenes/VidaMediaScene.tsx`) — sin props. VIDA / MEDIA + "retiro gradual y seguro". navy. Farmacología / bajar dosis.

## Enumeración, listas y pills
- **MundoInternoScene** (`src/components/scenes/MundoInternoScene.tsx`) — sin props. Lista vertical con barra de color: EMOCIONES / PENSAMIENTOS / SENSACIONES DEL CUERPO, timing hardcodeado por audio. navy. Componentes del mundo interno.
- **EfectosAdversosScene** (`src/components/scenes/EfectosAdversosScene.tsx`) — sin props. Ítems con ícono: DESEO SEXUAL ↓, ERECCIÓN ✗, ORGASMO ✗; fondo fade por ítem. navy. Efectos adversos sexuales de medicación.
- **TresMoleculasScene** (`src/components/scenes/TresMoleculasScene.tsx`) — sin props. "3 MOLÉCULAS" + pills Serotonina/Noradrenalina/Dopamina + "energía · motivación". navy. Neurotransmisores.
- **SobreestimuladosScene** (`src/components/scenes/SobreestimuladosScene.tsx`) — sin props. Pills dispersas (MENSAJES, NOTIFICACIONES, REDES, EMAILS…) rodeando "SOBRE ESTIMULADOS / 24 horas al día". navy. Saturación de estímulos.
- **DosComponentesTocScene** (`src/components/scenes/DosComponentesTocScene.tsx`) — sin props. "EL TOC TIENE 2 COMPONENTES" + pills OBSESIONES (rojo) / COMPULSIONES (azul). rehook. Definición del TOC.
- **SenalesAlarmaScene** (`src/components/SenalesAlarmaScene.tsx`) — props: `{ titulo, items: string[], cierre }`. Pills de ítems entrando una a una + flecha ↓ + cierre en acento. rehook. **Lista de señales/criterios parametrizable** (ej. cuándo avisar al psiquiatra).

## Placas de número / concepto (sobre el video con blur)
- **NumeroConceptoScene** (`src/components/scenes/NumeroConceptoScene.tsx`) — props: `{ numero, linea1, linea2 }`. Número grande en accent-soft `#DFBE9A` + divisor blanco + concepto 2 líneas, blur del video de fondo. Cuando el Dr. enumera puntos explícitos ("el primero es…"). Ver workflow en yapping.md.

## Diagramas y placas especiales
- **CurvaOzempicScene** (`src/components/scenes/CurvaOzempicScene.tsx`) — props: `{ fase: "bajada" | "rebote" }`. Gráfico peso/tiempo: "CON OZEMPIC" (baja) o "AL SUSPENDERLO" (rebota, rojo). rehook. Efecto rebote de fármacos para bajar de peso.
- **NeuroplasticidadScene** (`src/components/scenes/NeuroplasticidadScene.tsx`) — sin props. Red neuronal animada (nodos + líneas) + "NEUROPLASTICIDAD" + tags NUEVAS CONEXIONES / TU CEREBRO CAMBIA. navy. Plasticidad cerebral.
- **PresenteMomentoScene** (`src/components/scenes/PresenteMomentoScene.tsx`) — sin props. ESTAR / PLENAMENTE / PRESENTE con círculo glow que pulsa + "sin estímulos". navy. Mindfulness / presente.
- **PuertaScene** (`src/components/scenes/PuertaScene.tsx`) — sin props. Marco de puerta dibujado con glow + UNA / PUERTA "algo distinto" / "UN CAMINO DIFERENTE". navy. Metáfora de la puerta/nuevo camino.
- **AnsiedadFuturoScene** (`src/components/scenes/AnsiedadFuturoScene.tsx`) — sin props. Línea de tiempo horizontal PASADO–PRESENTE–FUTURO con FUTURO activo/glow "ANSIEDAD". navy. La ansiedad vive en el futuro.
- **MitoScene** (`src/components/scenes/MitoScene.tsx`) — sin props. ¿FRACASASTE? ¿DÉBIL? (rojo) + "eso es lo que algunos creen" + tag "ES UN MITO". navy. Desmentir un mito/estigma.
- **HabitoScene** (`src/components/scenes/HabitoScene.tsx`) — props: `{ habito, subtitulo?, color? }` (default azul). Pill grande con el nombre de un hábito + subtítulo. rehook. Nombrar un hábito/acción concreta.
- **LineaTiempoScene** (`src/components/LineaTiempoScene.tsx`) — props: `{ titulo, pasos: {dia,texto,acento?}[] }`. Timeline vertical con dots y línea conectora, último paso en acento. rehook. **Secuencia temporal parametrizable** (ej. efectos transitorios día a día).

## Overlays antiguos (paleta amarilla `#FFD700` + Montserrat/stroke negro — DEPRECADO, no usar en videos nuevos)
- **ConceptOverlay** (`src/components/ConceptOverlay.tsx`) — props: `{ lines: string[] }`. Bloque de texto con fondo amarillo translúcido + bullets, sobre el video. Deprecado.
- **EmphasisOverlay** (`src/components/EmphasisOverlay.tsx`) — props: `{ keyword, subtext? }`. Palabra gigante amarilla centrada. Deprecado (hoy el énfasis va en subtítulos).
- **ListOverlay** (`src/components/ListOverlay.tsx`) — props: `{ items: string[] }`. Lista centrada alternando amarillo/blanco. Deprecado.

## Placa neutra (rehook, sin flechas)
- **RehookScene** (`src/components/RehookScene.tsx`) — props: `{ linea1, linea2?, acento? }`. Placa de texto simple sobre gradiente crema, entra slide-up + `sfx/flash.mp3` (cámara). Confirma/tensiona el gancho en el momento exacto en que el Dr. lo dice. Ver criterios en yapping.md.

## Duplicados / a consolidar
- **BarrasEstaticoScene** — existe en `src/components/scenes/BarrasEstaticoScene.tsx` (sin props, barras verticales hardcodeadas MEDICACIÓN/HERRAMIENTAS) y en `src/components/BarrasEstaticoScene.tsx` (con props, barras horizontales genéricas). Contenido distinto.
- **InversionBarrasScene** — existe en `src/components/scenes/InversionBarrasScene.tsx` (sin props, inversión vertical hardcodeada) y en `src/components/InversionBarrasScene.tsx` (con props `tituloInicial/tituloFinal/barras`, inversión horizontal genérica). Contenido distinto.
