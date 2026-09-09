import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Cartel de gancho (primeros ~5s, overlay sobre el video). Look derivado de podcast-clips:
// cartel BLANCO con texto navy, redondeado, sombra suave; el texto corre centrado dentro.
//
// Posición: ABAJO, apoyado por encima de la banda de subtítulos (que queda fija en
// paddingBottom 640 → banda ≈ y1190–1280). El cartel se ubica arriba de esa banda para no
// pisarla, y su ancho se limita para no cruzar el notch de botones de TikTok/Reels
// (x≈887 por debajo de y≈864): contenedor left:76 / right:200 → borde derecho ≈880.
//
// Contrato de props de vertical-reel: Reel.tsx pasa solo `hookText`. El resto son opcionales
// con defaults (cartel blanco, texto navy).

export const CARD_BOTTOM = 760; // borde inferior del cartel ≈ y1160 (arriba de la banda de subtítulos)

export const ThumbnailCover: React.FC<{
  hookText: string;
  bgColor?: string; // fondo del cartel (blanco por default)
  fgColor?: string; // texto del cartel (navy por default)
}> = ({ hookText, bgColor = "#FFFFFF", fgColor = "#0F2135" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 180 } });
  const opacity = interpolate(enter, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(enter, [0, 1], [16, 0]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          bottom: CARD_BOTTOM,
          left: 76,
          right: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            opacity,
            transform: `translateY(${translateY}px)`,
            backgroundColor: bgColor,
            borderRadius: 26,
            padding: "22px 34px",
            boxShadow: "0 14px 44px rgba(0,0,0,0.38)",
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: 62,
              color: fgColor,
              textAlign: "center",
              letterSpacing: "-0.015em",
              lineHeight: 1.14,
              whiteSpace: "pre-line",
            }}
          >
            {hookText}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
