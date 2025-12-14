import type { MetaInfo, Frame } from './';

export type Atlas = {
    frames: Record<string, Frame>;
    meta: MetaInfo;
};
