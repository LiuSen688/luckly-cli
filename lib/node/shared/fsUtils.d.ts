export declare function getPublicDirs(): Promise<string[]>;
export declare const isMD: (file: string) => boolean;
export declare const isDir: (file: string) => boolean;
export declare const isSFC: (file: string) => boolean;
export declare const isDTS: (file: string) => boolean;
export declare const isScript: (file: string) => boolean;
export declare const isLess: (file: string) => boolean;
export declare const isPublicDir: (dir: string) => boolean;
export declare const replaceExt: (file: string, ext: string) => string;
export declare function smartAppendFileSync(file: string, code: string): void;
export declare function outputFileSyncOnChange(path: string, code: string): void;
export declare function glob(pattern: string): Promise<string[]>;
export declare function getDirname(url: string): string;
export declare function getVersion(): any;
export declare function getCliVersion(): any;