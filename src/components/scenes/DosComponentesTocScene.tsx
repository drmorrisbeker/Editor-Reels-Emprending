/** Escena: título + dos píldoras apiladas que entran con spring, contrastando obsesiones vs compulsiones | Tema: TOC (trastorno obsesivo compulsivo) | Reusable: no (texto y conceptos hardcodeados, sin props) */
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const BG     = "#f5e9d2";
const TEXT   = "#162a3e";
const ACCENT = "#b18060";
const RED    = "#FF6B6B";
const BLUE   = "#4A9EFF";

export const DosComponentesTocScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn  = interpolate(frame, [0, 4], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const title  = spring({ frame: Math.max(0, frame - 4),  fps, config: { damping: 11, stiffness: 380 } });
  const enter1 = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 11, stiffness: 380 } });
  const enter2 = spring({ frame: Math.max(0, frame - 17), fps, config: { damping: 11, stiffness: 380 } });

  const tOp = interpolate(title,  [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const tY  = interpolate(title,  [0, 1], [30, 0]);
  const o1  = interpolate(enter1, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const y1  = interpolate(enter1, [0, 1], [40, 0]);
  const o2  = interpolate(enter2, [0, 1], [0, 1], { extrapolateRight: "clamp" });
  const y2  = interpolate(enter2, [0, 1], [40, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity }}>
      <Audio src={staticFile("sfx/woosh.mp3")} volume={0.18} />
      <Sequence from={10} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>
      <Sequence from={17} durationInFrames={6}>
        <Audio src={staticFile("sfx/plop.mp3")} volume={0.12} />
      </Sequence>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 32, padding: "0 80px" }}>
        <div style={{
          opacity: tOp,
          transform: `translateY(${tY}px)`,
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: 38,
          color: ACCENT,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          textAlign: "center",
          marginBottom: 8,
        }}>
          EL TOC TIENE 2 COMPONENTES
        </div>

        <div style={{
          opacity: o1,
          transform: `translateY(${y1}px)`,
          backgroundColor: `${RED}22`,
          border: `3px solid ${RED}88`,
          borderRadius: 50,
          padding: "24px 0",
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 58,
          color: TEXT,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          width: "100%",
          textAlign: "center",
        }}>
          OBSESIONES
        </div>

        <div style={{
          opacity: o2,
          transform: `translateY(${y2}px)`,
          backgroundColor: `${BLUE}22`,
          border: `3px solid ${BLUE}88`,
          borderRadius: 50,
          padding: "24px 0",
          fontFamily: "Inter, sans-serif",
          fontWeight: 900,
          fontSize: 58,
          color: TEXT,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          width: "100%",
          textAlign: "center",
        }}>
          COMPULSIONES
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
