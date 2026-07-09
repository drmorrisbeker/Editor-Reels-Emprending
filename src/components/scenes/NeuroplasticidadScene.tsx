import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#0B1929";
const TEXT   = "#FFFFFF";
const ACCENT = "#4A9EFF";
const DIM    = "#A8C4E0";

const nodes = [
  { cx: "18%", cy: "38%", delay: 1 },
  { cx: "50%", cy: "28%", delay: 2 },
  { cx: "80%", cy: "40%", delay: 3 },
  { cx: "28%", cy: "62%", delay: 4 },
  { cx: "68%", cy: "58%", delay: 5 },
  { cx: "50%", cy: "72%", delay: 6 },
];

const Node: React.FC<{ cx: string; cy: string; delay: number }> = ({ cx, cy, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 12, stiffness: 340 } });
  const opacity = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const scale   = interpolate(enter, [0, 1], [0, 1]);
  return (
    <circle
      cx={cx} cy={cy} r="15"
      fill={ACCENT}
      opacity={opacity * 0.9}
      style={{ transform: `scale(${scale})`, transformOrigin: `${cx} ${cy}` }}
    />
  );
};

// Line que se dibuja progresivamente
const AnimLine: React.FC<{ x1: string; y1: string; x2: string; y2: string; delay: number }> = ({ x1, y1, x2, y2, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prog = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 20, stiffness: 200 } });
  const opacity = interpolate(prog, [0, 1], [0, 0.35], { extrapolateRight: "clamp" });
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ACCENT} strokeWidth="2" opacity={opacity} />;
};

export const NeuroplasticidadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const titleEnter = spring({ frame, fps, config: { damping: 14, stiffness: 300 } });
  const titleY  = interpolate(titleEnter, [0, 1], [-55, 0]);
  const titleOp = interpolate(titleEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const lineBar = spring({ frame: Math.max(0, frame - 3), fps, config: { damping: 26, stiffness: 160 } });
  const lineWidth = interpolate(lineBar, [0, 1], [0, 100]);

  const tag1Enter = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 14, stiffness: 300 } });
  const tag2Enter = spring({ frame: Math.max(0, frame - 18), fps, config: { damping: 14, stiffness: 300 } });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      {nodes.map((n, i) => (
        <Sequence key={i} from={n.delay} durationInFrames={6}>
          <Audio src={staticFile("sfx/plop.mp3")} volume={0.07} />
        </Sequence>
      ))}

      {/* Red neuronal */}
      <AbsoluteFill>
        <svg width="100%" height="100%" style={{ position: "absolute" }}>
          <AnimLine x1="18%" y1="38%" x2="50%" y2="28%" delay={2} />
          <AnimLine x1="50%" y1="28%" x2="80%" y2="40%" delay={3} />
          <AnimLine x1="18%" y1="38%" x2="28%" y2="62%" delay={3} />
          <AnimLine x1="50%" y1="28%" x2="68%" y2="58%" delay={4} />
          <AnimLine x1="28%" y1="62%" x2="50%" y2="72%" delay={5} />
          <AnimLine x1="68%" y1="58%" x2="50%" y2="72%" delay={5} />
          <AnimLine x1="80%" y1="40%" x2="68%" y2="58%" delay={4} />
          {nodes.map((n, i) => <Node key={i} {...n} />)}
        </svg>
      </AbsoluteFill>

      {/* Título */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 180 }}>
        <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, textAlign: "center", padding: "0 50px" }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 62, color: ACCENT, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
            NEUROPLASTICIDAD
          </div>
        </div>
      </AbsoluteFill>

      {/* Línea separadora */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 300 }}>
        <div style={{ width: "80%", height: 2, backgroundColor: `${DIM}33`, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${lineWidth}%`, backgroundColor: ACCENT }} />
        </div>
      </AbsoluteFill>

      {/* Tags */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 345, gap: 16, flexDirection: "column" }}>
        <div style={{
          opacity: interpolate(tag1Enter, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(tag1Enter, [0, 1], [24, 0])}px)`,
        }}>
          <div style={{ backgroundColor: `${ACCENT}22`, border: `2px solid ${ACCENT}88`, borderRadius: 50, padding: "10px 32px" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 36, color: TEXT, letterSpacing: "0.04em" }}>
              NUEVAS CONEXIONES
            </span>
          </div>
        </div>
        <div style={{
          opacity: interpolate(tag2Enter, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(tag2Enter, [0, 1], [24, 0])}px)`,
        }}>
          <div style={{ backgroundColor: `${ACCENT}22`, border: `2px solid ${ACCENT}88`, borderRadius: 50, padding: "10px 32px" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 36, color: TEXT, letterSpacing: "0.04em" }}>
              TU CEREBRO CAMBIA
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
