import path from "node:path";
import PugPlugin from 'pug-plugin';
import {fileURLToPath} from "node:url";
import webpack from "webpack";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

type Mode = 'development' | 'production';

interface EnvVariables {
    mode: Mode,
    name: string,
    clean: boolean,
}


export default (env: EnvVariables): webpack.Configuration => {
    const isDev: boolean = env.mode === 'development';
    const config: webpack.Configuration = {
        name: env.name ?? "client",
        mode: env.mode ?? "development",
        output: {
            path: path.resolve("dist", "client", "webpack"),
            filename: "[name].[contenthash].js",
            clean: env.clean ?? true,
        },
        entry: {
            "index-page": path.resolve("src", "client", "pages", "index-page.js"),
        },
        module: {
            rules: [
                {
                    test: /\.svg$/,
                    type: 'asset/resource'
                },
                {
                    test: /\.pug$/,
                    loader: '@webdiscus/pug-loader',
                    options: {
                        mode: 'render',
                        esModule: true
                    }
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // Creates `style` nodes from JS strings
                        "style-loader",
                        // Translates CSS into CommonJS
                        "css-loader",
                        // Compiles Sass to CSS
                        "sass-loader",
                    ],
                },
                {
                    test: /\.([cm]?ts|tsx)$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                    options: {
                        configFile: path.resolve(__dirname, "tsconfig.client.json"),
                    }
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            extensionAlias: {
                ".js": [".js", ".ts"],
                ".cjs": [".cjs", ".cts"],
                ".mjs": [".mjs", ".mts"]
            }
        },
        plugins: [
            new PugPlugin({
                entry: path.resolve("src", "client", "ui"),
                data: {},
            }),
            isDev && new webpack.ProgressPlugin()
        ]
    }
    return config;
}