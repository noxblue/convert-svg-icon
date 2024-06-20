# convert-svg-icon

This project mainly addresses SVG icons by converting them into font files and sprites for frontend development. Using the tools provided in this project, single-color icons can be converted into font files along with their corresponding CSS files, and multi-color icons can be converted into sprites. This allows users to import the generated files into their projects and access icons through class names.

## Usage

### General Conversion

Import `convert-svg-icon` into your project file and set up the conversion settings by creating an instance:

```javascript
// convert-icon.js
const convertFonts = require("convert-svg-icon");
const cssOptions = {
  // options
};
convertFonts({ ...cssOptions })
  .then((res) => {
    console.log("res", res);
  })
  .catch((err) => {
    console.error("err", err);
  });
```

Call the execution in the scripts section of `package.json` or combine it with the current build process:

```json
scripts:{
  "convert-icon": "node convert-icon.js", // 呼叫執行
  "serve": "yarn convert-icon && yarn webpack serve", // 與現行開發流程組合
  "build": "yarn convert-icon && yarn webpack build", // 與現行建置流程組合
}
```

### Using as a Webpack Plugin

Import the `plugin` into `webpack.config.js`, instantiate it and pass in the options:

```javascript
const convertFontsPlugin = require("convert-svg-icon/plugin");

const config = {
  // ...webpackconfigs
  plugins:[
    // ...other plugins
    new convertFontsPlugin(options)
    // ...other plugins
  ],
  // ...webpackconfigs
}
```

## Parameter Description

### options

- Type: `Object`
- Description: Configure the source of SVG files, the destination for converted files, and the class names used for calling.
- Structure:
  - `PREFIX: "good_fonts",`: Required, affects file names and default settings
  - `ICON_WITHOUT_COLOR_DIR`: "demo/assets/icons/fonts",`: Required, source folder for SVG files to be converted into fonts
  - `ICON_WITH_COLOR_DIR: "demo/assets/icons/symbols",`: Required, source folder for SVG files to be converted into sprites
  - `TARGET_CSS_DIR: "demo/assets/css",`: Required, target folder for the final CSS configuration files
  - `TARGET_FONTS_DIR: "demo/assets/fonts",`: Required, target folder for the final font files
  - `TARGET_SPRITE_DIR: "demo/assets/images/sprites",`: Required, target folder for the final sprite SVG files
  - `FONT_NAME: "good_fonts",`: Optional, affects the file name, default value is `${PREFIX}_icons`, it is recommended to be the same as `PREFIX`
  - `CSS_CLASS_NAME: "good_icon",`: Required, affects the class name, default value is `${PREFIX}_icons`
  - `CSS_TEMPLATE_DIR: "src/css_template",`: Optional, if you need to provide a custom CSS template file, set the path here
  - `CSS_TEMPLATE_NAME: "_icons.scss",`: Optional, affects the generated CSS or SCSS, default value is `_icons.css`, setting it to _icons.scss will generate SCSS, if `CSS_TEMPLATE_DIR` is set, provide the complete template file name here
  - `CSS_FILE_NAME: "good_fonts.scss",`: Optional, affects the generated CSS file name, default value is `${PREFIX}${CSS_TEMPLATE_NAME}`, if generating SCSS, ensure the extension matches
  - `DEFAULT_FOLDER_NAME: "demo/good_fonts",`:  Optional, affects the target folder for related files such as demo files, hash files, default value is `g_fonts`
  - `demo: true,`: Optional, whether to generate demo files, default value is `false`

---

# convert-svg-icon

此專案主要解決svg的icon，在前端開發時常將其分別改以字體檔案及精靈圖方式載入，透過此專案的工具可將單一顏色icon轉換為字體檔案及其相依的css檔、彩色icon轉換為精靈圖，讓使用者在生成後導入專案及可以透過classname進行icon取用。

## 使用方法

### 一般呼叫轉換

將 `convert-svg-icon` 引入專案檔案，並透過建立實例行為進行轉換設定:

```javascript
// convert-icon.js
const convertFonts = require("convert-svg-icon");
const cssOptions = {
  // options
};
convertFonts({ ...cssOptions })
  .then((res) => {
    console.log("res", res);
  })
  .catch((err) => {
    console.error("err", err);
  });
```

在`package.json`的`scripts`中呼叫執行，或是與現行建置流程組合:

呼叫執行：
```json
scripts:{
  "convert-icon": "node convert-icon.js", // 呼叫執行
  "serve": "yarn convert-icon && yarn webpack serve", // 與現行開發流程組合
  "build": "yarn convert-icon && yarn webpack build", // 與現行建置流程組合
}
```

### 作為`webpack plugin`使用

將`plugin`導入`webpack.config.js`，並且在plugin進行實例化傳入options:

```javascript
const convertFontsPlugin = require("convert-svg-icon/plugin");

const config = {
  // ...webpackconfigs
  plugins:[
    // ...other plugins
    new convertFontsPlugin(options)
    // ...other plugins
  ],
  // ...webpackconfigs
}
```

## 參數說明

### `options`

- 類型: `Object`
- 說明: 設定svg檔案來源，轉換後相對應檔案放置區塊，及呼叫使用的class名稱。
- 結構:
  - `PREFIX: "good_fonts",`: 必填，影響檔案名稱及相關設定預設值
  - `ICON_WITHOUT_COLOR_DIR`: "demo/assets/icons/fonts",`: 必填，轉換為字型的svg檔案來源資料夾
  - `ICON_WITH_COLOR_DIR: "demo/assets/icons/symbols",`: 必填，轉換為精靈圖的svg檔案來源資料夾
  - `TARGET_CSS_DIR: "demo/assets/css",`: 必填，最終放置css設定檔的目標資料夾
  - `TARGET_FONTS_DIR: "demo/assets/fonts",`: 必填，最終放置字型檔案的目標資料夾
  - `TARGET_SPRITE_DIR: "demo/assets/images/sprites",`: 必填，最終放置精靈圖svg檔案的目標資料夾
  - `FONT_NAME: "good_fonts",`: 可選，影響檔案名稱，預設值為`${PREFIX}_icons`，建議與PREFIX相同
  - `CSS_CLASS_NAME: "good_icon",`: 必填，影響class名稱，預設值為`${PREFIX}_icons`
  - `CSS_TEMPLATE_DIR: "src/css_template",`: 可選，有需要自行提供css的template檔案可於此處設定路徑
  - `CSS_TEMPLATE_NAME: "_icons.scss",`: 可選，影響生成css或scss，預設值為：`_icons.css`，可設定`_icons.scss`即生成為scss，或是有設定`CSS_TEMPLATE_DIR`者，請於此處設定你提供的template完整檔案名稱
  - `CSS_FILE_NAME: "good_fonts.scss",`: 可選，影響生成的css檔案名稱，預設值為`${PRIFIX}${CSS_TEMPLATE_NAME}`，請注意上方生成設定為scss者，此處副檔名必須相同
  - `DEFAULT_FOLDER_NAME: "demo/good_fonts",`: 可選，影響相關檔案生成目標資料夾，如demo檔案、hash檔案，預設值為`g_fonts`
  - `demo: true,`: 可選，是否生成demo檔案，預設值為`false`
