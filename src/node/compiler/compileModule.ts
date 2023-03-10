import fse from "fs-extra";
import { build } from "vite";
import { resolve } from "path";
import {
  EXAMPLE_DIR_NAME,
  TESTS_DIR_NAME,
  DOCS_DIR_NAME,
  SRC_DIR,
  ES_DIR,
  STYLE_DIR_NAME,
  LIB_DIR,
  UMD_DIR,
} from "../shared/constant.js";
import { getPublicDirs, isDir, isDTS, isLess, isScript, isSFC } from "../shared/fsUtils.js";
import { compileSFC } from "./compileSFC.js";
import { compileESEntry, compileScriptFile } from "./compileScript.js";
import { clearLessFiles, compileLess } from "./compileStyle.js";
import { generateReference } from "./compileTypes.js";

const { copy, readdir, removeSync } = fse;


export async function compileDir(dir: string) {
  const dirs = await readdir(dir);

  await Promise.all(
    dirs.map((filename) => {
      const file = resolve(dir, filename);

      [TESTS_DIR_NAME, EXAMPLE_DIR_NAME, DOCS_DIR_NAME].includes(filename) && removeSync(file);

      if (isDTS(file) || filename === STYLE_DIR_NAME) {
        return Promise.resolve();
      }

      return compileFile(file);
    })
  );
}

export async function compileFile(file: string) {
  isSFC(file) && (await compileSFC(file));
  isScript(file) && (await compileScriptFile(file));
  isLess(file) && (await compileLess(file));
  isDir(file) && (await compileDir(file));
}

export async function compileModule() {
  const targetModule = process.env.TARGET_MODULE;

  const dest = targetModule === "commonjs" ? LIB_DIR : ES_DIR;
  await copy(SRC_DIR, dest);
  // const moduleDir: string[] = await readdir(dest);

  // await Promise.all(
  //   moduleDir.map((filename: string) => {
  //     const file: string = resolve(dest, filename);

  //     isDir(file) && ensureFileSync(resolve(file, `./style/index${getScriptExtname()}`));

  //     return isDir(file) ? compileDir(file) : null;
  //   })
  // );

  const publicDirs = await getPublicDirs();

  await compileESEntry(dest, publicDirs);

  clearLessFiles(dest);
  generateReference(dest);
}
