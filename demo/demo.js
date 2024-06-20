const generateFonts = require("../src/index.js");
const cssOptions = {
  PREFIX: "good_fonts",
  ICON_WITHOUT_COLOR_DIR: "demo/assets/icons/fonts",
  ICON_WITH_COLOR_DIR: "demo/assets/icons/symbols",
  TARGET_CSS_DIR: "demo/assets/css",
  TARGET_FONTS_DIR: "demo/assets/fonts",
  TARGET_SPRITE_DIR: "demo/assets/images/sprites",
  FONT_NAME: "good_fonts",
  CSS_CLASS_NAME: "good_icon",
  CSS_TEMPLATE_NAME: "_icons.scss",
  CSS_FILE_NAME: "good_fonts.scss",
  DEFAULT_FOLDER_NAME: "demo/good_fonts",
  demo: true,
};
// const scssOptions = {
//   PREFIX: "good_fonts",
//   ICON_WITHOUT_COLOR_DIR: "assets/icons/fonts",
//   ICON_WITH_COLOR_DIR: "assets/icons/symbols",
//   TARGET_CSS_DIR: "assets/css/font",
//   TARGET_FONTS_DIR: "assets/fonts",
//   TARGET_SPRITE_DIR: "assets/images/sprites",
//   FONT_NAME: "good_fonts",
//   CSS_CLASS_NAME: "good_icon",
//   CSS_TEMPLATE_NAME: "_icons.scss",
//   CSS_FILE_NAME: "good_icon.scss",
//   DEFAULT_FOLDER_NAME: "demo/good_fonts",
//   demo: true,
// };
generateFonts({ ...cssOptions })
  .then((res) => {
    console.log("res", res);
  })
  .catch((err) => {
    console.error("err", err);
  });
