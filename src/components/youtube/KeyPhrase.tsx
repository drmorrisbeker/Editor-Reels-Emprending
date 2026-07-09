import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const CREAM  = "#F7F4EF";
const NAVY   = "#0B1929";
const YELLOW = "#FFCC00";

type Position = "bottom-left" | "bottom-right" | "top-right";

const POSITIONS: Record<Position, React.CSSProperties> = {
  "bottom-left":  { bottom: 110, left: 72 },
  "bottom-right": { bottom: 110, right: 72 },
  "top-right":    { top: 80,    right: 72 },
};

export const KeyPhrase: React.FC<{
  text: string;
  position?: Position;
}> = ({ text, position = "bottom-right" }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter  = spring({ frame, fps, config: { damping: 16, stiffness: 320 } });
  const y      = interpolate(enter, [0, 1], [20, 0]);
  const op     = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );

  const pos = POSITIONS[position];

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute",
        ...pos,
        opacity: Math.min(op, fadeOut),
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        gap: 0,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 3px 20px rgba(11,25,41,0.20)",
        maxWidth: 480,
      }}>
        {/* Yellow left bar */}
        <div style={{ width: 5, background: YELLOW, alignSelf: "stretch", flexShrink: 0 }} />
        {/* Text */}
        <div style={{
          background: CREAM,
          paddingInline: 20,
          paddingBlock: 12,
        }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: NAVY,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            display: "block",
          }}>
            {text}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
