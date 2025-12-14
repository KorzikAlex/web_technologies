import type { ObjectProperty } from './';

export type ObjectsLayer = {
    height: number;
    name: string;
    type: string;
    opacity: number;
    visible: boolean;
    objects: ObjectProperty[];
    x: number;
    y: number;
};
