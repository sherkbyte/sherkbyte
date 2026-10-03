import type { MutableRefObject } from 'react';

export type V3 = [number, number, number];
export type SceneKind = 'hero' | 'infrastructure' | 'cloud' | 'data' | 'ai' | 'qa';

export type SceneProps = {
  animate: boolean;          // false when reduced motion is on
  lite: boolean;             // simplified geometry / fewer particles
  stage?: string | null;     // stage chosen via accessible buttons
  mode?: 'hero' | 'story';
  progressRef?: MutableRefObject<number>;
};
