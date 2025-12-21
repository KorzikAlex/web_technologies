export type TilesLayer = {
    data: number[];
    height: number;
    width: number;
    id: number;
    name: string;
    type: string;
    opacity: number;
    visible: boolean;
    x: number;
    y: number;
    properties?: { name: string; value: string | number | boolean; type: string }[];
};
