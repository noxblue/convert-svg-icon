process.on("uncaughtException", function () {
  console.log("Caught exception");
});
const dotenv = require("dotenv");
dotenv.config();
const { src, series, dest, parallel } = require("gulp");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
// const clean = require("gulp-clean");
const hashFiles = require("hash-files");
const imagemin = require("gulp-imagemin");
const iconfont = require("gulp-iconfont");
// const iconfontCSS = require("gulp-iconfont-css");
const consolidate = require("gulp-consolidate");
const rename = require("gulp-rename");
const svgSprite = require("gulp-svg-sprite");
const cleanCSS = require("gulp-clean-css");

const runTimestamp = Math.round(Date.now() / 1000);
function resolvePath(dir) {
  return path.join(__dirname, dir);
}
// Set Path and Variable at .env file

// FolderNames
const defaultFolderName = process.env.DEFAULT_FOLDER_NAME || "g_iconfont";
const defaultCssFolderName = "css";
const defaultFontsFolerName = "fonts";
const defaultSpriteFolderName = "sprites";
const defaultDemoFolderName = "demo";

// DIRs
const ASSETS_DIR = resolvePath(process.env.ASSETS_DIR || "assets");
const ICON_WITHOUT_COLOR_DIR = process.env.ICON_WITHOUT_COLOR_DIR
  ? resolvePath(process.env.ICON_WITHOUT_COLOR_DIR)
  : path.join(ASSETS_DIR, "icons");
const ICON_WITH_COLOR_DIR = process.env.ICON_WITH_COLOR_DIR
  ? resolvePath(process.env.ICON_WITH_COLOR_DIR)
  : path.join(ASSETS_DIR, "svgs");

const DEFAULT_DIR = resolvePath(defaultFolderName);
const TARGET_CSS_DIR = process.env.TARGET_CSS_DIR
  ? resolvePath(process.env.TARGET_CSS_DIR)
  : path.join(DEFAULT_DIR, defaultCssFolderName);
const TARGET_FONTS_DIR = process.env.TARGET_FONTS_DIR
  ? resolvePath(process.env.TARGET_FONTS_DIR)
  : path.join(DEFAULT_DIR, defaultFontsFolerName);
const TARGET_SPRITE_DIR = process.env.TARGET_SPRITE_DIR
  ? resolvePath(process.env.TARGET_SPRITE_DIR)
  : path.join(DEFAULT_DIR, defaultSpriteFolderName);

function getCssFontsSrc() {
  const cssDir =
    process.env.TARGET_CSS_DIR ||
    path.join(defaultFolderName, defaultCssFolderName);
  const fontsDir =
    process.env.TARGET_FONTS_DIR ||
    path.join(defaultFolderName, defaultFontsFolerName);
  const rawDirArray = cssDir.split("/");

  let prevPath = "";
  for (let i = 0; i < rawDirArray.length; i++) {
    prevPath = prevPath + "../";
  }
  const fontsSourcePath = `${prevPath}${fontsDir}/`;
  return fontsSourcePath;
}
const CSS_FONTS_SRC_DIR = getCssFontsSrc();

// names
const PREFIX = process.env.PREFIX || "iconfont";

const fontName = process.env.FONT_NAME || `${PREFIX}_icons`;
const cssClassName = process.env.CSS_CLASS_NAME || `${PREFIX}_icons`;

const cssFileName = process.env.CSS_FILE_NAME || `${PREFIX}_icons.css`;
const spriteFileName =
  process.env.SPRITE_FILE_NAME || `${PREFIX}_color_svgs_sprite.svg`;
const fontsDemoFileName = process.env.FONTS_DEMO_FILE_NAME || "fonts_demo";
const spriteDemoFileName =
  process.env.SPRITE_DEMO_FILE_NAME || "sprites_demo.html";
const hashFileName = process.env.HASH_FILE_NAME || "svg-hash.md";

const hashFile = path.join(DEFAULT_DIR, hashFileName);

async function checkHashAndFile() {
  const currentHash = hashFiles.sync({
    files: `${ASSETS_DIR}/*/*.*`,
    algorithm: "sha1",
  });
  const prevHash = fs.existsSync(hashFile)
    ? fs.readFileSync(hashFile, "utf8")
    : "";
  let exists = true;
  try {
    fs.accessSync(hashFile);
    fs.accessSync(path.join(TARGET_CSS_DIR, cssFileName));
    fs.accessSync(path.join(TARGET_FONTS_DIR, `${fontName}.eot`));
    fs.accessSync(path.join(TARGET_FONTS_DIR, `${fontName}.ttf`));
    fs.accessSync(path.join(TARGET_FONTS_DIR, `${fontName}.woff`));
    fs.accessSync(path.join(TARGET_FONTS_DIR, `${fontName}.woff2`));
    fs.accessSync(path.join(TARGET_SPRITE_DIR, spriteFileName));
  } catch (err) {
    exists = false;
  }
  if (exists && currentHash && currentHash === prevHash) {
    console.log("Same hash and files, process is stopping.");
    return Promise.reject(new Error("Same hash and files, process stoped"));
  } else {
    console.log("Files has change or not exist. Writing svg-hash.md file.");
    fse.removeSync(DEFAULT_DIR);
    fs.mkdirSync(DEFAULT_DIR, { recursive: true });
    fs.writeFileSync(hashFile, currentHash);
    fs.mkdirSync(path.join(DEFAULT_DIR, defaultFontsFolerName), {
      recursive: true,
    });
    fs.mkdirSync(path.join(TARGET_CSS_DIR), { recursive: true });
    return Promise.resolve();
  }
}

