const { src, series, dest, parallel } = require("gulp");
const clean = require("gulp-clean");
const hashFiles = require("hash-files");
const imagemin = require("gulp-imagemin");
const iconfont = require("gulp-iconfont");
const iconfontCSS = require("gulp-iconfont-css");
const svgSprite = require("gulp-svg-sprite");
const cleanCSS = require("gulp-clean-css");

const runTimestamp = Math.round(Date.now() / 1000);
const fontName = "tanji_icons";
const DIST = "tanji_fonts";
let hashString = "";

function cleanFile(filePath) {
  return src(filePath, { allowEmpty: true }).pipe(
    clean({ read: false, force: true })
  );
}
function initGenerate() {
  return cleanFile(DIST);
}

function getFileHashValue() {
  return new Promise((resolve, reject) => {
    hashFiles(
      { files: "assets/icons/*.*", algorithm: "sha1" },
      function (error, hash) {
        if (error) {
          console.log("error", error);
          reject(error);
        }
        hashString = hash.substring(0, 8);
        resolve(hashString);
      }
    );
  });
}

function minifySvgWithoutColor() {
  return src("assets/icons/*.svg")
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
    .pipe(dest(`${DIST}/temp/nocolor/`));
}

function createFontFile() {
  return (
    src(`${DIST}/temp/nocolor/*.svg`)
      .pipe(
        iconfontCSS({
          path: "css_template/_icons.css",
          fontName: fontName,
          targetPath: "../css/tanji_icons.css",
          fontPath: "../fonts/",
          cssClass: "tanji_icons",
          cacheBuster: hashString,
        })
      )
      .pipe(
        iconfont({
          fontName: fontName, // required
          normalize: true,
          prependUnicode: true, // recommended option
          formats: ["ttf", "eot", "woff", "woff2"], // default, 'woff2' and 'svg' are available
          timestamp: runTimestamp, // recommended to get consistent builds when watching files
        })
      )
      // .on("glyphs", function (glyphs, options) {
      //   // CSS templating, e.g.
      //   console.log(glyphs, options);
      // })
      .pipe(dest(`${DIST}/fonts/`))
  );
  // .on("finish", function () {
  //   cleanFile(`${DIST}/temp`);
  // });
}
function minifySvgWithColor() {
  return src("assets/svgs/*.svg")
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
    .pipe(dest(`${DIST}/temp/color/`));
}

function createSymbolSvg() {
  return src(`${DIST}/temp/color/*.svg`)
    .pipe(
      svgSprite({
        mode: { symbol: { dest: `./`, sprite: "color_sprite_svgs" } },
      })
    )
    .pipe(dest(`${DIST}/svgs/`));
  // .on("finish", function () {
  //   cleanFile(`${DIST}/temp`);
  // });
}

function minifyCss() {
  return src(`${DIST}/css/${fontName}.css`)
    .pipe(cleanCSS())
    .pipe(dest(`${DIST}/css/`));
}

function doneGenerate() {
  return cleanFile(`${DIST}/temp`);
}

exports.default = series(
  initGenerate,
  parallel(getFileHashValue, minifySvgWithoutColor, minifySvgWithColor),
  parallel(createFontFile, createSymbolSvg),
  minifyCss,
  doneGenerate
);
