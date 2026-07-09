import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Second bar appearance: bars invert — MEDICACIÓN goes down, HERRAMIENTAS goes up
export const InversionBarrasScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  // Start at same initial state, inversion happens frames 15–70
  const medH  = interpolate(frame, [5, 12, 15, 70], [0, 360, 360, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const herrH = interpolate(frame, [5, 12, 15, 70], [0, 120, 120, 360], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const titleOpacity = interpolate(frame, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // "EN EL FUTURO" label fades in at the end as herramientas becomes dominant
  const futuroOpacity = interpolate(frame, [60, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const MAX_H = 360;
  const BAR_W = 210;

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.15} />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 0 }}>

        {/* Título dinámico: empieza "AHORA" → cambia a "EN EL FUTURO" */}
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 38, letterSpacing: "-0.02em", marginBottom: 36, height: 50, position: "relative", width: 460, textAlign: "center" }}>
          <span style={{ position: "absolute", left: 0, right: 0, color: "#162a3e", opacity: interpolate(titleOpacity, [0,1],[0,1]) - futuroOpacity }}>
            LOS ROLES SE INVIERTEN
          </span>
          <span style={{ position: "absolute", left: 0, right: 0, color: "#b18060", opacity: futuroOpacity }}>
            EN EL FUTURO
          </span>
        </div>

        {/* Barras */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 40, height: MAX_H }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ width: BAR_W, height: medH, backgroundColor: "rgba(22,42,62,0.80)", borderRadius: "12px 12px 0 0", transition: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ width: BAR_W, height: herrH, backgroundColor: "#b18060", borderRadius: "12px 12px 0 0", transition: "none" }} />
          </div>
        </div>

        {/* Labels */}
        <div style={{ display: "flex", gap: 40, marginTop: 14 }}>
          <div style={{ width: BAR_W, textAlign: "center", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#162a3e" }}>
            MEDICACIÓN
          </div>
          <div style={{ width: BAR_W, textAlign: "center", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#b18060" }}>
            HERRAMIENTAS
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
