import {
  AbsoluteFill, Audio, interpolate, Sequence,
  spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";

const BG   = "#0B1929";
const ROJO = "#FF6B6B";
const AZUL = "#4A9EFF";
const DIM  = "#A8C4E0";

const BAR_HIGH = 200;
const BAR_LOW  = 72;

// Scene starts at 45760ms ("ya disminuye la intensidad").
// Panel izquierdo "SIN NOMBRE" aparece de inmediato.
// Panel derecho "CON NOMBRE" aparece a 2000ms.
const Panel: React.FC<{
  title: string;
  subtitle: string;
  color: string;
  barHeight: number;
  label: string;
}> = ({ title, subtitle, color, barHeight, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp  = spring({ frame, fps, config: { damping: 12, stiffness: 350 } });
  const op  = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const y   = interpolate(sp, [0, 1], [60, 0]);

  const barSp = spring({ frame, fps, config: { damping: 18, stiffness: 280 } });
  const h   = interpolate(barSp, [0, 1], [0, barHeight]);

  return (
    <>
      <Sequence from={0} durationInFrames={3}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.30} />
      </Sequence>
      <div style={{
        opacity: op,
        transform: `translateY(${y}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        width: 340,
      }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 500,
          fontSize: 24,
          color: DIM,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          {subtitle}
        </span>

        {/* Intensity bar */}
        <div style={{
          width: 80,
          height: BAR_HIGH,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
        }}>
          <div style={{
            width: 80,
            height: h,
            backgroundColor: color,
            borderRadius: 8,
            opacity: 0.9,
          }} />
        </div>

        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 46,
          color,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          textAlign: "center",
          whiteSpace: "pre-line",
        }}>
          {title}
        </span>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
          fontSize: 26,
          color: DIM,
          textAlign: "center",
        }}>
          {label}
        </span>
      </div>
    </>
  );
};

export const EtiquetarScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  const arrowF = Math.max(0, frame - Math.round(2000 / 1000 * fps) + 5);
  const arrowSp = spring({ frame: arrowF, fps, config: { damping: 16, stiffness: 320 } });
  const arrowOp = interpolate(arrowSp, [0, 1], [0, 1], { extrapolateRight: "clamp" });

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

      <div style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: 28,
        color: DIM,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 40,
      }}>
        etiquetar emociones
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {/* Panel izquierdo — SIN NOMBRE */}
        <Panel
          title={"EMOCIÓN\nINTENSA"}
          subtitle="sin nombre"
          color={ROJO}
          barHeight={BAR_HIGH}
          label="difícil de manejar"
        />

        {/* Flecha */}
        <div style={{
          opacity: arrowOp,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          width: 120,
          paddingBottom: 40,
        }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: DIM,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>
            NOMBRARLA
          </span>
          <span style={{ fontSize: 44, color: DIM }}>→</span>
        </div>

        {/* Panel derecho — CON NOMBRE */}
        <Sequence from={Math.round(2000 / 1000 * fps)} layout="none">
          <Panel
            title={"EMOCIÓN\nIDENTIFICADA"}
            subtitle="con nombre"
            color={AZUL}
            barHeight={BAR_LOW}
            label="más manejable"
          />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
