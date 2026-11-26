import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const NAVY = 'rgb(3, 30, 59)';
const COPPER = '#C1763C';
const WHITE = '#FFFFFF';

// Barras medidas sobre el PNG original de 1254x1254 (fracciones del ancho del logo)
// x, w, top, bottom. Barras 1,2,4,5 comparten base (y=481); la central se extiende hacia abajo.
const SRC = 1254;
const BARS = [
  {x: 424, w: 45, top: 378, bot: 481, anchor: 'bottom' as const},
  {x: 506, w: 51, top: 314, bot: 481, anchor: 'bottom' as const},
  {x: 598, w: 62, top: 220, bot: 552, anchor: 'center' as const},
  {x: 701, w: 51, top: 314, bot: 481, anchor: 'bottom' as const},
  {x: 788, w: 45, top: 379, bot: 481, anchor: 'bottom' as const},
];

// Frecuencia y fase distintas por barra para que el pulso parezca audio real
const PULSE = [
  {freq: 0.9, phase: 0.0, amp: 0.10},
  {freq: 1.3, phase: 1.7, amp: 0.13},
  {freq: 0.7, phase: 3.1, amp: 0.09},
  {freq: 1.1, phase: 4.6, amp: 0.13},
  {freq: 1.5, phase: 0.9, amp: 0.11},
];

const SpotifyIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={WHITE}>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const YouTubeIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <rect x="1" y="4.5" width="22" height="15" rx="4" fill={WHITE} />
    <path d="M10 9l5.2 3L10 15z" fill={NAVY} />
  </svg>
);

const Pill: React.FC<{
  icon: React.ReactNode;
  label: string;
  scale: number;
  progress: number;
}> = ({icon, label, scale, progress}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16 * scale,
      padding: `${18 * scale}px ${36 * scale}px`,
      borderRadius: 999,
      border: `${2.5 * scale}px solid rgba(255,255,255,0.55)`,
      opacity: progress,
      transform: `translateY(${(1 - progress) * 26 * scale}px)`,
    }}
  >
    {icon}
    <span
      style={{
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 600,
        fontSize: 38 * scale,
        color: WHITE,
        letterSpacing: 0.5,
      }}
    >
      {label}
    </span>
  </div>
);

export const LogoOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  const minDim = Math.min(width, height);
  const scale = minDim / 1080;
  const isWide = width > height;

  // Tamaño del logo: generoso pero con aire
  const logoSize = isWide ? height * 0.62 : minDim * 0.66;
  const barScale = logoSize / SRC;

  // Entrada del logo: fade suave + leve crecimiento
  const logoIn = spring({frame, fps, config: {damping: 200}, durationInFrames: 30});
  const logoOpacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const logoScale = 0.965 + 0.035 * logoIn;

  // Glow de fondo que respira lentamente
  const breath = 0.5 + 0.5 * Math.sin((frame / fps) * 0.6 * Math.PI * 2 - Math.PI / 2);
  const glowOpacity = logoOpacity * (0.05 + 0.03 * breath);

  // CTA
  const ctaLineIn = spring({
    frame: frame - Math.round(fps * 1.4),
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });
  const pill1In = spring({
    frame: frame - Math.round(fps * 1.75),
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });
  const pill2In = spring({
    frame: frame - Math.round(fps * 1.95),
    fps,
    config: {damping: 200},
    durationInFrames: 25,
  });

  const bars = BARS.map((b, i) => {
    // Entrada: crecen escalonadas desde el centro del logo hacia afuera
    const order = [2, 1, 3, 0, 4].indexOf(i);
    const grow = spring({
      frame: frame - 6 - order * 3,
      fps,
      config: {damping: 13, mass: 0.6},
      durationInFrames: 40,
    });
    // Pulso continuo, sutil, tipo ecualizador
    const settled = interpolate(frame, [fps * 1.2, fps * 2], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const p = PULSE[i];
    const pulse =
      1 + settled * p.amp * Math.sin((frame / fps) * p.freq * Math.PI * 2 + p.phase);
    const scaleY = Math.max(0.05, grow) * pulse;
    return {...b, scaleY};
  });

  return (
    <AbsoluteFill style={{backgroundColor: NAVY}}>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: (isWide ? 44 : 84) * scale,
        }}
      >
        {/* Logo con barras animadas encima */}
        <div
          style={{
            position: 'relative',
            width: logoSize,
            height: logoSize,
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
          }}
        >
          <Img
            src={staticFile('logos/clubterapia-navy-sinbarras.png')}
            style={{width: '100%', height: '100%', borderRadius: '50%'}}
          />
          {bars.map((b, i) => {
            const h = (b.bot - b.top + 1) * barScale;
            const w = b.w * barScale;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: b.x * barScale,
                  top: b.top * barScale,
                  width: w,
                  height: h,
                  borderRadius: w / 2,
                  backgroundColor: WHITE,
                  transform: `scaleY(${b.scaleY})`,
                  transformOrigin: b.anchor === 'bottom' ? 'center bottom' : 'center center',
                }}
              />
            );
          })}
        </div>

        {/* CTA */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 40 * scale,
          }}
        >
          <div
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 500,
              fontSize: 44 * scale,
              color: 'rgba(255,255,255,0.92)',
              letterSpacing: 0.5,
              opacity: ctaLineIn,
              transform: `translateY(${(1 - ctaLineIn) * 26 * scale}px)`,
            }}
          >
            Mirá el episodio <span style={{color: COPPER, fontWeight: 600}}>completo</span> en
          </div>
          <div style={{display: 'flex', gap: 36 * scale}}>
            <Pill
              icon={<YouTubeIcon size={44 * scale} />}
              label="YouTube"
              scale={scale}
              progress={pill1In}
            />
            <Pill
              icon={<SpotifyIcon size={44 * scale} />}
              label="Spotify"
              scale={scale}
              progress={pill2In}
            />
          </div>
        </div>
      </AbsoluteFill>
      {/* Glow radial sutil por encima (screen no genera costuras sobre el PNG) */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% ${isWide ? 50 : 42}%, rgba(255,255,255,${glowOpacity}) 0%, rgba(255,255,255,0) 55%)`,
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};
