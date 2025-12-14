import type { Tileset, TilesLayer, ObjectsLayer } from './';

export type TiledMapData = {
    height: number;
    layers: TilesLayer[] | ObjectsLayer[];
    orientation: string;
    properties: unknown[];
    tileheight: number;
    tilesets: Tileset[];
    tilewidth: number;
    version: string;
    width: number;
};
