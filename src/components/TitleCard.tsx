import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TitleCard as TitleCardType } from "../schema";

const YELLOW = "#FFD700";

const cardStyle: React.CSSProperties = {
  fontFamily: "Montserrat, Arial, sans-serif",
  lineHeight: 1.1,
};

const NumberedCard: React.FC<{
  number: string;
  line1: string;
  line2?: string;
  line3?: string;
}> = ({ number, line1, line2, line3 }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
    <span
      style={{
        ...cardStyle,
        fontSize: 130,
        fontWeight: 900,
        color: YELLOW,
        lineHeight: 0.9,
        flexShrink: 0,
        WebkitTextStroke: "3px black",
        paintOrder: "stroke fill",
      }}
    >
      {number}
    </span>
    <div style={{ display: "flex", flexDirection: "column", paddingTop: 8 }}>
      <span
        style={{
          ...cardStyle,
          fontSize: 76,
          fontWeight: 900,
          color: "white",
          textTransform: "uppercase",
          WebkitTextStroke: "2px black",
          paintOrder: "stroke fill",
        }}
      >
        {line1}
      </span>
      {line2 && (
        <span
          style={{
            ...cardStyle,
            fontSize: 76,
            fontWeight: 900,
            color: "white",
            textTransform: "uppercase",
            WebkitTextStroke: "2px black",
            paintOrder: "stroke fill",
          }}
        >
          {line2}
        </span>
      )}
      {line3 && (
        <span
          style={{
            ...cardStyle,
            fontSize: 42,
            fontWeight: 600,
            color: "white",
            textTransform: "lowercase",
          }}
        >
          {line3}
        </span>
      )}
    </div>
  </div>
);

const StatementCard: React.FC<{
  lines: { text: string; yellow: boolean }[];
}> = ({ lines }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    {lines.map((line, i) => (
      <span
        key={i}
        style={{
          ...cardStyle,
          fontSize: 84,
          fontWeight: 900,
          color: line.yellow ? YELLOW : "white",
          textTransform: "uppercase",
          WebkitTextStroke: "2px black",
          paintOrder: "stroke fill",
          display: "block",
          textAlign: "center",
        }}
      >
        {line.text}
      </span>
    ))}
  </div>
);

export const TitleCard: React.FC<{
  card: TitleCardType;
  durationInFrames: number;
}> = ({ card, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const exit = spring({
    frame: frame - (durationInFrames - 12),
    fps,
    config: { damping: 200 },
  });

  const translateY = interpolate(enter, [0, 1], [40, 0]);
  const opacity =
    interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" }) *
    interpolate(exit, [0, 1], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: card.type === "numbered" ? "flex-start" : "center",
        padding: "0 52px 180px",
        pointerEvents: "none",
      }}
    >
      <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
        {card.type === "numbered" ? (
          <NumberedCard
            number={card.number}
            line1={card.line1}
            line2={card.line2}
            line3={card.line3}
          />
        ) : (
          <StatementCard lines={card.lines} />
        )}
      </div>
    </AbsoluteFill>
  );
};
