const { generateFonts } = require("./gulpfile.js");
// process.on("uncaughtException", function () {
//   console.log("Caught exception");
// });
// try {
//   generateFonts();
// } catch (err) {
//   if (err) {
//     console.error(err);
//   } else {
//     console.log("Generate Complete!");
//   }
// }
generateFonts((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Generate Complete!");
  }
});
