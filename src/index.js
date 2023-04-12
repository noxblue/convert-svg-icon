/*
all options:
options = {
  // Defaults
      PREFIX: PrefixName:String || "g_fonts",
      FONT_NAME: FontName:String || `${PRIFIX}_icons`,
      CSS_CLASS_NAME: ClassName:String || `${PREFIX}_icons`,

  // File Names
      CSS_TEMPLATE_NAME: CssTemplateFileName || "_icons.css",
      CSS_FILE_NAME: CssFileName || `${PREFIX}${CSS_TEMPLATE_NAME}`,
      HTML_DEMO_TEMPLATE_NAME: FontsHtmlDemoTemplateFileName:String || "fonts_demo.html",
      FONTS_DEMO_FILE_NAME: FontsHtmlDemoFileName:String || HTML_DEMO_TEMPLATE_NAME,
      SPRITE_FILE_NAME: SpriteFileName:String || `${PREFIX}_color_svgs_sprite.svg`,
      SPRITE_DEMO_FILE_NAME: SpriteDemoFileName:String || "sprites_demo.html",
      HASH_FILE_NAME: HashFileName:String || "svg-hash.md",

  // Folder Names
      DEFAULT_FOLDER_NAME: FolderName:String || "g_fonts",
      ASSETS_DIR: AssetsPath:String || "assets",

  // Dictionary Path
      ICON_WITHOUT_COLOR_DIR: SvgsToFontsFileFolder:String || `${ASSETS_DIR}/icons`,
      ICON_WITH_COLOR_DIR: SvgsToSpriteFileFolder:String || `${ASSETS_DIR}/svgs`,
      CSS_TEMPLATE_DIR: FontCssTemplateFolder:String || "template/css",
      HTML_DEMO_TEMPLATE_DIR: FontDemoHtmlTemplateFolder:String || "template/html",
      TARGET_CSS_DIR: PlaceTheFontCssFolder:String || `${DEFAULT_DIR}/css`,
      TARGET_FONTS_DIR: PlaceTheFontsFolder:String || `${DEFAULT_DIR}/fonts`,
      TARGET_SPRITE_DIR: PlaceTheSpriteSvgFolder:String || `${DEFAULT_DIR}/sprites`

  // Other Setting
      demo: IfNeedDemoHtml:Boolean || false 
};

REQUIRE to setting:
    ICON_WITHOUT_COLOR_DIR: Need find where's the fonts source svgs.
    ICON_WITH_COLOR_DIR: Need find where's the sprite source svgs.
    TARGET_CSS_DIR, TARGET_FONTS_DIR, TARGET_SPRITE_DIR: Tell us where's files should place?

ADVICE to setting:
    PREFIX,FONT_NAME,CSS_CLASS_NAME,CSS_FILE_NAME: Let File and Names more Customize.
    DEFAULT_FOLDER_NAME: Easy to find the Demo htmls.
*/

// const dotenv = require("dotenv");
// dotenv.config();
const { src, series, dest, parallel } = require("gulp");
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { SHA1 } = require("jshashes");
const imagemin = require("gulp-imagemin");
const iconfont = require("gulp-iconfont");
const consolidate = require("gulp-consolidate");
const rename = require("gulp-rename");
const svgSprite = require("gulp-svg-sprite");
const cleanCSS = require("gulp-clean-css");

