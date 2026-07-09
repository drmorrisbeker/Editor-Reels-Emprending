import {
  AbsoluteFill, Audio, interpolate, Sequence,
  spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";

const BG   = "#0B1929";
const ROJO = "#FF6B6B";
const AZUL = "#4A9EFF";
const DIM  = "#A8C4E0";

// Scene starts at 12830ms in the video.
// Each item appears exactly when named in the audio.
const ITEMS = [
  { icon: "↓", label: "DESEO SEXUAL", color: AZUL, delayMs:    0 }, // 12830ms
  { icon: "✗", label: "ERECCIÓN",     color: ROJO, delayMs: 3050 }, // 15880ms
  { icon: "✗", label: "ORGASMO",      color: ROJO, delayMs: 5270 }, // 18100ms
];

// Background opacity keyframes (at 30fps):
// Fades out during gaps so the video shows; fades back in before each item.
// Item1 speech ends ~frame 46 → fade out. Item2 at frame 92 → fade in.
// Item2 speech ends ~frame 111 → fade out. Item3 at frame 158 → fade in.
// Scene ends at frame 182.
const BG_FRAMES  = [0,  5,  46,  58,  82,  92, 111, 123, 148, 158, 172, 182];
const BG_OPACITY = [0,  1,   1,   0,   0,   1,   1,   0,   0,   1,   1,   0];

const Item: React.FC<{ icon: string; label: string; color: string }> = ({ icon, label, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = spring({ frame, fps, config: { damping: 14, stiffness: 400 } });
  const x  = interpolate(sp, [0, 1], [-80, 0]);
  const op = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <>
      <Sequence from={0} durationInFrames={3}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.38} />
      </Sequence>
      <div style={{
        opacity: op,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        backgroundColor: `${color}14`,
        border: `1px solid ${color}55`,
        borderRadius: 20,
        padding: "14px 40px",
        minWidth: 480,
        marginBottom: 20,
      }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 60, color, lineHeight: 1, minWidth: 60, textAlign: "center" }}>
          {icon}
        </span>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 54, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
          {label}
        </span>
      </div>
    </>
  );
};

export const EfectosAdversosScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOp = interpolate(frame, BG_FRAMES, BG_OPACITY, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      backgroundColor: BG,
      opacity: bgOp,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 28, color: DIM, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 32 }}>
        efectos adversos sexuales
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {ITEMS.map((item, i) => (
          <Sequence key={i} from={Math.round((item.delayMs / 1000) * fps)} layout="none">
            <Item icon={item.icon} label={item.label} color={item.color} />
          </Sequence>
        ))}
      </div>
    </AbsoluteFill>
  );
};
