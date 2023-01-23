import vue from '@vitejs/plugin-vue';
import jsx from '@vitejs/plugin-vue-jsx';
import { markdown, html } from '@varlet/vite-plugins';
import { SITE_CONFIG, SITE_DIR, SITE_OUTPUT_PATH, SITE_PC_ROUTES, SITE_PUBLIC_PATH, VITE_RESOLVE_EXTENSIONS, } from '../shared/constant.js';
import { get } from 'lodash-es';
import { resolve } from 'path';
export function getDevConfig(varletConfig) {
    const defaultLanguage = get(varletConfig, 'defaultLanguage');
    const host = get(varletConfig, 'host');
    return {
        // 项目根目录（index.html 文件所在的位置）
        root: SITE_DIR,
        resolve: {
            // 导入时想要省略的扩展名列表 -> 自动补后缀名
            extensions: VITE_RESOLVE_EXTENSIONS,
            // 设置路径别名
            alias: {
                '@config': SITE_CONFIG,
                '@pc-routes': SITE_PC_ROUTES,
            },
        },
        // 开发服务器选项
        server: {
            port: get(varletConfig, 'port'),
            host: host === 'localhost' ? '0.0.0.0' : host,
        },
        // 作为静态资源服务的文件夹
        publicDir: SITE_PUBLIC_PATH,
        // 插件
        plugins: [
            vue({
                include: [/\.vue$/, /\.md$/],
            }),
            jsx(),
            markdown({ style: get(varletConfig, 'highlight.style') }),
            html({
                data: {
                    logo: get(varletConfig, `logo`),
                    baidu: get(varletConfig, `analysis.baidu`, ''),
                    pcTitle: get(varletConfig, `pc.title['${defaultLanguage}']`),
                },
            }),
        ],
    };
}
export function getBuildConfig(varletConfig) {
    const devConfig = getDevConfig(varletConfig);
    return Object.assign(Object.assign({}, devConfig), { base: './', build: {
            // 指定输出路径
            outDir: SITE_OUTPUT_PATH,
            reportCompressedSize: false,
            emptyOutDir: true,
            cssTarget: 'chrome61',
            // rollup 配置项
            rollupOptions: {
                input: {
                    main: resolve(SITE_DIR, 'index.html'),
                },
            },
        } });
}
