import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#0B1929";
const TEXT   = "#FFFFFF";
const ACCENT = "#4A9EFF";
const DIM    = "#A8C4E0";

export const PuertaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const doorEnter = spring({ frame, fps, config: { damping: 18, stiffness: 220 } });
  const doorScale = interpolate(doorEnter, [0, 1], [0.6, 1]);
  const doorOpacity = interpolate(doorEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const titleEnter = spring({ frame: Math.max(0, frame - 6), fps, config: { damping: 15, stiffness: 280 } });
  const titleScale = interpolate(titleEnter, [0, 1], [0.8, 1]);
  const titleOpacity = interpolate(titleEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const subEnter = spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 22, stiffness: 200 } });
  const subOpacity = interpolate(subEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const tag1Enter = spring({ frame: Math.max(0, frame - 22), fps, config: { damping: 18, stiffness: 260 } });
  const tag1Op    = interpolate(tag1Enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const tag1Y     = interpolate(tag1Enter, [0, 1], [18, 0]);

  const doorOpenProgress = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 28, stiffness: 100 } });
  const lightOpacity = interpolate(doorOpenProgress, [0, 1], [0, 0.22], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      <Sequence from={6} durationInFrames={8}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.09} />
      </Sequence>
      <Sequence from={14} durationInFrames={8}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.09} />
      </Sequence>
      <Sequence from={22} durationInFrames={8}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.08} />
      </Sequence>

      {/* Glow */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{
          width: 340, height: 540,
          backgroundColor: ACCENT,
          opacity: lightOpacity,
          filter: "blur(70px)",
          transform: `scale(${doorScale})`,
        }} />
      </AbsoluteFill>

      {/* Door frame */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{
          width: 280, height: 460,
          border: `4px solid ${ACCENT}`,
          borderRadius: 8,
          opacity: doorOpacity,
          transform: `scale(${doorScale})`,
          position: "relative",
        }}>
          <div style={{
            position: "absolute", right: 20, top: "50%",
            width: 14, height: 14, borderRadius: "50%",
            backgroundColor: ACCENT, opacity: 0.7,
          }} />
        </div>
      </AbsoluteFill>

      {/* Title */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 10 }}>
        <div style={{ opacity: titleOpacity, transform: `scale(${titleScale})`, textAlign: "center" }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 82, color: ACCENT, lineHeight: 1.0, letterSpacing: "-0.01em" }}>UNA</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 82, color: TEXT, lineHeight: 1.0, letterSpacing: "-0.01em" }}>PUERTA</div>
        </div>

        <div style={{ marginTop: 20, opacity: subOpacity, textAlign: "center" }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 34, color: `${DIM}AA`, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            algo distinto
          </span>
        </div>

        <div style={{ marginTop: 12, opacity: tag1Op, transform: `translateY(${tag1Y}px)` }}>
          <div style={{
            backgroundColor: `${ACCENT}22`, border: `2px solid ${ACCENT}66`,
            borderRadius: 50, padding: "10px 32px",
          }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 34, color: TEXT, letterSpacing: "0.05em" }}>
              UN CAMINO DIFERENTE
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
