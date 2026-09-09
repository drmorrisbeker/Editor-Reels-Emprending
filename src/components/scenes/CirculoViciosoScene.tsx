/** Escena: Banner "PASO 1" + círculo PENSAMIENTOS→EMOCIONES→CUERPO ("retroalimenta") + banner "PASO 2" | Tema: círculo pensamiento-emoción-cuerpo | Reusable: no (delays fijos a un transcript) */
import {
  AbsoluteFill, Audio, interpolate, Sequence,
  spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";

const BG    = "#0B1929";
const AZUL  = "#4A9EFF";
const AMARI = "#FFCC00";
const ROJO  = "#FF6B6B";
const DIM   = "#A8C4E0";

// Scene starts at 59000ms ("la persona puede empezar a darse cuenta").
// Delays within scene:
//   PASO 1 banner:    delay 0ms
//   Círculo vicioso:  delay 3060ms (cuando dice "no pasa de la nada")
//   PASO 2:           delay 10360ms (cuando dice "qué pueden empezar a hacer")

const Node: React.FC<{ label: string; color: string }> = ({ label, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 14, stiffness: 340 } });
  const op = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const sc = interpolate(sp, [0, 1], [0.7, 1]);
  return (
    <div style={{
      opacity: op,
      transform: `scale(${sc})`,
      backgroundColor: `${color}18`,
      border: `2px solid ${color}88`,
      borderRadius: 20,
      paddingInline: 28,
      paddingBlock: 16,
      textAlign: "center",
    }}>
      <span style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 800,
        fontSize: 38,
        color,
        letterSpacing: "-0.01em",
        lineHeight: 1.1,
        whiteSpace: "pre-line",
      }}>
        {label}
      </span>
    </div>
  );
};

const Arrow: React.FC<{ label?: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 16, stiffness: 300 } });
  const op = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ opacity: op, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      {label && (
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 22, color: DIM, letterSpacing: "0.04em" }}>
          {label}
        </span>
      )}
      <span style={{ fontSize: 32, color: DIM, lineHeight: 1 }}>↕</span>
    </div>
  );
};

const Paso2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 12, stiffness: 380 } });
  const op = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const y  = interpolate(sp, [0, 1], [40, 0]);
  return (
    <>
      <Sequence from={0} durationInFrames={3}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.30} />
      </Sequence>
      <div style={{
        opacity: op,
        transform: `translateY(${y}px)`,
        marginTop: 28,
        backgroundColor: `${AMARI}18`,
        border: `2px solid ${AMARI}88`,
        borderRadius: 24,
        paddingInline: 44,
        paddingBlock: 18,
        display: "flex",
        gap: 16,
        alignItems: "center",
      }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 36,
          color: AMARI,
          letterSpacing: "-0.01em",
        }}>
          PASO 2
        </span>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 32,
          color: DIM,
        }}>
          ¿qué hacer al respecto?
        </span>
      </div>
    </>
  );
};

export const CirculoViciosoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  // PASO 1 banner animation
  const paso1Sp = spring({ frame, fps, config: { damping: 14, stiffness: 360 } });
  const paso1Op = interpolate(paso1Sp, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const paso1Y  = interpolate(paso1Sp, [0, 1], [30, 0]);

  const cicloDelay = Math.round(3060 / 1000 * fps);
  const paso2Delay = Math.round(10360 / 1000 * fps);

  return (
    <AbsoluteFill style={{
      backgroundColor: BG,
      opacity: Math.min(fadeIn, fadeOut),
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <Sequence from={0} durationInFrames={3}>
        <Audio src={staticFile("sfx/woosh.mp3")} volume={0.14} />
      </Sequence>

      {/* PASO 1 banner */}
      <div style={{
        opacity: paso1Op,
        transform: `translateY(${paso1Y}px)`,
        backgroundColor: `${AZUL}18`,
        border: `2px solid ${AZUL}88`,
        borderRadius: 24,
        paddingInline: 44,
        paddingBlock: 18,
        display: "flex",
        gap: 16,
        alignItems: "center",
        marginBottom: 36,
      }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 36,
          color: AZUL,
          letterSpacing: "-0.01em",
        }}>
          PASO 1
        </span>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 32,
          color: DIM,
        }}>
          registrar lo que sentís
        </span>
      </div>

      {/* Círculo vicioso — aparece cuando dice "no pasa de la nada" */}
      <Sequence from={cicloDelay} layout="none">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Sequence from={0} layout="none">
            <Node label="PENSAMIENTOS" color={AZUL} />
          </Sequence>
          <Sequence from={4} layout="none">
            <Arrow />
          </Sequence>
          <Sequence from={8} layout="none">
            <Node label="EMOCIONES" color={ROJO} />
          </Sequence>
          <Sequence from={12} layout="none">
            <Arrow />
          </Sequence>
          <Sequence from={16} layout="none">
            <Node label={"SENSACIONES\nDEL CUERPO"} color={AMARI} />
          </Sequence>
          <Sequence from={20} layout="none">
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
            }}>
              <div style={{
                height: 2,
                width: 280,
                background: `linear-gradient(to left, ${DIM}00, ${DIM}66)`,
              }} />
              <span style={{ fontSize: 28, color: DIM }}>↺</span>
              <span style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: 24,
                color: DIM,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}>
                se retroalimenta
              </span>
            </div>
          </Sequence>
        </div>
      </Sequence>

      {/* PASO 2 — aparece cuando dice "qué pueden empezar a hacer" */}
      <Sequence from={paso2Delay} layout="none">
        <Paso2 />
      </Sequence>
    </AbsoluteFill>
  );
};
