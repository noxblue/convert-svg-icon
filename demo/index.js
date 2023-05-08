import "./assets/css/main.scss";
import "./assets/images/sprites/good_fonts_color_svgs_sprite.svg";
import { fontsClassList, symbolIdsList } from "./good_fonts/list.js";
import { renderFonts, renderSymbols } from "./libs/component.js";

renderFonts(fontsClassList, "#fonts");
renderSymbols(symbolIdsList, "#symbols");
