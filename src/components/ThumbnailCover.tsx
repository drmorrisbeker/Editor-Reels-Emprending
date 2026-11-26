import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const ThumbnailCover: React.FC<{
  hookText: string;
  bgColor?: string;
  fgColor?: string;
  fontFamily?: string;
  /** Posición vertical (px) del bloque de texto. Default 270 = zona segura superior
   *  (yapping, arriba de la cabeza). En reacción se pasa la línea divisoria del split
   *  (~700) para que el card no tape la cara de quien reacciona. */
  anchorTop?: number;
}> = ({
  hookText,
  bgColor = "#0F2135",
  fgColor = "#FFFFFF",
  fontFamily = "Inter, sans-serif",
  anchorTop = 270,
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

      {/* Texto — dentro del safe zone (top ≥245), arriba de la cabeza del Dr.
          (o sobre la línea divisoria del split cuando anchorTop lo indica). */}
      <div
        style={{
          position: "absolute",
          top: anchorTop,
          left: 36,
          right: 36,
          opacity,
          transform: `translateY(${translateY}px)`,
          textAlign: "center",
        }}
      >
        {/* Un solo panel de marca de ancho completo (Morris, 21/11: el cartel por renglón
            quedaba "muy estrecho"; ocupar más espacio horizontal). textWrap balance reparte
            los renglones parejos. */}
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 76,
            color: fgColor,
            backgroundColor: bgColor,
            padding: "30px 40px",
            borderRadius: 30,
            boxShadow: "0 10px 34px rgba(0,0,0,0.3)",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            textWrap: "balance",
          }}
        >
          {hookText}
        </div>
      </div>
    </AbsoluteFill>
  );
};
