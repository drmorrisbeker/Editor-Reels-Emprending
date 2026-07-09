import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG   = "#0B1929";
const DIM  = "#A8C4E0";
const MYTH = "#FF6B6B";
const ACCENT = "#4A9EFF";

const MythWord: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 11, stiffness: 380 } });
  const opacity = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(enter, [0, 1], [60, 0]);
  const scale = interpolate(enter, [0, 1], [0.7, 1]);

  return (
    <div style={{ opacity, transform: `scale(${scale}) translateY(${y}px)`, textAlign: "center" }}>
      <span style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 900,
        fontSize: 96,
        color: MYTH,
        letterSpacing: "-0.02em",
        lineHeight: 1.0,
        display: "block",
      }}>
        {text}
      </span>
    </div>
  );
};

export const MitoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const subtitleEnter = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 20, stiffness: 260 } });
  const subtitleOpacity = interpolate(subtitleEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  // "MITO" tag aparece después de los dos mitos
  const tagEnter = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 14, stiffness: 320 } });
  const tagOp    = interpolate(tagEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const tagScale = interpolate(tagEnter, [0, 1], [0.6, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      <Sequence from={3} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>
      <Sequence from={8} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>
      <Sequence from={22} durationInFrames={6}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.07} />
      </Sequence>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 14, padding: "0 60px" }}>
        <MythWord text="¿FRACASASTE?" delay={3} />
        <MythWord text="¿DÉBIL?"      delay={8} />

        <div style={{ marginTop: 24, opacity: subtitleOpacity }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 32,
            color: `${DIM}99`,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
          }}>eso es lo que algunos creen</span>
        </div>

        <div style={{ marginTop: 16, opacity: tagOp, transform: `scale(${tagScale})` }}>
          <div style={{
            backgroundColor: `${MYTH}22`, border: `2px solid ${MYTH}88`,
            borderRadius: 50, padding: "8px 28px",
          }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 30, color: MYTH, letterSpacing: "0.12em" }}>
              ES UN MITO
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
