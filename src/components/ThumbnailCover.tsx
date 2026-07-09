import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const ThumbnailCover: React.FC<{ hookText: string; bgColor?: string }> = ({
  hookText,
  bgColor = "#0F2135",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 180 } });
  const opacity = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(enter, [0, 1], [-12, 0]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Gradiente superior para legibilidad del texto */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "22%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Texto — dentro del safe zone (top ≥245), arriba de la cabeza del Dr. */}
      <div
        style={{
          position: "absolute",
          top: 270,
          left: 48,
          right: 48,
          opacity,
          transform: `translateY(${translateY}px)`,
          textAlign: "center",
        }}
      >
        {/* Fondo de color de marca que ABRAZA cada línea (estilo IG stories):
            box-decoration-break clone → cada línea lleva su propio panel redondeado. */}
        <span
          style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 800,
            fontSize: 72,
            color: "#FFFFFF",
            backgroundColor: bgColor,
            padding: "10px 28px",
            borderRadius: 22,
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
            boxShadow: "0 10px 34px rgba(0,0,0,0.3)",
            letterSpacing: "-0.01em",
            lineHeight: 1.45,
          }}
        >
          {hookText}
        </span>
      </div>
    </AbsoluteFill>
  );
};
