import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const HookText: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 } });
  const opacity = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(enter, [0, 1], [-12, 0]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: "16%",
          left: 0,
          right: 0,
          textAlign: "center",
          padding: "0 56px",
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        <span
          style={{
            fontSize: 64,
            fontWeight: 800,
            fontFamily: "Inter, sans-serif",
            color: "#FFFFFF",
            WebkitTextStroke: "2px #0F2135",
            paintOrder: "stroke fill",
            lineHeight: 1.25,
            display: "inline-block",
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};
