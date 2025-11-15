import { Configuration } from "webpack";
import { BuildOptions } from "./types/types";

export function buildResolvers({ alias }: BuildOptions): Configuration['resolve'] {
    return {
        extensions: ['.tsx', '.ts', '.js'],
        extensionAlias: {
            ".js": [".js", ".ts"],
            ".cjs": [".cjs", ".cts"],
            ".mjs": [".mjs", ".mts"]
        },
        alias: alias,
    }
}