import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const CREAM   = "#F7F4EF";
const NAVY    = "#0B1929";
const BLUE    = "#4A9EFF";
const YELLOW  = "#FFCC00";
const NAVY_DIM = "#6B8FAE";

const STAGGER = 14; // frames between each chapter item

export const ChapterIndex: React.FC<{
  chapters: { title: string }[];
}> = ({ chapters }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const bgEnter = spring({ frame, fps, config: { damping: 20, stiffness: 200 } });
  const bgOp    = interpolate(bgEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );

  const headerEnter = spring({ frame: Math.max(0, frame - 3), fps, config: { damping: 15, stiffness: 260 } });
  const headerY     = interpolate(headerEnter, [0, 1], [20, 0]);
  const headerOp    = interpolate(headerEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      backgroundColor: `rgba(11,25,41,${bgOp * 0.82})`,
      opacity: fadeOut,
      justifyContent: "center",
      alignItems: "center",
    }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.12} />

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 28,
        padding: "48px 80px",
        background: CREAM,
        borderRadius: 24,
        boxShadow: "0 8px 64px rgba(11,25,41,0.30)",
        minWidth: 640,
        maxWidth: 860,
      }}>
        {/* Header */}
        <div style={{
          opacity: headerOp,
          transform: `translateY(${headerY}px)`,
          textAlign: "center",
          width: "100%",
          paddingBottom: 16,
          borderBottom: `2px solid ${NAVY}18`,
        }}>
          <span style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 20,
            color: NAVY_DIM,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            En este video
          </span>
        </div>

        {/* Chapter items */}
        {chapters.map((ch, i) => {
          const itemFrame = Math.max(0, frame - (8 + i * STAGGER));
          const itemEnter = spring({ frame: itemFrame, fps, config: { damping: 14, stiffness: 300 } });
          const itemX     = interpolate(itemEnter, [0, 1], [-28, 0]);
          const itemOp    = interpolate(itemEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

          return (
            <div key={i} style={{
              opacity: itemOp,
              transform: `translateX(${itemX}px)`,
              display: "flex",
              alignItems: "center",
              gap: 20,
              width: "100%",
            }}>
              {/* Number badge */}
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: YELLOW,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(255,204,0,0.35)",
              }}>
                <span style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 900,
                  fontSize: 20,
                  color: NAVY,
                  lineHeight: 1,
                }}>
                  {i + 1}
                </span>
              </div>
              {/* Title */}
              <span style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: 26,
                color: NAVY,
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}>
                {ch.title}
              </span>
            </div>
          );
        })}

        {/* Bottom accent line */}
        <div style={{ width: 48, height: 3, background: BLUE, borderRadius: 2, marginTop: 4 }} />
      </div>
    </AbsoluteFill>
  );
};
