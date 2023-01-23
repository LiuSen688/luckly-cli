export declare function removeDir(): Promise<[void, void, void, void]>;
export declare function runTask(taskName: string, task: () => any): Promise<void>;
export declare function compile(): Promise<void>;
