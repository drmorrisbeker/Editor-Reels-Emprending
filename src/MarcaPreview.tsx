// Vista previa de una marca, sin video: sirve para aprobar el branding y la portada antes del
// primer reel.  npx remotion still Marca-Preview out/marca.png --props='{"brand":"<id>"}'
//   frame 0 → portada · frame 1 → cartel de gancho + subtítulo de ejemplo
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import { ThumbnailCover } from "./components/ThumbnailCover";
import { PortadaMarca } from "./components/PortadaMarca";
import { getBrand } from "./marcas";
import { useBrandFonts } from "./fonts";

export const MarcaPreviewSchema = z.object({
  brand: z.string().default("default"),
  fondoSrc: z.string().default(""), // opcional: imagen en public/ (ej. un frame del video)
  portadaTitulo: z.string().default("TU TÍTULO\nDE PORTADA"),
  portadaLinea2: z.string().default("CON GANCHO"),
  hookText: z.string().default("El gancho que frena el scroll en los primeros segundos"),
  subtitulo: z.string().default("así se ven los subtítulos"),
});

export const MarcaPreview: React.FC<z.infer<typeof MarcaPreviewSchema>> = ({
  brand,
  fondoSrc,
  portadaTitulo,
  portadaLinea2,
  hookText,
  subtitulo,
}) => {
  const frame = useCurrentFrame();
  const b = getBrand(brand);
  useBrandFonts(b);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #6b7280 0%, #374151 55%, #1f2937 100%)" }}>
      {fondoSrc && <Img src={staticFile(fondoSrc)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
      {frame === 0 ? (
        b.portada === "ninguna" ? (
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", color: "#fff", fontSize: 60, fontFamily: "Inter" }}>
            (marca sin portada)
          </AbsoluteFill>
        ) : (
          <PortadaMarca titulo={portadaTitulo} linea2={portadaLinea2} brand={b} />
        )
      ) : (
        <>
          {/* Corrido 60 frames: se ve el cartel ya entrado, no a mitad de su animación */}
          <Sequence from={-60}>
            <ThumbnailCover hookText={hookText} bgColor={b.hookBg} fgColor={b.hookFg} fontFamily={b.subtitleFont} />
          </Sequence>
          <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 500 }}>
            <div
              style={{
                fontFamily: b.subtitleFont,
                fontWeight: 800,
                fontSize: 74,
                color: "#FFFFFF",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                textShadow: "0 4px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.45)",
              }}
            >
              {subtitulo}
            </div>
          </AbsoluteFill>
        </>
      )}
    </AbsoluteFill>
  );
};
