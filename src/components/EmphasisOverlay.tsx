import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const YELLOW = "#FFD700";

export const EmphasisOverlay: React.FC<{
  keyword: string;
  subtext?: string;
}> = ({ keyword, subtext }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 12, stiffness: 280 } });
  const scale = interpolate(enter, [0, 1], [0.8, 1.0]);
  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 160,
            fontWeight: 900,
            fontFamily: "Montserrat, Arial, sans-serif",
            color: YELLOW,
            textTransform: "uppercase",
            lineHeight: 0.9,
            WebkitTextStroke: "3px black",
            paintOrder: "stroke fill",
          }}
        >
          {keyword}
        </span>
        {subtext && (
          <span
            style={{
              fontSize: 68,
              fontWeight: 700,
              fontFamily: "Montserrat, Arial, sans-serif",
              color: "white",
              WebkitTextStroke: "2px black",
              paintOrder: "stroke fill",
            }}
          >
            {subtext}
          </span>
        )}
      </div>
    </AbsoluteFill>
  );
};
