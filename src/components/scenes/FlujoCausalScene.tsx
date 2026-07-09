import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const FlujoCausalScene: React.FC<{
  label1?: string; sub1?: string;
  label2?: string; sub2?: string;
  label3?: string; sub3?: string;
}> = ({
  label1 = "MALESTAR", sub1,
  label2 = "MEDICACIÓN", sub2 = "alivia el malestar",
  label3 = "HERRAMIENTAS", sub3 = "para crecer",
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const e1 = spring({ frame: Math.max(0, frame - 3),  fps, config: { damping: 11, stiffness: 380 } });
  const ea = spring({ frame: Math.max(0, frame - 9),  fps, config: { damping: 14, stiffness: 320 } });
  const e2 = spring({ frame: Math.max(0, frame - 13), fps, config: { damping: 11, stiffness: 380 } });
  const eb = spring({ frame: Math.max(0, frame - 19), fps, config: { damping: 14, stiffness: 320 } });
  const e3 = spring({ frame: Math.max(0, frame - 23), fps, config: { damping: 11, stiffness: 380 } });

  const enter = (e: number) => ({
    opacity: interpolate(e, [0, 1], [0, 1], { extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(e, [0, 1], [50, 0])}px)`,
  });

  const pillBase: React.CSSProperties = {
    borderRadius: 20,
    padding: "22px 48px",
    textAlign: "center" as const,
    fontFamily: "Inter, sans-serif",
    letterSpacing: "-0.02em",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.15} />
      <Sequence from={3}  durationInFrames={6}><Audio src={staticFile("sfx/plop.mp3")} volume={0.10} /></Sequence>
      <Sequence from={13} durationInFrames={6}><Audio src={staticFile("sfx/plop.mp3")} volume={0.10} /></Sequence>
      <Sequence from={23} durationInFrames={6}><Audio src={staticFile("sfx/plop.mp3")} volume={0.10} /></Sequence>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 20 }}>

        {/* Nodo 1 */}
        <div style={enter(e1)}>
          <div style={{ ...pillBase, backgroundColor: "rgba(22,42,62,0.08)", border: "2px solid rgba(22,42,62,0.18)" }}>
            <div style={{ fontWeight: 800, fontSize: 52, color: "#162a3e" }}>{label1}</div>
            {sub1 && <div style={{ fontWeight: 500, fontSize: 30, color: "rgba(22,42,62,0.5)", marginTop: 6 }}>{sub1}</div>}
          </div>
        </div>

        {/* Arrow 1 */}
        <div style={{ opacity: interpolate(ea, [0,1],[0,1],{extrapolateRight:"clamp"}), transform: `scale(${interpolate(ea,[0,1],[0.4,1],{extrapolateRight:"clamp"})})`, color: "#b18060", fontSize: 56, lineHeight: 1 }}>
          ↓
        </div>

        {/* Nodo 2 (acento) */}
        <div style={enter(e2)}>
          <div style={{ ...pillBase, backgroundColor: "rgba(177,128,96,0.14)", border: "2px solid rgba(177,128,96,0.45)" }}>
            <div style={{ fontWeight: 800, fontSize: 52, color: "#b18060" }}>{label2}</div>
            {sub2 && <div style={{ fontWeight: 500, fontSize: 30, color: "rgba(22,42,62,0.5)", marginTop: 6 }}>{sub2}</div>}
          </div>
        </div>

        {/* Arrow 2 */}
        <div style={{ opacity: interpolate(eb, [0,1],[0,1],{extrapolateRight:"clamp"}), transform: `scale(${interpolate(eb,[0,1],[0.4,1],{extrapolateRight:"clamp"})})`, color: "#b18060", fontSize: 56, lineHeight: 1 }}>
          ↓
        </div>

        {/* Nodo 3 */}
        <div style={enter(e3)}>
          <div style={{ ...pillBase, backgroundColor: "rgba(22,42,62,0.08)", border: "2px solid rgba(22,42,62,0.18)" }}>
            <div style={{ fontWeight: 800, fontSize: 52, color: "#162a3e" }}>{label3}</div>
            {sub3 && <div style={{ fontWeight: 500, fontSize: 30, color: "rgba(22,42,62,0.5)", marginTop: 6 }}>{sub3}</div>}
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
