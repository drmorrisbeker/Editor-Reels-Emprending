// ReelFreestyle — dirección creativa propia (Día de la Salud Mental, 3 consejos).
// Full-screen del locutor SIN zoom (pedido del cliente). Sistema editorial:
//   · scrims navy arriba/abajo para seatear UI sin tapar la cara
//   · riel de progreso de 3 tramos (estructura "3 consejos") arriba + handle
//   · tarjeta de capítulo por consejo (numeral grande + rótulo), entra/sale <2s
//   · subtítulos con realce de palabra activa (FreestyleSubtitles)
//   · CTA de "compartir" en el cierre (empuja la acción que pide el guion)
//   · portada (frame 0): cara presentable (≈21,75s) + título editorial
//   · sound design sutil con los SFX del repo (sin música, pedido del cliente)
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Video } from "@remotion/media";
import { FreestyleSubtitles } from "./FreestyleSubtitles";
import { C, F, CHAPTERS, SECTIONS, msToFrame } from "./theme";

export interface FreestyleProps {
  videoSrc: string;
  captionsSrc: string;
  portadaBgMs: number;
  durationSeconds: number;
}

// ── Scrims: velos navy arriba y abajo, suaves, para legibilidad de la UI ──────
const Scrims: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, rgba(9,20,37,0.72) 0%, rgba(9,20,37,0.32) 14%, rgba(9,20,37,0) 30%)`,
      }}
    />
    <AbsoluteFill
      style={{
        background: `linear-gradient(0deg, rgba(9,20,37,0.82) 0%, rgba(9,20,37,0.45) 18%, rgba(9,20,37,0) 40%)`,
      }}
    />
  </>
);

// ── Riel de progreso: 3 tramos que se llenan a medida que avanzan los consejos ─
const ProgressRail: React.FC = () => {
  const frame = useCurrentFrame();
  const bounds = [
    [msToFrame(SECTIONS.tip1), msToFrame(SECTIONS.tip2)],
    [msToFrame(SECTIONS.tip2), msToFrame(SECTIONS.tip3)],
    [msToFrame(SECTIONS.tip3), msToFrame(SECTIONS.cierre)],
  ];
  return (
    <div
      style={{
        position: "absolute",
        top: 232,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: 12,
      }}
    >
      {bounds.map(([s, e], i) => {
        const fill = interpolate(frame, [s, e], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              width: 128,
              height: 7,
              borderRadius: 999,
              background: "rgba(246,239,228,0.22)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${fill * 100}%`,
                height: "100%",
                borderRadius: 999,
                background: C.copper,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

const Handle: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 258,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: F.ui,
      fontWeight: 600,
      fontSize: 27,
      letterSpacing: "0.04em",
      color: "rgba(246,239,228,0.9)",
      textShadow: "0 2px 12px rgba(0,0,0,0.5)",
    }}
  >
    @dr.morrisbeker
  </div>
);

// ── Tarjeta de capítulo: numeral grande + rótulo corto, por consejo ───────────
const ChapterCard: React.FC<{ n: number; label: string }> = ({ n, label }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20, mass: 0.6 }, durationInFrames: 14 });
  const exit = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = enter * exit;
  const y = interpolate(enter, [0, 1], [26, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 360,
        left: 64,
        right: 64,
        opacity,
        transform: `translateY(${y}px)`,
        display: "flex",
        alignItems: "center",
        gap: 28,
      }}
    >
      <div
        style={{
          fontFamily: F.display,
          fontWeight: 800,
          fontSize: 150,
          lineHeight: 0.82,
          color: C.copper,
          textShadow: "0 8px 30px rgba(0,0,0,0.45)",
        }}
      >
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            width: 54,
            height: 5,
            borderRadius: 999,
            background: C.copper,
            marginBottom: 14,
          }}
        />
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 700,
            fontSize: 58,
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            color: C.white,
            textShadow: "0 4px 22px rgba(0,0,0,0.6)",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

