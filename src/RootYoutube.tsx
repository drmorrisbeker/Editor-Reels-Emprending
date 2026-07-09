import "./index.css";
import { Composition } from "remotion";
import { YouTubeVideo } from "./YouTubeVideo";
import { YouTubeVideoPropsSchema } from "./youtubeSchema";

const youtubeDefaultProps = {
  videoSrc: "",
  bgMusicSrc: "",
  credentialStartMs: 35000,
  credentialDurationMs: 4500,
  indexStartMs: 0,
  chapters: [] as { title: string; startMs: number }[],
  keyPhrases: [] as { text: string; startMs: number; endMs: number; position: "bottom-left" | "bottom-right" | "top-right" }[],
  conceptCards: [] as { numero: string; title: string; subtitle?: string; startMs: number }[],
  stats: [] as { value: string; label: string; source?: string; startMs: number }[],
  zoomPhrases: [] as { startMs: number; endMs: number; scale: number }[],
  ctaStartMs: 0,
  ctaText: "¿Qué te generó este tema? Comentalo abajo",
  durationSeconds: 600,
};

export const RemotionRootYoutube: React.FC = () => {
  return (
    <Composition
      id="Plantilla-DrBeker-Youtube"
      component={YouTubeVideo}
      schema={YouTubeVideoPropsSchema}
      defaultProps={youtubeDefaultProps}
      durationInFrames={Math.round(youtubeDefaultProps.durationSeconds * 30)}
      fps={30}
      width={1920}
      height={1080}
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.round(props.durationSeconds * 30),
      })}
    />
  );
};