function createFontsAndCss() {
  const hash = fs.existsSync(hashFile)
    ? fs.readFileSync(hashFile, "utf8").substring(0, 8)
    : "";
  return src(path.join(ICON_WITHOUT_COLOR_DIR, "*.svg"))
    .pipe(
      imagemin([
        imagemin.svgo({
          plugins: [
            {
              removeStyleElement: true,
            },
            {
              removeAttrs: {
                attrs: ["fill", "data-name"],
              },
            },
          ],
        }),
      ])
    )
    .pipe(
      iconfont({
        fontName: fontName, // required
        normalize: true,
        fontHeight: 1000,
        prependUnicode: false,
        formats: ["ttf", "eot", "woff", "woff2"], // default, 'woff2' and 'svg' are available
        timestamp: runTimestamp, // recommended to get consistent builds when watching files
      })
    )
    .on("glyphs", function (glyphs, options) {
      // generate fonts demo html
      console.log("generate fonts demo html");
      src("template/html/index.html")
        .pipe(
          consolidate("lodash", {
            glyphs,
            cssDir: process.env.TARGET_CSS_DIR
              ? `../../${process.env.TARGET_CSS_DIR}`
              : `../${defaultCssFolderName}`,
            cssFileName: cssFileName,
            fontName: fontName,
            cssClass: cssClassName,
          })
        )
        .pipe(
          rename(function (path) {
            // console.log("path", path);
            path.basename = fontsDemoFileName;
            path.extname = ".html";
          })
        )
        .pipe(dest(path.join(DEFAULT_DIR, defaultDemoFolderName)));
      // CSS templating, e.g.
      // console.log(glyphs, options);
      console.log("generate css");
      src("template/css/_icons.css")
        .pipe(
          consolidate("lodash", {
            glyphs: glyphs.map(mapGlyphs),
            cssFileName: cssFileName,
            fontPath: CSS_FONTS_SRC_DIR,
            fontName: fontName,
            cssClass: cssClassName,
            cacheBuster: hash,
            cacheBusterQueryString: `?${hash}`,
          })
        )
        .pipe(
          rename(function (path) {
            path.basename = cssFileName.split(".")[0];
          })
        )
        .pipe(dest(TARGET_CSS_DIR));
    })
    .pipe(dest(path.join(DEFAULT_DIR, defaultFontsFolerName)));
  // .on("finish", function () {
  //   console.log("minifyCss");
  // });
}

function mapGlyphs(glyph) {
  return {
    fileName: glyph.name,
    codePoint: glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase(),
  };
}

function createSvgSprite() {
  return src(path.join(ICON_WITH_COLOR_DIR, "*.svg"))
    .pipe(
      imagemin([
        imagemin.svgo({
          plugins: [
            {
              removeAttrs: {
                attrs: ["data-name"],
              },
            },
          ],
        }),
      ])
    )
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            prefix: `.${fontName}-%s`,
            dimensions: true,
            sprite: path.join(defaultSpriteFolderName, spriteFileName),
            dest: "./",
            example: {
              dest: path.join(defaultDemoFolderName, spriteDemoFileName),
            },
          },
        },
      })
    )
    .pipe(dest(DEFAULT_DIR));
}

function moveFileToTarget() {
  if (process.env.TARGET_FONTS_DIR) {
    moveFiles(path.join(DEFAULT_DIR, defaultFontsFolerName), TARGET_FONTS_DIR);
  }
  if (process.env.TARGET_SPRITE_DIR) {
    moveFiles(
      path.join(DEFAULT_DIR, defaultSpriteFolderName),
      TARGET_SPRITE_DIR
    );
  }
  return Promise.resolve();
}
function moveFiles(srcDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fse.copySync(srcDir, targetDir);
  fse.removeSync(srcDir);
}
function minifyCss() {
  return src(path.join(TARGET_CSS_DIR, cssFileName))
    .pipe(cleanCSS())
    .pipe(dest(TARGET_CSS_DIR));
}
// exports.default = series(
//   checkHashAndFile,
//   parallel(createFontsAndCss, createSvgSprite),
//   minifyCss,
//   moveFileToTarget
// );

module.exports = {
  generateFonts: series(
    checkHashAndFile,
    parallel(createFontsAndCss, createSvgSprite),
    minifyCss,
    moveFileToTarget
  )
};
