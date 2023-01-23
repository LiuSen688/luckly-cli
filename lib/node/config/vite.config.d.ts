import { InlineConfig } from 'vite';
import { VarletConfig } from './varlet.config';
export declare function getDevConfig(varletConfig: Required<VarletConfig>): InlineConfig;
export declare function getBuildConfig(varletConfig: Required<VarletConfig>): InlineConfig;
export interface BundleBuildOptions {
    fileName: string;
    output: string;
    format: 'es' | 'cjs' | 'umd';
    emptyOutDir: boolean;
}
