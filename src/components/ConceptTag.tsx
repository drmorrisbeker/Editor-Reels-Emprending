import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const NAVY   = "#0F2135";
const COPPER = "#A78768";

export const ConceptTag: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 22, stiffness: 260 } });
  const exit  = spring({
    frame: frame - (durationInFrames - 10),
    fps,
    config: { damping: 22, stiffness: 260 },
  });

  const x       = interpolate(enter, [0, 1], [-340, 0]);
  const opacity =
    interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" }) *
    interpolate(exit,  [0, 1], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "flex-start",
        padding: "0 0 580px 48px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          transform: `translateX(${x}px)`,
          opacity,
          backgroundColor: `${NAVY}E6`,  // navy 90% opaque
          borderLeft: `5px solid ${COPPER}`,
          borderRadius: "0 10px 10px 0",
          padding: "12px 28px 12px 22px",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 38,
            color: "#FFFFFF",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
    </AbsoluteFill>
  );
};
