import path from "node:path";
import fs from "node:fs";
import PugPlugin from 'pug-plugin';

const __pathname: string = import.meta.url;
const __filename: string = path.basename(__pathname);
const __dirname: string = path.dirname(__pathname);

const PAGES: string[] = fs.readdirSync(path.resolve("src", "client", "ui")).filter((name: string): boolean =>
    name.endsWith('.pug')
)

export default {
    name: "client",
    mode: "development",
    output: {
        path: path.resolve("dist", "client", "webpack"),
    },
    entry: {
        index: path.resolve("src", "client", "pages", "index-page.ts"),
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
        })
    ]
}