/** Escena: Título + línea de tiempo PASADO/PRESENTE/FUTURO, FUTURO activo con sublabel ANSIEDAD | Tema: ansiedad anticipatoria | Reusable: con cambios (título y labels hardcodeados) */
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#0B1929";
const TEXT   = "#FFFFFF";
const ACCENT = "#4A9EFF";
const DIM    = "#A8C4E0";

const Section: React.FC<{ label: string; sublabel?: string; active?: boolean; delay: number }> = ({
  label, sublabel, active, delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const enter = spring({ frame: f, fps, config: { damping: 22, stiffness: 200 } });
  const opacity = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(enter, [0, 1], [30, 0]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity, transform: `translateY(${y}px)`, flex: 1 }}>
      <div style={{
        width: active ? 28 : 16, height: active ? 28 : 16,
        borderRadius: "50%",
        backgroundColor: active ? ACCENT : `${DIM}55`,
        boxShadow: active ? `0 0 28px ${ACCENT}99` : "none",
      }} />
      <span style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: active ? 800 : 500,
        fontSize: active ? 52 : 40,
        color: active ? TEXT : `${DIM}77`,
        letterSpacing: "0.04em",
        textAlign: "center",
      }}>
        {label}
      </span>
      {sublabel && (
        <div style={{
          backgroundColor: `${ACCENT}22`,
          border: `2px solid ${ACCENT}`,
          borderRadius: 12,
          padding: "10px 24px",
          marginTop: 8,
        }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 36, color: ACCENT, letterSpacing: "0.06em" }}>
            {sublabel}
          </span>
        </div>
      )}
    </div>
  );
};

export const AnsiedadFuturoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const titleEnter = spring({ frame, fps, config: { damping: 22, stiffness: 160 } });
  const titleY = interpolate(titleEnter, [0, 1], [-40, 0]);
  const titleOpacity = interpolate(titleEnter, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const lineEnter = spring({ frame: Math.max(0, frame - 5), fps, config: { damping: 30, stiffness: 120 } });
  const lineWidth = interpolate(lineEnter, [0, 1], [0, 100]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      {/* Plop suave por cada sección */}
      <Sequence from={8} durationInFrames={10}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.09} />
      </Sequence>
      <Sequence from={14} durationInFrames={10}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.09} />
      </Sequence>
      <Sequence from={20} durationInFrames={10}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.09} />
      </Sequence>

      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 220 }}>
        <div style={{ transform: `translateY(${titleY}px)`, opacity: titleOpacity, textAlign: "center", padding: "0 60px" }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 72, color: DIM, lineHeight: 1.15 }}>
            La ansiedad
          </div>
          <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 72, color: TEXT, lineHeight: 1.15 }}>
            vive en el futuro
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 200 }}>
        <div style={{ width: "88%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "90%", height: 3, backgroundColor: `${DIM}33`, marginBottom: -16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${lineWidth}%`, backgroundColor: ACCENT }} />
          </div>
          <div style={{ display: "flex", width: "100%", paddingTop: 16 }}>
            <Section label="PASADO"   delay={8}  />
            <Section label="PRESENTE" delay={14} />
            <Section label="FUTURO"   delay={20} active sublabel="ANSIEDAD" />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
