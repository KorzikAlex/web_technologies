import type { MapObject } from './MapObject';

export type Layer = {
    data: number[];
    height: number;
    width: number;
    name: string;
    opacity: number;
    type: string;
    visible: boolean;
    objects?: Array<MapObject>;
    x: number;
    y: number;
};
