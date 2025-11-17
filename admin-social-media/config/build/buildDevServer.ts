import { type Configuration as DevServerConfiguration } from "webpack-dev-server";
import { BuildOptions } from "./types/types";

export function buildDevServer({ port, paths }: BuildOptions): DevServerConfiguration {
    return {
        port: port ?? 5000,
        open: true,
        historyApiFallback: true,
        hot: true,
        compress: true,
        static: {
            directory: paths.output,
        },
        client: {
            progress: true,
            reconnect: true,
        }
    }
}