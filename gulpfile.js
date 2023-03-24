const { src, series, dest, parallel } = require("gulp");
const fs = require("fs");
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

const ASSETS_DIR = "assets";
const TARGET_DIR = "tanji_fonts";
const CSS_DIR = `${TARGET_DIR}/css`;
const FONTS_DIR = `${TARGET_DIR}/fonts`;
const SPRITE_DIR = `${TARGET_DIR}/sprites`;
const DEMO_DIR = `${TARGET_DIR}/demo`;

const cssName = "tanji_icons.css";
const fontName = "tanji_icons";
const cssClassName = "tanji_icons";
const spriteName = "tanji_color_svgs_sprite.svg";
const fontsDemoName = "fonts_demo";
const spriteDemoName = "sprites_demo.html";
const hashFileName = "svg-hash.md";

function cleanFile(filePath) {
  console.log("clean", filePath);
  return src(filePath, { allowEmpty: true }).pipe(
    clean({ read: false, force: true })
  );
}

function initGenerate() {
  return cleanFile(TARGET_DIR);
}

function checkHashAndFile() {
  const currentHash = hashFiles.sync({
    files: `${ASSETS_DIR}/*/*.*`,
    algorithm: "sha1",
  });
  const prevHash = fs.existsSync(hashFileName)
    ? fs.readFileSync(hashFileName, "utf8")
    : "";
  let exists = true;
  try {
    fs.accessSync(hashFileName);
    fs.accessSync(`${CSS_DIR}/${cssName}`);
    fs.accessSync(`${FONTS_DIR}/${fontName}.eot`);
    fs.accessSync(`${FONTS_DIR}/${fontName}.ttf`);
    fs.accessSync(`${FONTS_DIR}/${fontName}.woff`);
    fs.accessSync(`${FONTS_DIR}/${fontName}.woff2`);
    fs.accessSync(`${SPRITE_DIR}/${spriteName}`);
  } catch (err) {
    exists = false;
  }
  if (exists && currentHash && currentHash === prevHash) {
    console.log("Same hash and files, process is stopping.");
    return Promise.reject(new Error("Same hash and files, process stoped"));
  } else {
    console.log("Files has change or not exist. Writing svg-hash.md file.");
    fs.writeFileSync(hashFileName, currentHash);
    return Promise.resolve();
  }
}

function createFontsAndCss() {
  const hash = fs.existsSync(hashFileName)
    ? fs.readFileSync(hashFileName, "utf8").substring(0, 8)
    : "";
  return src(`${ASSETS_DIR}/icons/*.svg`)
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
        targetPath: `../css/${cssName}`,
        fontPath: "../fonts/",
        cssClass: `${cssClassName}`,
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
            fontName: fontName,
            cssClass: `${cssClassName}`,
          })
        )
        .pipe(
          rename(function (path) {
            // console.log("path", path);
            path.basename = `${fontsDemoName}`;
            path.extname = ".html";
          })
        )
        .pipe(dest(`${DEMO_DIR}/`));

      // CSS templating, e.g.
      // console.log(glyphs, options);
    })
    .pipe(dest(`${FONTS_DIR}/`))
    .on("finish", function () {
      console.log("minifyCss");
      src(`${CSS_DIR}/${fontName}.css`)
        .pipe(cleanCSS())
        .pipe(dest(`${CSS_DIR}/`));
    });
}
function createSvgSprite() {
  return src(`${ASSETS_DIR}/svgs/*.svg`)
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
            sprite: `./${spriteName}`,
            dest: `./`,
            example: {
              dest: `../demo/${spriteDemoName}`,
            },
          },
        },
      })
    )
    .pipe(dest(`${SPRITE_DIR}/`));
}

exports.default = series(
  checkHashAndFile,
  initGenerate,
  parallel(createFontsAndCss, createSvgSprite)
);
