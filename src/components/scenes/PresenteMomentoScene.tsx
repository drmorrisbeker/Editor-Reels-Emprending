/** Escena: círculo glow pulsante + 3 palabras en cascada ("ESTAR PLENAMENTE PRESENTE") con subtítulo. | Tema: mindfulness / desconexión de estímulos | Reusable: con cambios (texto hardcodeado) */
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#0B1929";
const TEXT   = "#FFFFFF";
const ACCENT = "#4A9EFF";
const DIM    = "#A8C4E0";

const Word: React.FC<{ text: string; delay: number; size: number; color: string }> = ({
  text, delay, size, color,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const enter = spring({ frame: f, fps, config: { damping: 24, stiffness: 160 } });
  return (
    <div style={{
      opacity: interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
      transform: `scale(${interpolate(enter, [0, 1], [0.85, 1])}) translateY(${interpolate(enter, [0, 1], [20, 0])}px)`,
      textAlign: "center",
    }}>
      <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: size, color, letterSpacing: "-0.01em", lineHeight: 1.0, display: "block" }}>
        {text}
      </span>
    </div>
  );
};

export const PresenteMomentoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const pulse = spring({ frame, fps, config: { damping: 8, stiffness: 40 } });
  const circleScale   = interpolate(pulse, [0, 1], [0.3, 1]);
  const circleOpacity = interpolate(pulse, [0, 0.6], [0, 0.12], { extrapolateRight: "clamp" });

  const subtitleOpacity = interpolate(
    spring({ frame: Math.max(0, frame - 28), fps, config: { damping: 26, stiffness: 140 } }),
    [0, 1], [0, 1], { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      {/* Plop suave por cada palabra */}
      <Sequence from={4} durationInFrames={10}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.09} />
      </Sequence>
      <Sequence from={12} durationInFrames={10}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.09} />
      </Sequence>
      <Sequence from={20} durationInFrames={10}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.10} />
      </Sequence>

      {/* Soft glow circle */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{
          width: 700, height: 700, borderRadius: "50%",
          backgroundColor: ACCENT,
          opacity: circleOpacity,
          transform: `scale(${circleScale})`,
        }} />
      </AbsoluteFill>

      {/* Words */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 8, padding: "0 60px" }}>
        <Word text="ESTAR"       delay={4}  size={110} color={ACCENT} />
        <Word text="PLENAMENTE"  delay={12} size={88}  color={DIM} />
        <Word text="PRESENTE"    delay={20} size={118} color={TEXT} />
      </AbsoluteFill>

      {/* Subtitle */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 260 }}>
        <span style={{
          fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 36,
          color: `${DIM}AA`, letterSpacing: "0.12em", textTransform: "uppercase",
          opacity: subtitleOpacity,
        }}>
          sin estímulos
        </span>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
