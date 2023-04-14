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
    // 當build編譯前轉換成font與sprite
    compiler.hooks.beforeRun.tapPromise("GenerateFontsPlugin", () =>
      generateFonts(this.options)
    );
    // 當serve時，實際上webpack為watch模式並未正式執行編譯流程，
    // 將會導致未觸發beforeRun，此時改使用watchRun階段執行
    compiler.hooks.watchRun.tapPromise("GenerateFontsPlugin", () =>
      generateFonts(this.options)
    );

    // compiler.hooks.emit.tapPromise("GenerateFontsPlugin", () =>
    //   generateFonts(this.options)
    // );
    // compiler.hooks.thisCompilation.tap("GenerateFontsPlugin", compilation => {
    //   compilation.hooks.additionalAssets.tapPromise("GenerateFontsPlugin", () =>
    //     generateFonts(this.options)
    //   );
    // });
  }
};
