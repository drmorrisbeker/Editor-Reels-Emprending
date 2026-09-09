/** Escena: pills de estímulos apareciendo en los bordes + título central "SOBRE ESTIMULADOS". | Tema: sobreestimulación digital | Reusable: con cambios (lista de estímulos y título hardcodeados) */
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#0B1929";
const TEXT   = "#FFFFFF";
const ACCENT = "#4A9EFF";
const DIM    = "#A8C4E0";

const stimuli = [
  { label: "MENSAJES",        top: "7%",  left: "5%"  },
  { label: "NOTIFICACIONES",  top: "7%",  right: "4%" },
  { label: "REDES SOCIALES",  top: "17%", left: "3%"  },
  { label: "EMAILS",          top: "17%", right: "4%" },
  { label: "PENDIENTES",      top: "63%", left: "5%"  },
  { label: "NOTICIAS",        top: "63%", right: "4%" },
  { label: "ALERTAS",         top: "73%", left: "7%"  },
  { label: "VIDEOS",          top: "73%", right: "5%" },
];

const Pill: React.FC<{ label: string; delay: number; position: React.CSSProperties }> = ({
  label, delay, position,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const enter = spring({ frame: f, fps, config: { damping: 18, stiffness: 220 } });
  return (
    <div style={{
      position: "absolute",
      ...position,
      backgroundColor: `${ACCENT}22`,
      border: `2px solid ${ACCENT}88`,
      borderRadius: 50,
      padding: "14px 32px",
      opacity: interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
      transform: `scale(${interpolate(enter, [0, 1], [0.6, 1])})`,
    }}>
      <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 34, color: TEXT, letterSpacing: "0.06em" }}>
        {label}
      </span>
    </div>
  );
};

export const SobreestimuladosScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const titleEnter = spring({ frame, fps, config: { damping: 20, stiffness: 180 } });
  const titleScale = interpolate(titleEnter, [0, 1], [0.7, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      {stimuli.map((_, i) => (
        <Sequence key={i} from={i * 6 + 8} durationInFrames={10}>
          <Audio src={staticFile("sfx/click.mp3")} volume={0.08} />
        </Sequence>
      ))}

      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
        background: `linear-gradient(to top, ${ACCENT}18, transparent)`,
      }} />

      {stimuli.map((s, i) => <Pill key={i} label={s.label} delay={i * 6 + 8} position={s} />)}

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${titleScale})`, textAlign: "center", padding: "0 60px" }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 96, color: ACCENT, lineHeight: 1.0, letterSpacing: "-0.01em" }}>
            SOBRE
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 96, color: TEXT, lineHeight: 1.0, letterSpacing: "-0.01em" }}>
            ESTIMULADOS
          </div>
          <div style={{ marginTop: 20, fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 38, color: DIM, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            24 horas al día
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