// create promise function for await series all process complete. and return the result.
const generateFonts = function (options = {}) {
  return new Promise((resolve, reject) => {
    // exit without code !0, for continue next node job.
    process.on("uncaughtException", function () {
      // console.log("=== Generate of Fonts and Sprite are stopped ===");
      // console.log("=== Countinue Next Jobs ===");
      return reject(false);
    });
    const runTimestamp = Math.round(Date.now() / 1000);

    const BASE_DIR = process.cwd();

    const resolvePath = (dir) => {
      return path.join(BASE_DIR, dir);
    };

    // Modify options by parameters
    const modifyOptions = (options) => {
      // defaults
      const cb = {
        defaultFolderName: options.DEFAULT_FOLDER_NAME || "g_fonts",
        defaultCssFolderName: "css",
        defaultFontsFolerName: "fonts",
        defaultSpriteFolderName: "sprites",
        defaultDemoFolderName: "demo",
        ASSETS_DIR: resolvePath(options.ASSETS_DIR || "assets"),
        PREFIX: options.PREFIX || "g_fonts",
        demo: !!options.demo,
      };
      cb.DEFAULT_DIR = resolvePath(cb.defaultFolderName);

      // names
      cb.fontName = options.FONT_NAME || `${cb.PREFIX}_icons`;
      cb.cssClassName = options.CSS_CLASS_NAME || `${cb.PREFIX}_icons`;

      cb.CSS_TEMPLATE_NAME = options.CSS_TEMPLATE_NAME || "_icons.css";
      cb.cssFileName =
        options.CSS_FILE_NAME || `${cb.PREFIX}${cb.CSS_TEMPLATE_NAME}`;

      cb.HTML_DEMO_TEMPLATE_NAME =
        options.HTML_DEMO_TEMPLATE_NAME || "fonts_demo.html";
      cb.fontsDemoFileName =
        options.FONTS_DEMO_FILE_NAME || cb.HTML_DEMO_TEMPLATE_NAME;

      cb.spriteFileName =
        options.SPRITE_FILE_NAME || `${cb.PREFIX}_color_svgs_sprite.svg`;
      cb.spriteDemoFileName =
        options.SPRITE_DEMO_FILE_NAME || "sprites_demo.html";

      cb.hashFileName = options.HASH_FILE_NAME || "svg-hash.md";
      cb.hashFile = path.join(cb.DEFAULT_DIR, cb.hashFileName);

      //DIRs
      cb.ICON_WITHOUT_COLOR_DIR = options.ICON_WITHOUT_COLOR_DIR
        ? resolvePath(options.ICON_WITHOUT_COLOR_DIR)
        : path.join(cb.ASSETS_DIR, "icons");
      cb.ICON_WITH_COLOR_DIR = options.ICON_WITH_COLOR_DIR
        ? resolvePath(options.ICON_WITH_COLOR_DIR)
        : path.join(cb.ASSETS_DIR, "svgs");

      cb.CSS_TEMPLATE_DIR = options.CSS_TEMPLATE_DIR
        ? resolvePath(path.join(options.CSS_TEMPLATE_DIR, cb.CSS_TEMPLATE_NAME))
        : path.join(__dirname, "template/css", cb.CSS_TEMPLATE_NAME);
      cb.HTML_DEMO_TEMPLATE_DIR = options.HTML_DEMO_TEMPLATE_DIR
        ? resolvePath(
            path.join(
              options.HTML_DEMO_TEMPLATE_DIR,
              cb.HTML_DEMO_TEMPLATE_NAME
            )
          )
        : path.join(__dirname, "template/html", cb.HTML_DEMO_TEMPLATE_NAME);
      cb.TARGET_CSS_DIR = options.TARGET_CSS_DIR
        ? resolvePath(options.TARGET_CSS_DIR)
        : path.join(cb.DEFAULT_DIR, cb.defaultCssFolderName);
      cb.TARGET_FONTS_DIR = options.TARGET_FONTS_DIR
        ? resolvePath(options.TARGET_FONTS_DIR)
        : path.join(cb.DEFAULT_DIR, cb.defaultFontsFolerName);
      cb.TARGET_SPRITE_DIR = options.TARGET_SPRITE_DIR
        ? resolvePath(options.TARGET_SPRITE_DIR)
        : path.join(cb.DEFAULT_DIR, cb.defaultSpriteFolderName);

      const getCssFontsSrc = () => {
        const cssDir =
          options.TARGET_CSS_DIR ||
          path.join(cb.defaultFolderName, cb.defaultCssFolderName);
        const fontsDir =
          options.TARGET_FONTS_DIR ||
          path.join(cb.defaultFolderName, cb.defaultFontsFolerName);
        const rawDirArray = cssDir.split("/");

        let prevPath = "";
        for (let i = 0; i < rawDirArray.length; i++) {
          prevPath = prevPath + "../";
        }
        return `${prevPath}${fontsDir}/`;
      };
      cb.CSS_FONTS_SRC_DIR = getCssFontsSrc();

      // demo dir is always fixed, bug we need to know where is the css file.
      const getDemoHtmlCssSrc = () => {
        const cssDir =
          options.TARGET_CSS_DIR ||
          path.join(cb.defaultFolderName, cb.defaultCssFolderName);
        return `../../${cssDir}`;
      };
      cb.DEMO_HTML_CSS_SRC_DIR = getDemoHtmlCssSrc();

      return cb;
    };
    const getFolderHash = (folderPath) => {
      const files = fs.readdirSync(folderPath);
      const fileHashes = [];
      files.forEach((file) => {
        const filePath = `${folderPath}/${file}`;
        if (fs.statSync(filePath).isDirectory()) {
          const folderHash = getFolderHash(filePath);
          fileHashes.push(folderHash);
        } else {
          const fileContent = fs.readFileSync(filePath);
          const fileHash = new SHA1().hex(JSON.stringify(fileContent));
          fileHashes.push(fileHash);
        }
      });

      return new SHA1().hex(fileHashes.join());
    };

    // Check files has change, Stop process when they are same..
    const checkHashAndFile = () => {
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
      const fontsHash = getFolderHash(ICON_WITHOUT_COLOR_DIR);
      const svgsHash = getFolderHash(ICON_WITH_COLOR_DIR);
      const currentHash = new SHA1().hex(JSON.stringify(fontsHash + svgsHash));
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
        console.log("=== Same hash and files, process is stopping. ===");
        return Promise.reject(new Error("Same hash and files, process stoped"));
      } else {
        console.log(
          "=== Files has change or not exist. Writing svg-hash.md file. ==="
        );
        fse.removeSync(DEFAULT_DIR);
        fs.mkdirSync(DEFAULT_DIR, { recursive: true });
        fs.writeFileSync(hashFile, currentHash);
        fs.mkdirSync(path.join(DEFAULT_DIR, defaultFontsFolerName), {
          recursive: true,
        });
        fs.mkdirSync(path.join(TARGET_CSS_DIR), { recursive: true });
        return Promise.resolve();
      }
    };

    const mapGlyphs = (glyph) => {
      return {
        fileName: glyph.name,
        codePoint: glyph.unicode[0].charCodeAt(0).toString(16).toUpperCase(),
      };
    };

    // generate fonts and css for using fonts by classname
    const createFontsAndCss = () => {
      const {
        DEFAULT_DIR,
        ICON_WITHOUT_COLOR_DIR,
        CSS_TEMPLATE_DIR,
        HTML_DEMO_TEMPLATE_DIR,
        DEMO_HTML_CSS_SRC_DIR,
        CSS_FONTS_SRC_DIR,
        TARGET_CSS_DIR,
        hashFile,
        fontName,
        cssFileName,
        cssClassName,
        fontsDemoFileName,
        defaultFontsFolerName,
        defaultDemoFolderName,
        demo,
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
          if (demo) {
            // generate fonts demo html
            console.log("generate fonts demo html");
            src(HTML_DEMO_TEMPLATE_DIR)
              .pipe(
                consolidate("lodash", {
                  glyphs,
                  cssDir: DEMO_HTML_CSS_SRC_DIR,
                  cssFileName: cssFileName,
                  fontName: fontName,
                  cssClass: cssClassName,
                })
              )
              .pipe(rename(fontsDemoFileName))
              .pipe(dest(path.join(DEFAULT_DIR, defaultDemoFolderName)));
          }
          // CSS templating, e.g.
          // console.log(glyphs, options);
          console.log("generate css");
          src(CSS_TEMPLATE_DIR)
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
    };

    // Generate Svg Sprite
    const createSvgSprite = () => {
      const {
        ICON_WITH_COLOR_DIR,
        DEFAULT_DIR,
        fontName,
        defaultSpriteFolderName,
        spriteFileName,
        defaultDemoFolderName,
        spriteDemoFileName,
        demo,
      } = modifiedOptions;
      const spriteOptions = {
        prefix: `.${fontName}-%s`,
        dimensions: true,
        sprite: path.join(defaultSpriteFolderName, spriteFileName),
        dest: "./",
        inline: true,
      };
      if (demo) {
        spriteOptions.example = {
          dest: path.join(defaultDemoFolderName, spriteDemoFileName),
        };
      }
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
                ...spriteOptions,
              },
            },
          })
        )
        .pipe(dest(DEFAULT_DIR));
    };

    const moveFiles = (srcDir, targetDir) => {
      const {
        DEFAULT_DIR,
        defaultDemoFolderName,
        fontsDemoFileName,
        cssFileName,
      } = modifiedOptions;
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fse.copySync(srcDir, targetDir);
      fse.removeSync(srcDir);
      if (cssFileName.split(".")[1] !== "css") {
        fse.removeSync(
          path.join(DEFAULT_DIR, defaultDemoFolderName, fontsDemoFileName)
        );
      }
    };

    // Move files to their target DIR.
    const moveFileToTarget = () => {
      const {
        DEFAULT_DIR,
        TARGET_FONTS_DIR,
        TARGET_SPRITE_DIR,
        defaultFontsFolerName,
        defaultSpriteFolderName,
      } = modifiedOptions;
      if (passedOptions.TARGET_FONTS_DIR) {
        moveFiles(
          path.join(DEFAULT_DIR, defaultFontsFolerName),
          TARGET_FONTS_DIR
        );
      }
      if (passedOptions.TARGET_SPRITE_DIR) {
        moveFiles(
          path.join(DEFAULT_DIR, defaultSpriteFolderName),
          TARGET_SPRITE_DIR
        );
      }
      return Promise.resolve();
    };

    // Minify the css size.
    const minifyCss = () => {
      const { TARGET_CSS_DIR, cssFileName } = modifiedOptions;
      return src(path.join(TARGET_CSS_DIR, cssFileName), { allowEmpty: true })
        .pipe(cleanCSS())
        .pipe(dest(TARGET_CSS_DIR));
    };

    // store parameters
    const passedOptions = { ...options };
    const modifiedOptions = modifyOptions(options);

    // process the jobs.
    series(
      checkHashAndFile,
      parallel(createFontsAndCss, createSvgSprite),
      minifyCss,
      moveFileToTarget,
      function () {
        resolve(true);
      }
    )((err, results) => {
      if (err) {
        console.error("err", err);
      } else {
        console.log("results", results);
      }
    });
  });
};
module.exports = generateFonts;
