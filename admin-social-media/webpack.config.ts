import path from "path";
import webpack from "webpack";

import { buildWebpack } from "./config/build/buildWebpack";
import { BuildMode, BuildPaths } from "./config/build/types/types";

interface EnvVariables {
    mode?: BuildMode,
    port?: number,
}

export default (env: EnvVariables): webpack.Configuration => {
    const paths: BuildPaths = {
        output: path.join(__dirname, 'dist', 'client', 'webpack'),
        views: path.join(__dirname, 'src', 'client', 'ui', 'views'),
        tsConfig: path.join('tsconfig.client.webpack.json'),
    }

    const alias: Record<string, string> = {
        '@': path.join(__dirname, 'src', 'client'),
        '@scss': path.join(__dirname, 'src', 'client', 'public', 'scss'),
        '@images': path.join(__dirname, 'src', 'client', 'public', 'assets', 'images'),
        '@ts': path.join(__dirname, 'src', 'client', 'ts'),
        '@ui': path.join(__dirname, 'src', 'client', 'ui'),
        '@components': path.join(__dirname, 'src', 'client', 'ui', 'components'),
        '@assets': path.join(__dirname, 'src', 'client', 'public', 'assets'),
    }

    const config: webpack.Configuration = buildWebpack({
        port: env.port ?? 5000,
        mode: env.mode ?? 'development',
        paths: paths,
        alias: alias,
    });

    return config;
}

