import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Metáfora central del video: el cuerpo funciona como una balanza en equilibrio
// (medicación + tratamiento). Si se saca el peso de golpe, la balanza se desequilibra.
// Fase 1: balanza equilibrada con dos pesos. Fase 2: se retira un peso de golpe y vuelca.
// Paleta rehook: fondo #f5e9d2, texto #162a3e, acento #b18060.
export const BalanzaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const ACCENT = "#b18060";
  const DARK = "#162a3e";
  const RED = "#c0492f";

  const fadeIn = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  // Momento en que se saca el peso (frame ~58)
  const PULL = 58;

  // Peso derecho: presente en fase 1, sale volando en fase 2
  const rightWeightOp = interpolate(frame, [PULL, PULL + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rightWeightY = interpolate(frame, [PULL, PULL + 16], [0, -220], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // La viga vuelca: el lado izquierdo (todavía con peso) baja. Ángulo negativo hunde la izquierda.
  const angle = interpolate(frame, [PULL + 4, PULL + 26], [0, -15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const titleEnter = spring({ frame: Math.max(0, frame - 2), fps, config: { damping: 13, stiffness: 340 } });
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(titleEnter, [0, 1], [40, 0]);

  // Etiqueta inferior cambia al volcar
  const label1Op = interpolate(frame, [8, 16, PULL - 4, PULL + 2], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const label2Op = interpolate(frame, [PULL + 6, PULL + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const CX = 300;
  const beamY = 170;
  const armL = 190;

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      {/* plop de los dos pesos al inicio */}
      <Sequence from={6} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>
      {/* click cuando vuelca */}
      <Sequence from={PULL} durationInFrames={6}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.08} />
      </Sequence>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", padding: "0 70px" }}>
        <div style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 62,
          color: DARK,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          textAlign: "center",
          lineHeight: 1.05,
          marginBottom: 30,
        }}>
          El cuerpo es<br />una balanza
        </div>

        <svg width={600} height={430} viewBox="0 0 600 430">
          {/* base / poste */}
          <rect x={CX - 14} y={beamY} width={28} height={210} rx={8} fill={DARK} />
          <rect x={CX - 90} y={400} width={180} height={20} rx={10} fill={DARK} />

          {/* viga que rota */}
          <g transform={`rotate(${angle} ${CX} ${beamY})`}>
            <rect x={CX - armL} y={beamY - 8} width={armL * 2} height={16} rx={8} fill={ACCENT} />
            {/* colgante izquierdo */}
            <line x1={CX - armL} y1={beamY} x2={CX - armL} y2={beamY + 60} stroke={DARK} strokeWidth={4} />
            <circle cx={CX - armL} cy={beamY + 92} r={44} fill={DARK} />
            {/* colgante derecho */}
            <line x1={CX + armL} y1={beamY} x2={CX + armL} y2={beamY + 60} stroke={DARK} strokeWidth={4} />
            <g style={{ opacity: rightWeightOp, transform: `translateY(${rightWeightY}px)` }}>
              <circle cx={CX + armL} cy={beamY + 92} r={44} fill={ACCENT} />
            </g>
          </g>

          {/* pivote */}
          <polygon points={`${CX - 30},${beamY + 40} ${CX + 30},${beamY + 40} ${CX},${beamY - 10}`} fill={DARK} />
        </svg>

        <div style={{ height: 74, position: "relative", width: "100%", textAlign: "center", marginTop: 6 }}>
          <div style={{
            position: "absolute", width: "100%", opacity: label1Op,
            fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 44, color: DARK, letterSpacing: "-0.01em",
          }}>
            EN EQUILIBRIO
          </div>
          <div style={{
            position: "absolute", width: "100%", opacity: label2Op,
            fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 48, color: RED, letterSpacing: "-0.02em", lineHeight: 1.05,
          }}>
            LA SACÁS DE GOLPE<br />
            <span style={{ fontSize: 40 }}>y se desequilibra</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
