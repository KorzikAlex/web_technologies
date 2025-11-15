import { ModuleOptions } from "webpack";
import { BuildOptions } from "./types/types";

export function buildLoaders({paths}: BuildOptions): ModuleOptions['rules'] {
    const scssLoader = {
        test: /\.(s?css|sass)$/,
        use: [
            'css-loader',
            {
                loader: 'sass-loader',
                options: {
                    sassOptions: {
                        quietDeps: true,
                    },
                },
            },
        ],
    };

    const assetsLoader = {
        test: /\.(ico|png|jp?g|webp|svg|gif)$/,
        type: 'asset/resource',
        generator: {
            filename: 'img/[name].[hash:8][ext][query]',
        },
    };

    const tsLoader = {
        test: /\.([cm]?ts|tsx)$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
            configFile: paths.tsConfig,
        }
    };

    const fontsLoader = {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
            filename: 'fonts/[name].[hash:8][ext][query]',
        },
    };

    return [
        scssLoader,
        assetsLoader,
        tsLoader,
        fontsLoader,
    ];
}
