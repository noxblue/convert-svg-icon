// exit without code !0, for continue next node job.
process.on("uncaughtException", function () {
  console.log("=== Generate of Fonts and Sprite are stopped ===");
  console.log("=== Countinue Next Jobs ===");
  return false;
});

const dotenv = require("dotenv");
dotenv.config();
const { src, series, dest, parallel } = require("gulp");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const hashFiles = require("hash-files");
const imagemin = require("gulp-imagemin");
const iconfont = require("gulp-iconfont");
const consolidate = require("gulp-consolidate");
const rename = require("gulp-rename");
const svgSprite = require("gulp-svg-sprite");
const cleanCSS = require("gulp-clean-css");

const runTimestamp = Math.round(Date.now() / 1000);
function resolvePath(dir) {
  return path.join(__dirname, dir);
}
// store parameters
let passedOptions = {};
let modifiedOptions = {};

async function checkHashAndFile() {
  const {
    DEFAULT_DIR,
    ICON_WITHOUT_COLOR_DIR,
    ICON_WITH_COLOR_DIR,
    TARGET_CSS_DIR,
    TARGET_FONTS_DIR,
    TARGET_SPRITE_DIR,
    hashFile,
    cssFileName,
    fontName,
    spriteFileName,
    defaultFontsFolerName,
  } = modifiedOptions;
  const fontsHash = hashFiles.sync({
    files: `${ICON_WITHOUT_COLOR_DIR}/*/**`,
    algorithm: "sha1",
  });
  const svgsHash = hashFiles.sync({
    files: `${ICON_WITH_COLOR_DIR}/*/**`,
    algorithm: "sha1",
  });
  const currentHash = fontsHash + svgsHash;
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
  const {
    DEFAULT_DIR,
    ICON_WITHOUT_COLOR_DIR,
    CSS_FONTS_SRC_DIR,
    TARGET_CSS_DIR,
    hashFile,
    fontName,
    cssFileName,
    cssClassName,
    fontsDemoFileName,
    defaultFontsFolerName,
    defaultCssFolderName,
    defaultDemoFolderName,
  } = modifiedOptions;
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
            cssDir: passedOptions.TARGET_CSS_DIR
              ? `../../${passedOptions.TARGET_CSS_DIR}`
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
  const {
    ICON_WITH_COLOR_DIR,
    DEFAULT_DIR,
    fontName,
    defaultSpriteFolderName,
    spriteFileName,
    defaultDemoFolderName,
    spriteDemoFileName,
  } = modifiedOptions;
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
  const {
    DEFAULT_DIR,
    TARGET_FONTS_DIR,
    TARGET_SPRITE_DIR,
    defaultFontsFolerName,
    defaultSpriteFolderName,
  } = modifiedOptions;
  if (passedOptions.TARGET_FONTS_DIR) {
    moveFiles(path.join(DEFAULT_DIR, defaultFontsFolerName), TARGET_FONTS_DIR);
  }
  if (passedOptions.TARGET_SPRITE_DIR) {
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
  const { TARGET_CSS_DIR, cssFileName } = modifiedOptions;
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

//setting options by parameters
function setOptions(option) {
  // console.log("option", option);
  const cb = {
    defaultFolderName: option.DEFAULT_FOLDER_NAME || "g_fonts",
    defaultCssFolderName: "css",
    defaultFontsFolerName: "fonts",
    defaultSpriteFolderName: "sprites",
    defaultDemoFolderName: "demo",
    ASSETS_DIR: resolvePath(option.ASSETS_DIR || "assets"),
  };

  cb.DEFAULT_DIR = resolvePath(cb.defaultFolderName);
  cb.ICON_WITHOUT_COLOR_DIR = option.ICON_WITHOUT_COLOR_DIR
    ? resolvePath(option.ICON_WITHOUT_COLOR_DIR)
    : path.join(cb.ASSETS_DIR, "icons");
  cb.ICON_WITH_COLOR_DIR = option.ICON_WITH_COLOR_DIR
    ? resolvePath(option.ICON_WITH_COLOR_DIR)
    : path.join(cb.ASSETS_DIR, "svgs");

  cb.TARGET_CSS_DIR = option.TARGET_CSS_DIR
    ? resolvePath(option.TARGET_CSS_DIR)
    : path.join(cb.DEFAULT_DIR, cb.defaultCssFolderName);
  cb.TARGET_FONTS_DIR = option.TARGET_FONTS_DIR
    ? resolvePath(option.TARGET_FONTS_DIR)
    : path.join(cb.DEFAULT_DIR, cb.defaultFontsFolerName);
  cb.TARGET_SPRITE_DIR = option.TARGET_SPRITE_DIR
    ? resolvePath(option.TARGET_SPRITE_DIR)
    : path.join(cb.DEFAULT_DIR, cb.defaultSpriteFolderName);

  const getCssFontsSrc = () => {
    const cssDir =
      option.TARGET_CSS_DIR ||
      path.join(cb.defaultFolderName, cb.defaultCssFolderName);
    const fontsDir =
      option.TARGET_FONTS_DIR ||
      path.join(cb.defaultFolderName, cb.defaultFontsFolerName);
    const rawDirArray = cssDir.split("/");

    let prevPath = "";
    for (let i = 0; i < rawDirArray.length; i++) {
      prevPath = prevPath + "../";
    }
    return `${prevPath}${fontsDir}/`;
  };
  cb.CSS_FONTS_SRC_DIR = getCssFontsSrc();

  // names
  cb.PREFIX = option.PREFIX || "g_fonts";
  cb.fontName = option.FONT_NAME || `${cb.PREFIX}_icons`;
  cb.cssClassName = option.CSS_CLASS_NAME || `${cb.PREFIX}_icons`;
  cb.cssFileName = option.CSS_FILE_NAME || `${cb.PREFIX}_icons.css`;
  cb.spriteFileName =
    cb.SPRITE_FILE_NAME || `${cb.PREFIX}_color_svgs_sprite.svg`;
  cb.fontsDemoFileName = cb.FONTS_DEMO_FILE_NAME || "fonts_demo";
  cb.spriteDemoFileName = cb.SPRITE_DEMO_FILE_NAME || "sprites_demo.html";
  cb.hashFileName = cb.HASH_FILE_NAME || "svg-hash.md";

  cb.hashFile = path.join(cb.DEFAULT_DIR, cb.hashFileName);
  return cb;
}

// create promise function for await series all process complete. and return the result.
const generateFonts = function (options = {}) {
  return new Promise((resolve) => {
    // console.log("generateFonts-options", options);
    passedOptions = { ...options };
    modifiedOptions = setOptions(options);
    series(
      checkHashAndFile,
      parallel(createFontsAndCss, createSvgSprite),
      minifyCss,
      moveFileToTarget,
      function () {
        resolve(true);
      }
    )();
  });
};
module.exports = {
  generateFonts,
};
