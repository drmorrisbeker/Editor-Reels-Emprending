import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const YELLOW = "#FFD700";

const ListItem: React.FC<{ text: string; index: number; yellow: boolean }> = ({
  text,
  index,
  yellow,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - index * 5,
    fps,
    config: { damping: 200 },
  });
  const translateY = interpolate(enter, [0, 1], [30, 0]);
  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontSize: 80,
        fontWeight: 900,
        fontFamily: "Montserrat, Arial, sans-serif",
        color: yellow ? YELLOW : "white",
        textTransform: "uppercase",
        lineHeight: 1.1,
        textAlign: "center",
        WebkitTextStroke: "2px black",
        paintOrder: "stroke fill",
      }}
    >
      {text}
    </div>
  );
};

export const ListOverlay: React.FC<{ items: string[] }> = ({ items }) => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {items.map((item, i) => (
        <ListItem key={i} text={item} index={i} yellow={i % 2 === 0} />
      ))}
    </AbsoluteFill>
  );
};
