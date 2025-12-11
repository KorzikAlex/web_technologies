import type { Layer } from "./Layer";
import type { Tileset } from "./Tileset";

export type MapData = {
    width: number;
    height: number;
    tilewidth: number;
    tileheight: number;
    tilesets: Array<Tileset>;
    layers: Array<Layer>;
};
