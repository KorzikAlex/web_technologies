import type { Tileset, TilesLayer, ObjectsLayer } from './';

export type TiledMapData = {
    height: number;
    layers: (TilesLayer | ObjectsLayer)[];
    orientation: string;
    properties: { name: string; value: string | number | boolean; type: string }[];
    tileheight: number;
    tilesets: Tileset[];
    tilewidth: number;
    version: string;
    width: number;
    renderorder: string;
    tiledversion: string;
    nextlayerid: number;
    nextobjectid: number;
    compressionlevel: number;
    infinite: boolean;
};
