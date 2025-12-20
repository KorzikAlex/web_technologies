export type Tileset = {
    firstgid: number;
    source?: string; // Путь к внешнему файлу тайлсета
    image?: string;
    imageheight?: number;
    imagewidth?: number;
    margin?: number;
    name?: string;
    properties?: unknown[];
    spacing?: number;
    tileheight?: number;
    tilewidth?: number;
    columns?: number;
    tilecount?: number;
};

