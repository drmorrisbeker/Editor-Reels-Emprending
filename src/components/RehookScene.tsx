/** Escena: placa rehook con fondo crema radial, texto centrado en 2-3 líneas (última en acento) con slide-up + fade. | Tema: genérica | Reusable: sí (linea1/linea2/acento son props) */
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

export const RehookScene: React.FC<{ linea1: string; linea2?: string; acento?: string }> = ({ linea1, linea2, acento }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 220 } });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  const opacity = Math.min(interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" }), fadeOut);
  const y = interpolate(enter, [0, 1], [80, 0]);

  return (
    <AbsoluteFill style={{
      background: "radial-gradient(circle at top, #f6ead3, #e6d6b6)",
      opacity,
      transform: `translateY(${y}px)`,
      justifyContent: "center",
      alignItems: "center",
    }}>
      <Audio src={staticFile("sfx/flash.mp3")} volume={0.20} />
      <div style={{
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500,
        fontSize: 100,
        lineHeight: 1.05,
        color: "#1f2f44",
        letterSpacing: "-0.02em",
        padding: "0 60px",
      }}>
        {linea1}
        {linea2 && <><br />{linea2}</>}
        {acento && <><br /><span style={{ color: "#c68b59", fontWeight: 600 }}>{acento}</span></>}
      </div>
    </AbsoluteFill>
  );
};
