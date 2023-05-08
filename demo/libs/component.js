export const renderFonts = (classNameList, renderTarget) => {
  if (!classNameList || !renderTarget) return;
  const fontGroup = document.createElement("div");
  fontGroup.classList.add("icon-font__gruop-wrap");
  classNameList.forEach((classname) => {
    const iconWrap = document.createElement("div");
    iconWrap.classList.add("icon-font__wrap");
    const icon = document.createElement("span");
    icon.classList.add(classname, "icon-font__icon");
    const iconName = document.createElement("p");
    iconName.classList.add("icon-font__name");
    iconName.innerHTML = `icon-name : ${classname}`;
    iconWrap.appendChild(icon);
    iconWrap.appendChild(iconName);
    fontGroup.appendChild(iconWrap);
  });
  const fonts = document.querySelector(renderTarget);
  fonts.appendChild(fontGroup);
};
export const renderSymbols = (symbolIdList, renderTarget) => {
  if (!symbolIdList || !renderTarget) return;
  const symbolsGroup = document.createElement("div");
  symbolsGroup.classList.add("icon-symbol__group-wrap");
  symbolIdList.forEach((symbolId) => {
    const symbolWrap = document.createElement("div");
    symbolWrap.classList.add("icon-symbol__wrap");
    const symbol = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    symbol.classList.add("icon-symbol__icon");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "xlink:href",
      `#${symbolId}`
    );
    const symbolIDEl = document.createElement("p");
    symbolIDEl.classList.add("icon-symbol__id");
    symbolIDEl.innerHTML = `symbol-id : ${symbolId}`;
    symbol.appendChild(use);
    symbolWrap.appendChild(symbol);
    symbolWrap.appendChild(symbolIDEl);
    symbolsGroup.appendChild(symbolWrap);
  });
  const symbols = document.querySelector(renderTarget);
  symbols.appendChild(symbolsGroup);
};
