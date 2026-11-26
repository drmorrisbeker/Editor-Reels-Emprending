import React from 'react';
import {Composition} from 'remotion';
import {LogoOutro} from './LogoOutro';

const FPS = 30;
const DURATION = FPS * 6;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LogoOutro-Vertical"
        component={LogoOutro}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="LogoOutro-Cuadrado"
        component={LogoOutro}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1080}
      />
      <Composition
        id="LogoOutro-Horizontal"
        component={LogoOutro}
        durationInFrames={DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  );
};
