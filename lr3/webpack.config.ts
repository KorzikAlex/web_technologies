import path from 'path';
import 'webpack-dev-server';
import {fileURLToPath} from "node:url";
import {dirname} from "node:path";
import webpack from "webpack";
import fs from "fs";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

type Mode = 'development' | 'production';
const viewsPath: string = path.resolve(__dirname, 'src', 'views');
const PAGES: string[] = fs.existsSync(viewsPath) ? fs.readdirSync(viewsPath).filter((name: string): boolean =>
    name.endsWith('.pug')) : [];

interface EnvVariables {
    mode?: Mode;
}

export default (env: EnvVariables = {}): webpack.Configuration => {
    const mode: Mode = env.mode ?? 'development';

    return {
        name: 'client',
        mode: mode,
        entry: {
            main: path.resolve(__dirname, 'src', 'client', 'users.ts'),
        },
        devtool: mode === 'development' ? 'inline-source-map' : false,
        target: 'web',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.s?css$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                sassOptions: {
                                    includePaths: [path.resolve(__dirname, 'node_modules')]
                                }
                            }
                        }
                    ],
                },
                // {
                //     test: /\.pug$/,
                //     use: '@webdiscus/pug-loader',
                //     exclude: /node_modules/,
                // },
                {
                    test: /\.(woff2?|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[name][ext]'
                    }
                }
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            path: path.resolve(__dirname, 'public', 'webpack-build'),
            filename: mode === 'development' ? '[name].js' : '[name].[contenthash].js',
            publicPath: '/webpack-build/',
        },
        plugins: [
            new webpack.ProgressPlugin(),
            ...PAGES.map((file: string) => new HtmlWebpackPlugin({
                template: `./src/views/${file}`,
                filename: `./${file.replace(/\.pug/, '.html')}`
            }))
        ],
    };
};
