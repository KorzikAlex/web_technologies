export interface BuildPaths {
    tsConfig: string,
    output: string,
    views: string,
}

export type BuildMode = 'production' | 'development';

export interface BuildOptions {
    port: number,
    paths: BuildPaths,
    mode: BuildMode,
    alias: Record<string, string>,
}