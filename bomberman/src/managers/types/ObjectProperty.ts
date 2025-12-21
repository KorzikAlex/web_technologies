export type ObjectProperty = {
    gid: number;
    height: number;
    name: string;
    properties: { name: string; value: string | number | boolean; type: string }[];
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
};
