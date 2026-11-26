// Freestyle Root — composición propia "ReelFreestyle" con su entry point.
// NO toca src/Root.tsx ni ninguna composición existente.
import "./fonts.css";
import { Composition } from "remotion";
import { ReelFreestyle, type FreestyleProps } from "./ReelFreestyle";

const defaultProps: FreestyleProps = {
  videoSrc: "proyectos/dia-salud-mental/Ediciones/clip_edit3.mp4",
  captionsSrc: "proyectos/dia-salud-mental/Ediciones/clip_edit3_captions.json",
  portadaBgMs: 21750, // cara presentable verificada (≈21,75 s)
  durationSeconds: 50.566665,
};

export const FreestyleRoot: React.FC = () => {
  return (
    <Composition
      id="ReelFreestyle"
      component={ReelFreestyle}
      defaultProps={defaultProps}
      durationInFrames={Math.round(defaultProps.durationSeconds * 30)}
      fps={30}
      width={1080}
      height={1920}
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.round(props.durationSeconds * 30),
      })}
    />
  );
};
