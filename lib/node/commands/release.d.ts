interface ReleaseCommandOptions {
    remote?: string;
    task?(): Promise<void>;
}
export declare function release(options: ReleaseCommandOptions): Promise<void>;
export {};
