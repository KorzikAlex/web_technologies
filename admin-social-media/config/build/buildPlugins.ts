import webpack, { Configuration } from "webpack";
import { BuildOptions } from "./types/types";
import PugPlugin from "pug-plugin";


export function buildPlugins({ mode, paths }: BuildOptions): Configuration['plugins'] {
    const isDev = mode === 'development';

    const plugins: Configuration['plugins'] = [
        new PugPlugin({
            entry: paths.views,
            js: {
                filename: 'js/[name].[contenthash:8].js',
            },
            css: {
                filename: 'css/[name].[contenthash:8].css',
            },
        })
    ];

    if (isDev) {
        plugins.push(new webpack.ProgressPlugin());
    }

    return plugins;
}