import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// Second bar appearance: bars invert — TOLERANCIA goes down, URGENCIA goes up
export const PlazosInversionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  // Start at same initial state as PlazosEstaticoScene, inversion happens frames 15–70
  const tolH = interpolate(frame, [5, 12, 15, 70], [0, 360, 360, 90],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const urgH = interpolate(frame, [5, 12, 15, 70], [0, 90,  90,  360], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const titleOpacity  = interpolate(frame, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vicisoOpacity = interpolate(frame, [60, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const MAX_H = 360;
  const BAR_W = 210;

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.15} />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 0 }}>

        {/* Título dinámico: "LOS PLAZOS SE ACORTAN" → "CÍRCULO VICIOSO" */}
        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 38, letterSpacing: "-0.02em", marginBottom: 36, height: 50, position: "relative", width: 560, textAlign: "center" }}>
          <span style={{ position: "absolute", left: 0, right: 0, color: "#162a3e", opacity: Math.max(0, interpolate(titleOpacity, [0,1],[0,1]) - vicisoOpacity) }}>
            LOS PLAZOS SE ACORTAN
          </span>
          <span style={{ position: "absolute", left: 0, right: 0, color: "#FF6B6B", opacity: vicisoOpacity }}>
            CÍRCULO VICIOSO
          </span>
        </div>

        {/* Barras */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 40, height: MAX_H }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ width: BAR_W, height: tolH, backgroundColor: "rgba(22,42,62,0.80)", borderRadius: "12px 12px 0 0", transition: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ width: BAR_W, height: urgH, backgroundColor: "#FF6B6B", borderRadius: "12px 12px 0 0", transition: "none" }} />
          </div>
        </div>

        {/* Labels */}
        <div style={{ display: "flex", gap: 40, marginTop: 14 }}>
          <div style={{ width: BAR_W, textAlign: "center", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#162a3e" }}>
            TOLERANCIA
          </div>
          <div style={{ width: BAR_W, textAlign: "center", fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#FF6B6B" }}>
            URGENCIA
          </div>
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
