import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const CREAM    = "#F7F4EF";
const NAVY     = "#0B1929";
const BLUE     = "#4A9EFF";
const YELLOW   = "#FFCC00";
const NAVY_DIM = "#6B8FAE";

// Parses "40%" → { number: 40, suffix: "%" } or "1 de cada 3" → raw string
function parseValue(value: string): { isNumeric: true; number: number; suffix: string } | { isNumeric: false } {
  const match = value.match(/^(\d+(?:\.\d+)?)(%|x)?$/);
  if (match) return { isNumeric: true, number: parseFloat(match[1]), suffix: match[2] ?? "" };
  return { isNumeric: false };
}

export const AnimatedStat: React.FC<{
  value: string;
  label: string;
  source?: string;
}> = ({ value, label, source }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 8],  [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const bgEnter = spring({ frame, fps, config: { damping: 16, stiffness: 200 } });
  const bgScale = interpolate(bgEnter, [0, 1], [0.92, 1]);

  const numEnter  = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 12, stiffness: 260 } });
  const numProg   = interpolate(numEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const labelEnter = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 14, stiffness: 240 } });
  const labelY     = interpolate(labelEnter, [0, 1], [16, 0]);
  const labelOp    = interpolate(labelEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const parsed = parseValue(value);
  const displayValue = parsed.isNumeric
    ? `${Math.round(parsed.number * numProg)}${parsed.suffix}`
    : value;

  // Bar width animates for percentage values
  const barWidth = parsed.isNumeric && parsed.suffix === "%"
    ? numProg * parsed.number
    : null;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.13} />

      <div style={{
        opacity,
        transform: `scale(${bgScale})`,
        background: CREAM,
        borderRadius: 20,
        padding: "48px 64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 8px 60px rgba(11,25,41,0.16)",
        minWidth: 480,
        maxWidth: 700,
      }}>
        {/* Big value */}
        <div style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 120,
          color: YELLOW,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          textShadow: "0 2px 0 rgba(11,25,41,0.08)",
        }}>
          {displayValue}
        </div>

        {/* Bar (only for %) */}
        {barWidth !== null && (
          <div style={{ width: "100%", height: 8, background: `${NAVY}18`, borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              width: `${barWidth}%`,
              height: "100%",
              background: BLUE,
              borderRadius: 4,
              transition: "none",
            }} />
          </div>
        )}

        {/* Label */}
        <div style={{
          opacity: labelOp,
          transform: `translateY(${labelY}px)`,
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 26,
            color: NAVY,
            lineHeight: 1.3,
            maxWidth: 500,
          }}>
            {label}
          </div>
          {source && (
            <div style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: 16,
              color: NAVY_DIM,
              marginTop: 8,
              letterSpacing: "0.02em",
            }}>
              {source}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
