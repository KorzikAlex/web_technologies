import type { ObjectProperty } from './';

export type ObjectsLayer = {
    id: number;
    height?: number;
    width?: number;
    name: string;
    type: string;
    opacity: number;
    visible: boolean;
    objects?: ObjectProperty[];
    x: number;
    y: number;
};