// ── CTA de cierre: empuja a compartir (la acción que pide el guion) ───────────
const ShareCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 18, mass: 0.6 }, durationInFrames: 16 });
  const y = interpolate(enter, [0, 1], [24, 0]);
  return (
    <div
      style={{
        position: "absolute",
        top: 372,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: enter,
        transform: `translateY(${y}px)`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 20,
          background: C.copper,
          color: C.navy,
          padding: "22px 42px",
          borderRadius: 999,
          fontFamily: F.display,
          fontWeight: 800,
          fontSize: 48,
          letterSpacing: "-0.01em",
          boxShadow: "0 18px 44px rgba(223,190,154,0.32), 0 6px 14px rgba(0,0,0,0.3)",
        }}
      >
        Compartilo
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6M12 3v13M12 3 7 8M12 3l5 5"
            stroke={C.navy}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

// ── Portada (frame 0): cara presentable (≈portadaBgMs) + título editorial ─────
const Cover: React.FC<{ videoSrc: string; portadaBgMs: number }> = ({ videoSrc, portadaBgMs }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Video
        src={staticFile(videoSrc)}
        trimBefore={Math.round((portadaBgMs / 1000) * fps)}
        volume={0}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(0deg, rgba(9,20,37,0.96) 0%, rgba(9,20,37,0.78) 26%, rgba(9,20,37,0.1) 54%, rgba(9,20,37,0) 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: F.ui,
          fontWeight: 600,
          fontSize: 28,
          letterSpacing: "0.26em",
          color: C.copper,
          textShadow: "0 2px 12px rgba(0,0,0,0.5)",
        }}
      >
        10 · 10   DÍA DE LA SALUD MENTAL
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 300 }}>
        <div
          style={{
            fontFamily: F.display,
            fontWeight: 800,
            fontSize: 190,
            lineHeight: 0.84,
            letterSpacing: "-0.03em",
            color: C.white,
          }}
        >
          3 consejos
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: F.display,
            fontWeight: 600,
            fontSize: 62,
            lineHeight: 1.04,
            letterSpacing: "-0.01em",
            color: C.cream,
          }}
        >
          de un psiquiatra para{" "}
          <span style={{ color: C.copper }}>cuidarte de verdad</span>
        </div>
        <div
          style={{
            marginTop: 40,
            fontFamily: F.ui,
            fontWeight: 600,
            fontSize: 32,
            letterSpacing: "0.03em",
            color: "rgba(246,239,228,0.82)",
          }}
        >
          @dr.morrisbeker
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ReelFreestyle: React.FC<FreestyleProps> = ({ videoSrc, captionsSrc, portadaBgMs }) => {
  const sfx = (name: string) => staticFile(`sfx/${name}`);
  const cardFrames = 56; // ~1,87 s en pantalla (regla: ≤ ~2 s por elemento)

  return (
    <AbsoluteFill style={{ background: C.navyDeep }}>
      {/* Locutor full-screen, SIN zoom. Audio del clip (ya con loudnorm). */}
      <Video
        src={staticFile(videoSrc)}
        volume={1.4}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* La portada (frames 0-1) va al final y tapa toda la UI de abajo en ese frame. */}
      <Scrims />
      <ProgressRail />
      <Handle />

      {/* Tarjetas de capítulo por consejo */}
      {CHAPTERS.map((ch) => (
        <Sequence key={ch.n} from={msToFrame(ch.atMs)} durationInFrames={cardFrames}>
          <ChapterCard n={ch.n} label={ch.label} />
        </Sequence>
      ))}

      {/* CTA de cierre */}
      <Sequence from={msToFrame(SECTIONS.cierre)}>
        <ShareCTA />
      </Sequence>

      {/* Subtítulos con realce de palabra activa */}
      <FreestyleSubtitles captionsSrc={captionsSrc} />

      {/* Sound design (sin música): woosh en cada cambio de consejo + pop en el CTA */}
      <Sequence from={msToFrame(SECTIONS.tip1) - 3} durationInFrames={30}>
        <Audio src={sfx("woosh.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={msToFrame(SECTIONS.tip2) - 3} durationInFrames={30}>
        <Audio src={sfx("woosh.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={msToFrame(SECTIONS.tip3) - 3} durationInFrames={30}>
        <Audio src={sfx("woosh.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={msToFrame(SECTIONS.cierre)} durationInFrames={20}>
        <Audio src={sfx("pop.mp3")} volume={0.45} />
      </Sequence>

      {/* Portada: SOLO frames 0-1 (thumbnail del feed). Va encima de todo. */}
      <Sequence from={0} durationInFrames={2}>
        <Cover videoSrc={videoSrc} portadaBgMs={portadaBgMs} />
      </Sequence>
    </AbsoluteFill>
  );
};
