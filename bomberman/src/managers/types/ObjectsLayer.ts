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
    draworder?: string;
    properties?: { name: string; value: string | number | boolean; type: string }[];
};
