declare module "pug-plugin" {
    import { Compiler, WebpackPluginInstance } from "webpack";
    interface PugPluginOptions {
        entry: string | Record<string, string>;
        js?: {
            filename?: string;
        };
        css?: {
            filename?: string;
        };
        pretty?: boolean;
    }
    class PugPlugin implements WebpackPluginInstance {
        constructor(options: PugPluginOptions);
        apply(compiler: Compiler): void;
    }
    export default PugPlugin;
}