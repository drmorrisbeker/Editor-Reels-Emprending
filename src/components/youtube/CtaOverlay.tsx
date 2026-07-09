import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const CREAM  = "#F7F4EF";
const NAVY   = "#0B1929";
const BLUE   = "#4A9EFF";

export const CtaOverlay: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter   = spring({ frame, fps, config: { damping: 18, stiffness: 260 } });
  const y       = interpolate(enter, [0, 1], [60, 0]);
  const op      = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );

  // Subtle pulse on the arrow icon
  const pulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.9, 1.1],
  );

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 56 }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.10} />
      <div style={{
        opacity: Math.min(op, fadeOut),
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: CREAM,
        borderRadius: 50,
        paddingInline: 32,
        paddingBlock: 16,
        boxShadow: "0 4px 32px rgba(11,25,41,0.18)",
        border: `2px solid ${BLUE}44`,
      }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 22,
          color: NAVY,
          letterSpacing: "-0.01em",
        }}>
          {text}
        </span>
        <span style={{
          fontSize: 24,
          transform: `scale(${pulse})`,
          display: "inline-block",
        }}>
          👇
        </span>
      </div>
    </AbsoluteFill>
  );
};
