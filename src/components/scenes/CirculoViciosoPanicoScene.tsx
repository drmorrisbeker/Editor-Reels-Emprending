/** Escena: Diagrama circular de 4 nodos (SENSACIÓN→PENSAMIENTO CATASTRÓFICO→EMOCIONES→MÁS SENSACIONES) con flechas y anillo giratorio | Tema: círculo vicioso del pánico | Reusable: con cambios (labels hardcodeados) */
import {
  AbsoluteFill, Audio, interpolate, Sequence,
  spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";

const BG     = "#f5e9d2";
const TEXT   = "#162a3e";
const ACCENT = "#b18060";

const cx = 540, cy = 760, r = 280;
const BOX_W = 240, BOX_H = 100;
const S45 = Math.SQRT2 / 2;
const hW = BOX_W / 2, hH = BOX_H / 2;

const NODES = [
  { x: cx,   y: cy - r, label: ["SENSACIÓN",   "FÍSICA"],        color: "#FF6B6B" },
  { x: cx+r, y: cy,     label: ["PENSAMIENTO", "CATASTRÓFICO"],  color: "#4A9EFF" },
  { x: cx,   y: cy + r, label: ["EMOCIONES",   "(MIEDO)"],       color: "#FF6B6B" },
  { x: cx-r, y: cy,     label: ["MÁS",         "SENSACIONES"],   color: ACCENT    },
];

// Clockwise arrows: from edge of source toward target, to edge of target
const ARROWS = [
  { x1: cx+S45*hW,   y1: cy-r+S45*hH, x2: cx+r-S45*hW, y2: cy-S45*hH   }, // Top→Right
  { x1: cx+r-S45*hW, y1: cy+S45*hH,   x2: cx+S45*hW,   y2: cy+r-S45*hH }, // Right→Bottom
  { x1: cx-S45*hW,   y1: cy+r-S45*hH, x2: cx-r+S45*hW, y2: cy+S45*hH   }, // Bottom→Left
  { x1: cx-r+S45*hW, y1: cy-S45*hH,   x2: cx-S45*hW,   y2: cy-r+S45*hH }, // Left→Top
];

const NODE_DELAYS  = [3, 9, 15, 21];
const ARROW_DELAYS = [27, 31, 35, 39];
const SPIN_START   = 44;
const RING_R       = r + 50;
const CIRCUM       = 2 * Math.PI * RING_R;

export const CirculoViciosoPanicoScene: React.FC = () => {
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
  const dashLen    = CIRCUM * 0.14;
  const gapLen     = CIRCUM * 0.86;
  const dashOffset = -(spinProgress / fps) * (CIRCUM / 1.5); // full rotation every 1.5s
  const ringOp     = interpolate(frame, [SPIN_START, SPIN_START + 12], [0, 0.65], { extrapolateRight: "clamp" });
  const centerOp   = interpolate(frame, [SPIN_START, SPIN_START + 12], [0, 1],    { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      {NODE_DELAYS.map((d, i) => (
        <Sequence key={i} from={d} durationInFrames={6}>
          <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
        </Sequence>
      ))}
      <Sequence from={ARROW_DELAYS[3]} durationInFrames={6}>
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

        {/* Clockwise arrows */}
        {ARROWS.map((a, i) => {
          const op  = interpolate(arrowEnters[i], [0, 1], [0, 1], { extrapolateRight: "clamp" });
          const ang = Math.atan2(a.y2 - a.y1, a.x2 - a.x1) * (180 / Math.PI);
          return (
            <g key={i} opacity={op}>
              <line
                x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
                stroke={ACCENT} strokeWidth={5} strokeLinecap="round"
              />
              <polygon
                points="0,-5 12,0 0,5"
                fill={ACCENT}
                transform={`translate(${a.x2},${a.y2}) rotate(${ang})`}
              />
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {NODES.map((node, i) => {
        const sp  = nodeEnters[i];
        const nOp = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" });
        const nY  = interpolate(sp, [0, 1], [30, 0]);
        const nSc = interpolate(sp, [0, 1], [0.7, 1]);
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
            }}
          >
            {node.label.map((line, j) => (
              <div
                key={j}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 800,
                  fontSize: 27,
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
          top: cy - 22,
          textAlign: "center",
          opacity: centerOp,
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 24,
          color: ACCENT,
          letterSpacing: "-0.01em",
        }}
      >
        SE RETROALIMENTA
      </div>
    </AbsoluteFill>
  );
};
