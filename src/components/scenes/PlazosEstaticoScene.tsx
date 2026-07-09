import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// First bar appearance: shows initial state — TOLERANCIA tall, URGENCIA short
export const PlazosEstaticoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const tolH  = interpolate(frame, [5, 22], [0, 360], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const urgH  = interpolate(frame, [5, 22], [0, 90],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const titleOpacity = interpolate(frame, [3, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelOpacity = interpolate(frame, [18, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const MAX_H = 360;
  const BAR_W = 210;

  return (
    <AbsoluteFill style={{ backgroundColor: "#f5e9d2", opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.15} />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 0 }}>

        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 38, color: "#162a3e", letterSpacing: "-0.02em", marginBottom: 36, opacity: titleOpacity }}>
          AL PRINCIPIO
        </div>

        {/* Barras */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 40, height: MAX_H }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ width: BAR_W, height: tolH, backgroundColor: "rgba(22,42,62,0.80)", borderRadius: "12px 12px 0 0" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ width: BAR_W, height: urgH, backgroundColor: "#FF6B6B", borderRadius: "12px 12px 0 0" }} />
          </div>
        </div>

        {/* Labels */}
        <div style={{ display: "flex", gap: 40, marginTop: 14, opacity: labelOpacity }}>
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
