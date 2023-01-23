import fse from 'fs-extra';
import { transformAsync } from '@babel/core';
import { bigCamelize } from '@varlet/shared';
import { getVersion, isDir, replaceExt } from '../shared/fsUtils.js';
import { extractStyleDependencies, IMPORT_CSS_RE, IMPORT_LESS_RE, REQUIRE_CSS_RE, REQUIRE_LESS_RE, } from './compileStyle.js';
import { resolve, extname, dirname } from 'path';
import { get } from 'lodash-es';
import { getVarletConfig } from '../config/varlet.config.js';
const { writeFileSync, readdirSync, readFileSync, removeSync, writeFile, pathExistsSync } = fse;
// https://regexr.com/765a4
export const IMPORT_FROM_DEPENDENCE_RE = /import\s+?[\w\s{},$*]+\s+from\s+?(".*?"|'.*?')/g;
// https://regexr.com/767e6
export const EXPORT_FROM_DEPENDENCE_RE = /export\s+?[\w\s{},$*]+\s+from\s+?(".*?"|'.*?')/g;
// https://regexr.com/764ve
export const IMPORT_DEPENDENCE_RE = /import\s+(".*?"|'.*?')/g;
// https://regexr.com/764vn
export const REQUIRE_DEPENDENCE_RE = /require\((".*?"|'.*?')\)/g;
export const scriptExtNames = ['.vue', '.ts', '.tsx', '.mjs', '.js', '.jsx'];
export const styleExtNames = ['.less', '.css'];
export const scriptIndexes = ['index.mjs', 'index.vue', 'index.ts', 'index.tsx', 'index.js', 'index.jsx'];
export const styleIndexes = ['index.less', 'index.css'];
export const tryMatchExtname = (file, extname) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const ext of extname) {
        const matched = `${file}${ext}`;
        if (pathExistsSync(matched)) {
            return ext;
        }
    }
};
export const resolveDependence = (file, script) => {
    const replacer = (source, dependence) => {
        dependence = dependence.slice(1, dependence.length - 1);
        const ext = extname(dependence);
        const targetDependenceFile = resolve(dirname(file), dependence);
        const scriptExtname = getScriptExtname();
        const inNodeModules = !dependence.startsWith('.');
        const done = (targetDependence) => source.replace(dependence, targetDependence);
        if (inNodeModules) {
            // e.g. @varlet/shared
            return source;
        }
        if (ext) {
            if (scriptExtNames.includes(ext)) {
                // e.g. './a.vue' -> './a.m?js'
                return done(dependence.replace(ext, scriptExtname));
            }
            if (styleExtNames.includes(ext)) {
                // e.g. './a.css' -> './a.css' './a.less' -> './a.less'
                return source;
            }
        }
        if (!ext) {
            // e.g. ../button/props -> ../button/props.m?js
            const matchedScript = tryMatchExtname(targetDependenceFile, scriptExtNames);
            if (matchedScript) {
                return done(`${dependence}${scriptExtname}`);
            }
            const matchedStyle = tryMatchExtname(targetDependenceFile, styleExtNames);
            if (matchedStyle) {
                return done(`${dependence}${matchedStyle}`);
            }
        }
        if (!ext && isDir(targetDependenceFile)) {
            // e.g. ../button
            const files = readdirSync(targetDependenceFile);
            const hasScriptIndex = files.some((file) => scriptIndexes.some((name) => file.endsWith(name)));
            if (hasScriptIndex) {
                // e.g. -> ../button/index.m?js
                return done(`${dependence}/index${scriptExtname}`);
            }
            const hasStyleIndex = files.some((file) => styleIndexes.some((name) => file.endsWith(name)));
            if (hasStyleIndex) {
                // e.g. -> ../button/index.css
                return done(`${dependence}/index.css`);
            }
        }
        return '';
    };
    return script
        .replace(IMPORT_FROM_DEPENDENCE_RE, replacer)
        .replace(EXPORT_FROM_DEPENDENCE_RE, replacer)
        .replace(IMPORT_DEPENDENCE_RE, replacer)
        .replace(REQUIRE_DEPENDENCE_RE, replacer);
};
export const moduleCompatible = async (script) => {
    const moduleCompatible = get(await getVarletConfig(), 'moduleCompatible', {});
    Object.keys(moduleCompatible).forEach((esm) => {
        const commonjs = moduleCompatible[esm];
        script = script.replace(esm, commonjs);
    });
    return script;
};
export async function compileScript(script, file) {
    const targetModule = process.env.TARGET_MODULE;
    if (targetModule === 'commonjs') {
        script = await moduleCompatible(script);
    }
    let { code } = (await transformAsync(script, {
        filename: file,
    }));
    if (code) {
        code = resolveDependence(file, code);
        code = extractStyleDependencies(file, code, targetModule === 'commonjs' ? REQUIRE_CSS_RE : IMPORT_CSS_RE);
        code = extractStyleDependencies(file, code, targetModule === 'commonjs' ? REQUIRE_LESS_RE : IMPORT_LESS_RE);
        removeSync(file);
        writeFileSync(replaceExt(file, getScriptExtname()), code, 'utf8');
    }
}
export async function compileScriptFile(file) {
    const sources = readFileSync(file, 'utf-8');
    await compileScript(sources, file);
}
export function getScriptExtname() {
    if (process.env.TARGET_MODULE === 'module') {
        return '.mjs';
    }
    return '.js';
}
export async function compileESEntry(dir, publicDirs) {
    const imports = [];
    const plugins = [];
    const exports = [];
    const cssImports = [];
    const publicComponents = [];
    const scriptExtname = getScriptExtname();
    publicDirs.forEach((dirname) => {
        const publicComponent = bigCamelize(dirname);
        const module = `'./${dirname}/index${scriptExtname}'`;
        publicComponents.push(publicComponent);
        imports.push(`import ${publicComponent} from ${module}`);
        exports.push(`export * from ${module}`);
        plugins.push(`${publicComponent}.install && app.use(${publicComponent})`);
        cssImports.push(`import './${dirname}/style/index${scriptExtname}'`);
    });
    const install = `
function install(app) {
  ${plugins.join('\n  ')}
}
`;
    const version = `const version = '${getVersion()}'`;
    const indexTemplate = `\
${imports.join('\n')}\n
${exports.join('\n')}\n
${version}
${install}
export {
  version,
  install,
  ${publicComponents.join(',\n  ')}
}

export default {
  version,
  install,
  ${publicComponents.join(',\n  ')}
}
`;
    const styleTemplate = `\
${cssImports.join('\n')}
`;
    const bundleTemplate = `\
${imports.join('\n')}\n
${cssImports.join('\n')}\n
${version}
${install}
export {
  version,
  install,
  ${publicComponents.join(',\n  ')}
}

export default {
  version,
  install,
  ${publicComponents.join(',\n  ')}
}
`;
    await Promise.all([
        writeFile(resolve(dir, 'index.mjs'), indexTemplate, 'utf-8'),
        writeFile(resolve(dir, 'index.bundle.mjs'), bundleTemplate, 'utf-8'),
        writeFile(resolve(dir, 'style.mjs'), styleTemplate, 'utf-8'),
    ]);
}
export async function compileCommonJSEntry(dir, publicDirs) {
    const requires = [];
    const plugins = [];
    const cssRequires = [];
    const publicComponents = [];
    const exports = [];
    publicDirs.forEach((dirname) => {
        const publicComponent = bigCamelize(dirname);
        const module = `'./${dirname}/index.js'`;
        publicComponents.push(publicComponent);
        requires.push(`var ${publicComponent} = require(${module})['default']`);
        exports.push(`...ignoreDefault(require(${module}))`);
        plugins.push(`${publicComponent}.install && app.use(${publicComponent})`);
        cssRequires.push(`require('./${dirname}/style/index.js')`);
    });
    const version = `const version = '${getVersion()}'`;
    const install = `
function install(app) {
  ${plugins.join('\n  ')}
}
`;
    const indexTemplate = `\
${requires.join('\n')}\n
${version}
${install}

function ignoreDefault(module) {
  return Object.keys(module).reduce((exports, key) => {
    if (key !== 'default') {
      exports[key] = module[key]
    }

    return exports
  }, {})
}

module.exports = {
  version,
  install,
  ${exports.join(',\n  ')},
  ${publicComponents.join(',\n  ')}
}
`;
    const styleTemplate = `\
${cssRequires.join('\n')}
`;
    await Promise.all([
        writeFile(resolve(dir, 'index.js'), indexTemplate, 'utf-8'),
        writeFile(resolve(dir, 'style.js'), styleTemplate, 'utf-8'),
    ]);
}
