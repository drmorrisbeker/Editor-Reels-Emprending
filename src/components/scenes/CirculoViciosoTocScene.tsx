import {
  AbsoluteFill, Audio, interpolate, Sequence,
  spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";

const BG     = "#f5e9d2";
const TEXT   = "#162a3e";
const ACCENT = "#b18060";
const RED    = "#FF6B6B";
const BLUE   = "#4A9EFF";
const GREEN  = "#52c41a";

// Equilateral triangle, center (540, 820), R=290
const cx = 540, cy = 820, R = 290;
const BOX_W = 280, BOX_H = 110;
const hW = BOX_W / 2, hH = BOX_H / 2;

const NODES = [
  { x: cx,            y: cy - R,             label: ["OBSESIÓN"],              color: RED  },
  { x: cx + R * 0.866, y: cy + R * 0.5,       label: ["COMPULSIÓN"],            color: BLUE },
  { x: cx - R * 0.866, y: cy + R * 0.5,       label: ["ALIVIO",  "MOMENTÁNEO"], color: GREEN },
];

// Clockwise arrows: N0→N1, N1→N2, N2→N0
// Each arrow starts at edge of source box, ends at edge of target box
const a01 = Math.atan2(NODES[1].y - NODES[0].y, NODES[1].x - NODES[0].x);
const a12 = Math.atan2(NODES[2].y - NODES[1].y, NODES[2].x - NODES[1].x);
const a20 = Math.atan2(NODES[0].y - NODES[2].y, NODES[0].x - NODES[2].x);

function edgePt(node: { x: number; y: number }, angle: number, outward: boolean): [number, number] {
  const sign = outward ? 1 : -1;
  const cx_ = node.x + sign * hW * Math.cos(angle);
  const cy_ = node.y + sign * hH * Math.sin(angle);
  return [cx_, cy_];
}

const ARROWS = [
  { x1: edgePt(NODES[0], a01, true)[0],  y1: edgePt(NODES[0], a01, true)[1],  x2: edgePt(NODES[1], a01, false)[0], y2: edgePt(NODES[1], a01, false)[1] },
  { x1: edgePt(NODES[1], a12, true)[0],  y1: edgePt(NODES[1], a12, true)[1],  x2: edgePt(NODES[2], a12, false)[0], y2: edgePt(NODES[2], a12, false)[1] },
  { x1: edgePt(NODES[2], a20, true)[0],  y1: edgePt(NODES[2], a20, true)[1],  x2: edgePt(NODES[0], a20, false)[0], y2: edgePt(NODES[0], a20, false)[1] },
];

const NODE_DELAYS  = [3, 9, 15];
const ARROW_DELAYS = [22, 27, 32];
const SPIN_START   = 38;
const RING_R       = R + 60;
const CIRCUM       = 2 * Math.PI * RING_R;

export const CirculoViciosoTocScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4],  [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const nodeEnters  = NODE_DELAYS.map(d =>
    spring({ frame: Math.max(0, frame - d), fps, config: { damping: 11, stiffness: 380 } }));
  const arrowEnters = ARROW_DELAYS.map(d =>
    spring({ frame: Math.max(0, frame - d), fps, config: { damping: 14, stiffness: 320 } }));

  const spinProgress = Math.max(0, frame - SPIN_START);
  const dashLen    = CIRCUM * 0.18;
  const gapLen     = CIRCUM * 0.82;
  const dashOffset = -(spinProgress / fps) * (CIRCUM / 1.5);
  const ringOp     = interpolate(frame, [SPIN_START, SPIN_START + 12], [0, 0.7],  { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const centerOp   = interpolate(frame, [SPIN_START, SPIN_START + 12], [0, 1],    { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // OBSESIÓN grows after spin starts — visually shows reinforcement
  const obsGrow = interpolate(frame, [SPIN_START, SPIN_START + 20], [1, 1.18], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const obsPulse = frame >= SPIN_START ? (1 + Math.sin((frame - SPIN_START) * 0.18) * 0.04) : 1;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      {NODE_DELAYS.map((d, i) => (
        <Sequence key={i} from={d} durationInFrames={6}>
          <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
        </Sequence>
      ))}
      <Sequence from={ARROW_DELAYS[2]} durationInFrames={6}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.07} />
      </Sequence>

      <svg style={{ position: "absolute", width: 1080, height: 1920 }}>
        {/* Spinning ring */}
        <circle
          cx={cx} cy={cy} r={RING_R}
          fill="none"
          stroke={ACCENT}
          strokeWidth={5}
          strokeDasharray={`${dashLen} ${gapLen}`}
          strokeDashoffset={dashOffset}
          opacity={ringOp}
          strokeLinecap="round"
        />

        {/* Arrows */}
        {ARROWS.map((a, i) => {
          const op  = interpolate(arrowEnters[i], [0, 1], [0, 1], { extrapolateRight: "clamp" });
          const ang = Math.atan2(a.y2 - a.y1, a.x2 - a.x1) * (180 / Math.PI);
          return (
            <g key={i} opacity={op}>
              <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={ACCENT} strokeWidth={5} strokeLinecap="round" />
              <polygon points="0,-5 12,0 0,5" fill={ACCENT} transform={`translate(${a.x2},${a.y2}) rotate(${ang})`} />
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {NODES.map((node, i) => {
        const sp  = nodeEnters[i];
        const nOp = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" });
        const nY  = interpolate(sp, [0, 1], [30, 0]);
        const baseScale = interpolate(sp, [0, 1], [0.7, 1]);
        const extraScale = i === 0 ? obsGrow * obsPulse : 1;
        const nSc = baseScale * extraScale;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: node.x - hW,
              top:  node.y - hH,
              width:  BOX_W,
              height: BOX_H,
              backgroundColor: `${node.color}22`,
              border: `3px solid ${node.color}88`,
              borderRadius: 50,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              opacity: nOp,
              transform: `translateY(${nY}px) scale(${nSc})`,
              transformOrigin: "center center",
            }}
          >
            {node.label.map((line, j) => (
              <div
                key={j}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: i === 0 ? 32 : 28,
                  lineHeight: 1.2,
                  color: TEXT,
                  letterSpacing: "-0.02em",
                  textAlign: "center",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        );
      })}

      {/* Center label */}
      <div
        style={{
          position: "absolute",
          left: 0, right: 0,
          top: cy - 26,
          textAlign: "center",
          opacity: centerOp,
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 26,
          color: ACCENT,
          letterSpacing: "-0.01em",
        }}
      >
        SE REFUERZA
      </div>
    </AbsoluteFill>
  );
};
