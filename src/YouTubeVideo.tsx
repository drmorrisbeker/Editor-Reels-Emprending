import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video, Audio } from "@remotion/media";
import { LowerThird } from "./components/youtube/LowerThird";
import { ChapterIndex } from "./components/youtube/ChapterIndex";
import { KeyPhrase } from "./components/youtube/KeyPhrase";
import { ConceptCardYT } from "./components/youtube/ConceptCardYT";
import { AnimatedStat } from "./components/youtube/AnimatedStat";
import { CtaOverlay } from "./components/youtube/CtaOverlay";
import type { YouTubeVideoProps } from "./youtubeSchema";

// YouTube zooms are subtler and smoother than reels
const RAMP_MS = 300;

const VideoWithZoom: React.FC<{
  src: string;
  zoomPhrases: YouTubeVideoProps["zoomPhrases"];
}> = ({ src, zoomPhrases }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;

  const scale = zoomPhrases.reduce((max, p) => {
    const s = interpolate(
      ms,
      [p.startMs, p.startMs + RAMP_MS, p.endMs - RAMP_MS, p.endMs],
      [1, p.scale, p.scale, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
    return Math.max(max, s);
  }, 1);

  return (
    <Video
      src={staticFile(src)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
      volume={1}
    />
  );
};

const s = (ms: number, fps: number) => Math.round((ms / 1000) * fps);
const d = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

export const YouTubeVideo: React.FC<YouTubeVideoProps> = ({
  videoSrc,
  bgMusicSrc,
  credentialStartMs,
  credentialDurationMs,
  indexStartMs,
  chapters,
  keyPhrases,
  conceptCards,
  stats,
  zoomPhrases,
  ctaStartMs,
  ctaText,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <VideoWithZoom src={videoSrc} zoomPhrases={zoomPhrases} />

      {bgMusicSrc && (
        <Audio src={staticFile(bgMusicSrc)} volume={0.04} />
      )}

      {/* Subtle bottom gradient for readability of lower-third elements */}
      <AbsoluteFill style={{
        background: "linear-gradient(to top, rgba(11,25,41,0.35) 0%, rgba(11,25,41,0.08) 18%, rgba(11,25,41,0) 30%)",
        pointerEvents: "none",
      }} />

      {/* Lower third — name + credential */}
      {credentialDurationMs > 0 && (
        <Sequence from={s(credentialStartMs, fps)} durationInFrames={d(credentialDurationMs, fps)}>
          <LowerThird />
        </Sequence>
      )}

      {/* Chapter index — "en este video" */}
      {chapters.length > 0 && indexStartMs > 0 && (
        <Sequence from={s(indexStartMs, fps)} durationInFrames={d(7000 + chapters.length * 500, fps)}>
          <ChapterIndex chapters={chapters} />
        </Sequence>
      )}

      {/* Key phrases on screen */}
      {keyPhrases.map((kp, i) => (
        <Sequence key={i} from={s(kp.startMs, fps)} durationInFrames={d(kp.endMs - kp.startMs, fps)}>
          <KeyPhrase text={kp.text} position={kp.position} />
        </Sequence>
      ))}

      {/* Section concept cards — 2.5s each */}
      {conceptCards.map((cc, i) => (
        <Sequence key={i} from={s(cc.startMs, fps)} durationInFrames={d(2500, fps)}>
          <ConceptCardYT numero={cc.numero} title={cc.title} subtitle={cc.subtitle} />
        </Sequence>
      ))}

      {/* Animated stats — 4s each */}
      {stats.map((stat, i) => (
        <Sequence key={i} from={s(stat.startMs, fps)} durationInFrames={d(4000, fps)}>
          <AnimatedStat value={stat.value} label={stat.label} source={stat.source} />
        </Sequence>
      ))}

      {/* CTA */}
      {ctaStartMs > 0 && (
        <Sequence from={s(ctaStartMs, fps)} durationInFrames={d(6000, fps)}>
          <CtaOverlay text={ctaText} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
