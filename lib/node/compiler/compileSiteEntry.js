import slash from 'slash';
import fse from 'fs-extra';
import { DOCS_DIR_NAME, DIR_INDEX, EXAMPLE_DIR_NAME, LOCALE_DIR_NAME, ROOT_DOCS_DIR, ROOT_PAGES_DIR, SITE, SITE_DIR, SITE_PC_DIR, SITE_PC_ROUTES, SRC_DIR, } from '../shared/constant.js';
import { glob, isDir, outputFileSyncOnChange } from '../shared/fsUtils.js';
import { getVarletConfig } from '../config/varlet.config.js';
import { get } from 'lodash-es';
const { copy } = fse;
const EXAMPLE_COMPONENT_NAME_RE = /\/([-\w]+)\/example\/index.vue/;
const COMPONENT_DOCS_RE = /\/([-\w]+)\/docs\/([-\w]+)\.md/;
const ROOT_DOCS_RE = /\/docs\/([-\w]+)\.([-\w]+)\.md/;
const ROOT_LOCALE_RE = /\/pages\/([-\w]+)\/locale\/([-\w]+)\.ts/;
export function getExampleRoutePath(examplePath) {
    var _a;
    return '/' + ((_a = examplePath.match(EXAMPLE_COMPONENT_NAME_RE)) === null || _a === void 0 ? void 0 : _a[1]);
}
export function getComponentDocRoutePath(componentDocsPath) {
    var _a;
    const [, routePath, language] = (_a = componentDocsPath.match(COMPONENT_DOCS_RE)) !== null && _a !== void 0 ? _a : [];
    return `/${language}/${routePath}`;
}
export function getRootDocRoutePath(rootDocsPath) {
    var _a;
    const [, routePath, language] = (_a = rootDocsPath.match(ROOT_DOCS_RE)) !== null && _a !== void 0 ? _a : [];
    return `/${language}/${routePath}`;
}
export function getRootRoutePath(rootLocalePath) {
    var _a;
    const [, routePath, language] = (_a = rootLocalePath.match(ROOT_LOCALE_RE)) !== null && _a !== void 0 ? _a : [];
    return `/${language}/${routePath}`;
}
export function getRootFilePath(rootLocalePath) {
    return rootLocalePath.replace(/locale\/.+/, DIR_INDEX);
}
export function findExamples() {
    return glob(`${SRC_DIR}/**/${EXAMPLE_DIR_NAME}/${DIR_INDEX}`);
}
export function findComponentDocs() {
    // ${SRC_DIR}/**/${DOCS_DIR_NAME} ---> 查找并返回src/目录下所有文件中docs文件夹下所有以.md结尾的文件
    return glob(`${SRC_DIR}/**/${DOCS_DIR_NAME}/*.md`);
}
export function findRootDocs() {
    // 查找并返回 node 运行目录下 docs文件夹下 .md结尾的文件
    return glob(`${ROOT_DOCS_DIR}/*.md`);
}
export async function findRootLocales() {
    const defaultLanguage = get(await getVarletConfig(), 'defaultLanguage');
    // node 运行目录下 pages 文件夹下所有文件
    const userPages = await glob(`${ROOT_PAGES_DIR}/*`);
    const baseLocales = await glob(`${SITE}/pc/pages/**/${LOCALE_DIR_NAME}/*.ts`);
    const userLocales = await userPages.reduce(async (userLocales, page) => {
        if (isDir(page)) {
            const locales = await glob(`${page}/${LOCALE_DIR_NAME}/*.ts`);
            if (!locales.length)
                locales.push(`${page}/${LOCALE_DIR_NAME}/${defaultLanguage}.ts`);
            (await userLocales).push(...locales);
        }
        return userLocales;
    }, Promise.resolve([]));
    // filter
    const filterMap = new Map();
    baseLocales.forEach((locale) => {
        var _a;
        const [, routePath, language] = (_a = locale.match(ROOT_LOCALE_RE)) !== null && _a !== void 0 ? _a : [];
        filterMap.set(routePath + language, slash(`${SITE_PC_DIR}/pages/${routePath}/locale/${language}.ts`));
    });
    userLocales.forEach((locale) => {
        var _a;
        const [, routePath, language] = (_a = locale.match(ROOT_LOCALE_RE)) !== null && _a !== void 0 ? _a : [];
        filterMap.set(routePath + language, locale);
    });
    return Promise.resolve(Array.from(filterMap.values()));
}
export async function buildPcSiteRoutes() {
    const [componentDocs, rootDocs, rootLocales] = await Promise.all([
        findComponentDocs(),
        findRootDocs(),
        findRootLocales(),
    ]);
    const componentDocsRoutes = componentDocs.map((componentDoc) => `
      {
        path: '${getComponentDocRoutePath(componentDoc)}',
        // @ts-ignore
        component: () => import('${componentDoc}')
      }`);
    const rootDocsRoutes = rootDocs.map((rootDoc) => `
      {
        path: '${getRootDocRoutePath(rootDoc)}',
        // @ts-ignore
        component: () => import('${rootDoc}')
      }`);
    const layoutRoutes = `{
    path: '/layout',
    // @ts-ignore
    component:()=> import('${slash(SITE_PC_DIR)}/Layout.vue'),
    children: [
      ${[...componentDocsRoutes, rootDocsRoutes].join(',')},
    ]
  }`;
    const source = `export default [\
  ${layoutRoutes}
]`;
    outputFileSyncOnChange(SITE_PC_ROUTES, source);
}
export async function buildSiteSource() {
    // 把脚手架下site文件夹内容放到 SITE_DIR 对应的目录下
    return copy(SITE, SITE_DIR);
}
export async function buildSiteEntry() {
    await getVarletConfig(true);
    await Promise.all([buildPcSiteRoutes(), buildSiteSource()]);
}
