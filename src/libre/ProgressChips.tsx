import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS, FONT, SECTIONS } from "./theme";

// ─────────────────────────────────────────────────────────────────────────────
// Barra de progreso 1·2·3 — arriba, sobre la pared (zona libre, lejos de la cara).
// Los números son PASOS REALES (los 3 consejos), no numeración decorativa.
// · Durante el gancho: los tres se dibujan con stagger.
// · Consejo N: chip N activo (cobre lleno), los previos "hechos" (cobre tenue),
//   los futuros en idle (translúcido). Pulso breve al activarse.
// · Cierre: los tres "hechos".
// Cobre permitido acá (el cliente lo sacó solo de los subtítulos).
// ─────────────────────────────────────────────────────────────────────────────

const SIZE = 78;
const GAP = 120; // distancia centro a centro entre chips

function currentStep(ms: number): number {
  // -1 = gancho (ninguno activo todavía) · 0,1,2 = consejo · 3 = cierre (todos hechos)
  if (ms < SECTIONS.c1) return -1;
  if (ms < SECTIONS.c2) return 0;
  if (ms < SECTIONS.c3) return 1;
  if (ms < SECTIONS.cierre) return 2;
  return 3;
}

const stepStartMs = [SECTIONS.c1, SECTIONS.c2, SECTIONS.c3];

const Chip: React.FC<{ index: number; step: number }> = ({ index, step }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const active = step === index;
  const done = step > index;

  // Dibujo inicial (stagger durante el gancho).
  const drawIn = spring({
    frame: frame - index * 7,
    fps,
    config: { damping: 16, stiffness: 140 },
    durationInFrames: 22,
  });

  // Pulso al activarse el chip (primeros ~0.4s de su consejo).
  let pulse = 1;
  if (active) {
    const activeFrame = frame - Math.round((stepStartMs[index] / 1000) * fps);
    const p = spring({ frame: activeFrame, fps, config: { damping: 9, stiffness: 180 }, durationInFrames: 14 });
    pulse = interpolate(p, [0, 1], [1.22, 1.0], { extrapolateRight: "clamp" });
  }

  const bg = active ? COLORS.copper : done ? "rgba(223,190,154,0.20)" : "rgba(255,255,255,0.12)";
  const border = active
    ? COLORS.copper
    : done
      ? "rgba(223,190,154,0.9)"
      : "rgba(255,255,255,0.42)";
  const fg = active ? COLORS.navy : done ? COLORS.copper : "rgba(255,255,255,0.78)";

  return (
    <div
      style={{
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        background: bg,
        border: `2.5px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${drawIn * pulse})`,
        opacity: drawIn,
        boxShadow: active ? "0 0 26px rgba(223,190,154,0.55)" : "0 4px 16px rgba(0,0,0,0.35)",
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 38,
          color: fg,
          lineHeight: 1,
        }}
      >
        {index + 1}
      </span>
    </div>
  );
};

export const ProgressChips: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const step = currentStep(ms);

  // Progreso de la línea conectora (0 → 1 a medida que avanzan los consejos).
  const lineProgress = interpolate(
    ms,
    [SECTIONS.c1, SECTIONS.c2, SECTIONS.c3, SECTIONS.cierre],
    [0, 0.5, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const connectorW = GAP * 2;

  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: GAP - SIZE }}>
        {/* línea base */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: SIZE / 2,
            width: connectorW,
            height: 4,
            background: "rgba(255,255,255,0.18)",
            transform: "translateY(-50%)",
            borderRadius: 2,
          }}
        />
        {/* línea de progreso cobre */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: SIZE / 2,
            width: connectorW * lineProgress,
            height: 4,
            background: COLORS.copper,
            transform: "translateY(-50%)",
            borderRadius: 2,
            boxShadow: "0 0 10px rgba(223,190,154,0.6)",
          }}
        />
        {[0, 1, 2].map((i) => (
          <Chip key={i} index={i} step={step} />
        ))}
      </div>
    </div>
  );
};
