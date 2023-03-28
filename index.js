const { generateFonts } = require("./gulpfile.js");
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
generateFonts({
  // PREFIX: "g_fonts",
  // ASSETS_DIR: "assets",
  // TARGET_CSS_DIR: "src/css/font",
  // TARGET_FONTS_DIR: "src/assets/fonts",
  // TARGET_SPRITE_DIR: "src/images/sprites",
})
  .then((res) => {
    console.log("res", res);
  });
