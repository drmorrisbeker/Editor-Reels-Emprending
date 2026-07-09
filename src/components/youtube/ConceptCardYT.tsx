import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const CREAM    = "#F7F4EF";
const NAVY     = "#0B1929";
const BLUE     = "#4A9EFF";
const YELLOW   = "#FFCC00";
const NAVY_DIM = "#6B8FAE";

export const ConceptCardYT: React.FC<{
  numero: string;
  title: string;
  subtitle?: string;
}> = ({ numero, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 6],  [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const numEnter = spring({ frame, fps, config: { damping: 10, stiffness: 380 } });
  const numScale = interpolate(numEnter, [0, 1], [0.4, 1]);
  const numOp    = interpolate(numEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const lineEnter = spring({ frame: Math.max(0, frame - 4), fps, config: { damping: 18, stiffness: 280 } });
  const lineW     = interpolate(lineEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const textEnter = spring({ frame: Math.max(0, frame - 7), fps, config: { damping: 14, stiffness: 260 } });
  const textY     = interpolate(textEnter, [0, 1], [20, 0]);
  const textOp    = interpolate(textEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      backgroundColor: `rgba(247,244,239,${opacity * 0.95})`,
      justifyContent: "center",
      alignItems: "center",
    }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.13} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {/* Number */}
        <div style={{ opacity: numOp, transform: `scale(${numScale})` }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 900,
            fontSize: 160,
            color: YELLOW,
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}>
            {numero}
          </span>
        </div>

        {/* Horizontal divider */}
        <div style={{
          width: `${lineW * 320}px`,
          height: 4,
          background: NAVY,
          borderRadius: 2,
          margin: "4px 0 16px",
        }} />

        {/* Title */}
        <div style={{ opacity: textOp, transform: `translateY(${textY}px)`, textAlign: "center" }}>
          <div style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: 56,
            color: NAVY,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            maxWidth: 720,
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: 26,
              color: NAVY_DIM,
              marginTop: 12,
              letterSpacing: "0.01em",
            }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
