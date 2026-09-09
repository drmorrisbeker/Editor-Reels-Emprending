/** Escena: Lista de 2 ítems (check/cruz) entrando con spring, fondo se atenúa entre apariciones | Tema: mismo efecto sin efecto adverso | Reusable: con cambios (array ITEMS hardcodeado) */
import {
  AbsoluteFill, Audio, interpolate, Sequence,
  spring, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";

const BG    = "#0B1929";
const VERDE = "#4AE88A";
const ROJO  = "#FF6B6B";
const DIM   = "#A8C4E0";

// Scene starts at 40780ms.
// Item 1 "mismo efecto positivo" at 40780ms (delay 0).
// Item 2 "sin este efecto adverso molesto" at 43720ms (delay 2940ms).
const ITEMS = [
  { icon: "✓", label: "MISMO EFECTO\nPOSITIVO",   color: VERDE, delayMs:    0 },
  { icon: "✗", label: "SIN EL EFECTO\nADVERSO",   color: ROJO,  delayMs: 2940 },
];

// Background opacity keyframes (at 30fps):
// Item1 speech ends ~frame 25. Gap until item2 at frame 88. Scene ends frame 160.
const BG_FRAMES  = [0,  5, 30,  42,  78,  88, 152, 160];
const BG_OPACITY = [0,  1,  1,   0,   0,   1,   1,   0];

const Item: React.FC<{ icon: string; label: string; color: string }> = ({ icon, label, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sp = spring({ frame, fps, config: { damping: 12, stiffness: 370 } });
  const y  = interpolate(sp, [0, 1], [60, 0]);
  const op = interpolate(sp, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <>
      <Sequence from={0} durationInFrames={3}>
        <Audio src={staticFile("sfx/click.mp3")} volume={0.38} />
      </Sequence>
      <div style={{
        opacity: op,
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        backgroundColor: `${color}10`,
        border: `1px solid ${color}55`,
        borderRadius: 24,
        padding: "18px 44px",
        minWidth: 520,
        marginBottom: 20,
      }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 64, color, lineHeight: 1, minWidth: 64, textAlign: "center" }}>
          {icon}
        </span>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 48, color: "#FFFFFF", lineHeight: 1.15, letterSpacing: "-0.01em", whiteSpace: "pre-line" }}>
          {label}
        </span>
      </div>
    </>
  );
};

export const MismoEfectoScene: React.FC = () => {
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
      <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 28, color: DIM, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 28 }}>
        hay alternativas
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
