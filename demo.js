const generateFonts = require("./src/index.js");
// process.on("uncaughtException", function () {
//   console.log("Caught exception");
// });
// try {
//   generateFonts({ heo: "hihihihihi", helo: "hola" });
// } catch (err) {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log("Generate Complete!");
//   }
// }
// generateFonts((err) => {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log("Generate Complete!");
//   }
// });
const cssOptions = {
  PREFIX: "good_fonts",
  ICON_WITHOUT_COLOR_DIR: "assets/icons/pure",
  ICON_WITH_COLOR_DIR: "assets/icons/color",
  TARGET_CSS_DIR: "assets/css/font",
  TARGET_FONTS_DIR: "assets/assets/fonts",
  TARGET_SPRITE_DIR: "assets/images/sprites",
  FONT_NAME: "good_fonts",
  CSS_CLASS_NAME: "good_icon",
  CSS_FILE_NAME: "good_icon.css",
  demo: true,
};
const scssOptions = {
  PREFIX: "good_fonts",
  ICON_WITHOUT_COLOR_DIR: "assets/icons/pure",
  ICON_WITH_COLOR_DIR: "assets/icons/color",
  TARGET_CSS_DIR: "assets/css/font",
  TARGET_FONTS_DIR: "assets/assets/fonts",
  TARGET_SPRITE_DIR: "assets/images/sprites",
  FONT_NAME: "good_fonts",
  CSS_CLASS_NAME: "good_icon",
  CSS_TEMPLATE_NAME: "_icons.scss",
  CSS_FILE_NAME: "good_icon.scss",
  DEFAULT_FOLDER_NAME: "G_G_Fonts",
};
generateFonts({ ...cssOptions })
  .then((res) => {
    console.log("res", res);
  })
  .catch((err) => {
    console.error("err", err);
  });
