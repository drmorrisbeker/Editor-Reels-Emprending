import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const CREAM   = "#F7F4EF";
const NAVY    = "#0B1929";
const BLUE    = "#4A9EFF";
const YELLOW  = "#FFCC00";

export const LowerThird: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18, stiffness: 280 } });
  const y     = interpolate(enter, [0, 1], [80, 0]);
  const op    = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: "0 72px 96px" }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.10} />
      <div style={{
        opacity: Math.min(op, fadeOut),
        transform: `translateY(${y}px)`,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 4px 32px rgba(11,25,41,0.18)",
      }}>
        {/* Yellow accent bar */}
        <div style={{ width: 6, background: YELLOW, flexShrink: 0 }} />
        {/* Content */}
        <div style={{
          background: CREAM,
          paddingInline: 24,
          paddingBlock: 14,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: NAVY,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}>
            Dr. Morris Beker
          </span>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: 19,
            color: BLUE,
            letterSpacing: "0.01em",
          }}>
            Médico Psiquiatra
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
