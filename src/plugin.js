const generateFonts = require("./src/index.js");
// module.exports = () => {
//   return generateFonts;
// };

// 透過class建立webpack plugin，透過new方式建構並執行
module.exports = class GenerateFontsPlugin {
  // new的階段傳入options
  constructor(options) {
    this.options = options;
  }
  // apply執行階段，表達在compile前執行promise，要等執行完畢才可以開始compile
  // 同時將建構階段的options傳入執行的function中
  apply(compiler) {
    compiler.hooks.watchRun.tapPromise("generateFontsPlugin", async () => {
      await generateFonts(this.options);
    });
  }
};
