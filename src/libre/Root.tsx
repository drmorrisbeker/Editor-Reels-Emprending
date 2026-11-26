// Root propio de la versión estilo libre. NO toca src/Root.tsx ni la plantilla.
import "../index.css"; // fuentes de marca (Inter, etc.) + tailwind
import { Composition } from "remotion";
import { ReelLibre } from "./ReelLibre";
import { CLIP_SECONDS } from "./theme";

export const LibreRoot: React.FC = () => {
  return (
    <Composition
      id="ReelLibre"
      component={ReelLibre}
      durationInFrames={Math.round(CLIP_SECONDS * 30)}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
