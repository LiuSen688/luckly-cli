import AppType from './appType';
interface PCLocationInfo {
    language: string;
    menuName: string;
}
export type Theme = 'lightTheme' | 'darkTheme';
export type StyleVars = Record<string, string>;
export declare function StyleProvider(styleVars?: StyleVars | null): void;
export declare function getPCLocationInfo(): PCLocationInfo;
export declare function getBrowserTheme(): Theme;
export declare function watchLang(cb: (lang: string) => void, platform?: 'pc' | 'mobile'): void;
export declare function withSiteConfigNamespace(styleVars: Record<string, any>): StyleVars;
export declare function watchPlatform(cb: (platform: string) => void): void;
export declare function useRouteListener(cb: () => void): void;
export declare function watchDarkMode(dark: StyleVars, cb?: (theme: Theme) => void): void;
export declare function watchTheme(cb: (theme: Theme, from: 'pc' | 'mobile' | 'default' | 'playground') => void, shouldUnmount?: boolean): void;
export { AppType };
