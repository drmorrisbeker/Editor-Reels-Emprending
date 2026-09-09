/** Escena: Lista vertical de ítems (barra color + label + cita) entrando uno a uno con spring, título fijo | Tema: componentes del mundo interno | Reusable: con cambios (array ITEMS hardcodeado) */
import {
  AbsoluteFill, Audio, interpolate, Sequence,
  spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";

const BG     = "#0B1929";
const AZUL   = "#4A9EFF";
const BLANCO = "#FFFFFF";
const AMARI  = "#FFCC00";
const DIM    = "#A8C4E0";

// Scene starts at 5240ms.
// Items appear when the speaker mentions each component:
//   EMOCIONES      → delay 1000ms (6240ms absolute)
//   PENSAMIENTOS   → delay 2210ms (7450ms absolute)
//   CUERPO         → delay 4660ms (9900ms absolute)
const ITEMS = [
  {
    label: "EMOCIONES",
    color: AZUL,
    quote: '"Me siento mal · La estoy pasando horrible"',
    delayMs: 1000,
  },
  {
    label: "PENSAMIENTOS",
    color: BLANCO,
    quote: null,
    delayMs: 2210,
  },
  {
    label: "SENSACIONES\nDEL CUERPO",
    color: AMARI,
    quote: null,
    delayMs: 4660,
  },
];

const Item: React.FC<{ label: string; color: string; quote: string | null }> = ({ label, color, quote }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 13, stiffness: 350 } });
  const y  = interpolate(sp, [0, 1], [50, 0]);
  const op = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <>
      <Sequence from={0} durationInFrames={3}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.32} />
      </Sequence>
      <div style={{
        opacity: op,
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        marginBottom: 18,
      }}>
        <div style={{
          width: 10,
          alignSelf: "stretch",
          borderRadius: 6,
          backgroundColor: color,
          flexShrink: 0,
        }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 62,
            color,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            whiteSpace: "pre-line",
          }}>
            {label}
          </span>
          {quote && (
            <span style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontStyle: "italic",
              fontSize: 28,
              color: DIM,
              marginTop: 6,
            }}>
              {quote}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export const MundoInternoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{
      backgroundColor: BG,
      opacity: Math.min(fadeIn, fadeOut),
      justifyContent: "center",
      alignItems: "flex-start",
      flexDirection: "column",
      paddingLeft: 80,
      overflow: "hidden",
    }}>
      <Sequence from={0} durationInFrames={3}>
        <Audio src={staticFile("sfx/woosh.mp3")} volume={0.14} />
      </Sequence>

      <div style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: 28,
        color: DIM,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 36,
      }}>
        tu mundo interno
      </div>

      {ITEMS.map((item, i) => (
        <Sequence key={i} from={Math.round((item.delayMs / 1000) * fps)} layout="none">
          <Item label={item.label} color={item.color} quote={item.quote} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
