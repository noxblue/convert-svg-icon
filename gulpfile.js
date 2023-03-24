const dotenv = require("dotenv");
dotenv.config();
const { src, series, dest, parallel } = require("gulp");
const fs = require("fs");
const path = require("path");
const clean = require("gulp-clean");
const hashFiles = require("hash-files");
const imagemin = require("gulp-imagemin");
const iconfont = require("gulp-iconfont");
const iconfontCSS = require("gulp-iconfont-css");
const consolidate = require("gulp-consolidate");
const rename = require("gulp-rename");
const svgSprite = require("gulp-svg-sprite");
const cleanCSS = require("gulp-clean-css");

const runTimestamp = Math.round(Date.now() / 1000);
function resolvePath(dir) {
  return path.join(__dirname, dir);
}
// you can set variable: "PREFIX, ASSETS_DIR, TARGET_DIR, ICON_WITHOUT_COLOR_DIR, ICON_WITH_COLOR_DIR" at .env file
const ASSETS_DIR = resolvePath(process.env.ASSETS_DIR || "assets");
const ICON_WITHOUT_COLOR_DIR = process.env.ICON_WITHOUT_COLOR_DIR
  ? resolvePath(process.env.ICON_WITHOUT_COLOR_DIR)
  : `${ASSETS_DIR}/icons`;
const ICON_WITH_COLOR_DIR = process.env.ICON_WITH_COLOR_DIR
  ? resolvePath(process.env.ICON_WITH_COLOR_DIR)
  : `${ASSETS_DIR}/svgs`;
const TARGET_DIR = resolvePath(process.env.TARGET_DIR || "dist");
const PREFIX = process.env.PREFIX || "iconfont";

// relative targetDir
const CSS_DIR = "css";
const FONTS_DIR = "fonts";
const SPRITE_DIR = "sprites";
const DEMO_DIR = "demo";
const HASH_FILE_DIR = TARGET_DIR;

const fontName = `${PREFIX}_icons`;
const cssClassName = `${PREFIX}_icons`;
const cssFileName = `${PREFIX}_icons.css`;
const spriteFileName = `${PREFIX}_color_svgs_sprite.svg`;
const fontsDemoFileName = "fonts_demo";
const spriteDemoFileName = "sprites_demo.html";
const hashFileName = "svg-hash.md";
const hashFile = path.join(HASH_FILE_DIR, hashFileName);

function cleanFile(filePath) {
  console.log("clean", filePath);
  return src(filePath, { allowEmpty: true }).pipe(
    clean({ read: false, force: true })
  );
}

function initGenerate() {
  return cleanFile(TARGET_DIR);
}

async function checkHashAndFile() {
  const currentHash = hashFiles.sync({
    files: `${ASSETS_DIR}/*/*.*`,
    algorithm: "sha1",
  });
  const prevHash = fs.existsSync(hashFile)
    ? fs.readFileSync(hashFile, "utf8")
    : "";
  console.log("currentHash", currentHash, "prevHash", prevHash);
  let exists = true;
  try {
    fs.accessSync(hashFile);
    fs.accessSync(path.join(CSS_DIR, cssFileName));
    fs.accessSync(path.join(FONTS_DIR, `${fontName}.eot`));
    fs.accessSync(path.join(FONTS_DIR, `${fontName}.ttf`));
    fs.accessSync(path.join(FONTS_DIR, `${fontName}.woff`));
    fs.accessSync(path.join(FONTS_DIR, `${fontName}.woff2`));
    fs.accessSync(path.join(SPRITE_DIR, spriteFileName));
  } catch (err) {
    exists = false;
  }
  if (exists && currentHash && currentHash === prevHash) {
    console.log("Same hash and files, process is stopping.");
    return Promise.reject(new Error("Same hash and files, process stoped"));
  } else {
    console.log("Files has change or not exist. Writing svg-hash.md file.");
    // await initGenerate();
    fs.mkdirSync(HASH_FILE_DIR, { recursive: true });
    fs.writeFileSync(hashFile, currentHash);
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
      iconfontCSS({
        path: "template/css/_icons.css",
        fontName: fontName,
        targetPath: `../${path.join(CSS_DIR, cssFileName)}`,
        fontPath: `../${FONTS_DIR}/`,
        cssClass: cssClassName,
        cacheBuster: hash,
      })
    )
    .pipe(
      iconfont({
        fontName: fontName, // required
        normalize: true,
        fontHeight: 1000,
        prependUnicode: true, // recommended option
        formats: ["ttf", "eot", "woff", "woff2"], // default, 'woff2' and 'svg' are available
        timestamp: runTimestamp, // recommended to get consistent builds when watching files
      })
    )
    .on("glyphs", function (glyphs, options) {
      // generate fonts demo html
      src("template/html/index.html")
        .pipe(
          consolidate("lodash", {
            glyphs,
            cssDir: `../${CSS_DIR}`,
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
        .pipe(dest(path.join(TARGET_DIR, DEMO_DIR)));

      // CSS templating, e.g.
      // console.log(glyphs, options);
    })
    .pipe(dest(path.join(TARGET_DIR, FONTS_DIR)))
    .on("finish", function () {
      console.log("minifyCss");
      const cssPath = path.join(TARGET_DIR, CSS_DIR);
      src(path.join(cssPath, cssFileName)).pipe(cleanCSS()).pipe(dest(cssPath));
    });
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
            sprite: path.join(SPRITE_DIR, spriteFileName),
            dest: "./",
            example: {
              dest: path.join(DEMO_DIR, spriteDemoFileName),
            },
          },
        },
      })
    )
    .pipe(dest(TARGET_DIR));
}

exports.default = series(
  checkHashAndFile,
  // initGenerate,
  parallel(createFontsAndCss, createSvgSprite)
);
