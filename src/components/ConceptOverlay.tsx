import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const YELLOW = "#FFD700";

export const ConceptOverlay: React.FC<{ lines: string[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const translateX = interpolate(enter, [0, 1], [-40, 0]);
  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "0 52px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateX(${translateX}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Yellow bullet dots */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 28, color: YELLOW }}>●</span>
          <span style={{ fontSize: 28, color: YELLOW }}>●</span>
        </div>

        {/* Text lines with yellow background */}
        <div
          style={{
            background: "rgba(255, 215, 0, 0.15)",
            borderLeft: `5px solid ${YELLOW}`,
            paddingLeft: 20,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: 58,
                fontWeight: 800,
                fontFamily: "Montserrat, Arial, sans-serif",
                color: "white",
                lineHeight: 1.2,
                WebkitTextStroke: "1px black",
                paintOrder: "stroke fill",
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
