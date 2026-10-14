const fs = require("fs");
const path = require("path");

const src = "node_modules/itc-frontend-base/dist/itc-frontend-base.css";
const dest = "src/styles/vendor/itc-frontend-base.css";

if (!fs.existsSync(src)) {
  console.log("itc-frontend-base CSS not found, skipping extraction");
  process.exit(0);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });

const content = fs.readFileSync(src, "utf8");

// Find @layer positions
const layerPattern = /@layer\s+(\w+)\s*\{/g;
const layers = [];
let match;
while ((match = layerPattern.exec(content)) !== null) {
  layers.push({ name: match[1], start: match.index, braceStart: match.index + match[0].length });
}

// Find end of each layer by tracking brace depth
for (const layer of layers) {
  let depth = 1;
  let pos = layer.braceStart;
  while (depth > 0 && pos < content.length) {
    if (content[pos] === "{") depth++;
    else if (content[pos] === "}") depth--;
    pos++;
  }
  layer.end = pos;
}

// Keep component rules as plain CSS. Do not wrap them in @layer and do not
// include the library's Tailwind theme, base, or utilities — those override
// the host app when the file is processed by Tailwind in production.
const componentsLayer = layers.find((l) => l.name === "components");
const utilitiesLayer = layers.find((l) => l.name === "utilities");

if (!componentsLayer || !utilitiesLayer) {
  console.log("Could not find components/utilities layers, copying full CSS");
  fs.writeFileSync(dest, cleanup(content));
  process.exit(0);
}

const componentsBody = content.substring(componentsLayer.braceStart, componentsLayer.end - 1);
const afterUtilities = content.substring(utilitiesLayer.end);
const itcCss = cleanup(componentsBody + afterUtilities);

fs.writeFileSync(dest, itcCss);
console.log(`Extracted itc component styles: ${itcCss.length} bytes (from ${content.length} bytes)`);

function cleanup(css) {
  return stripTwProperties(css).replace(/\/\*\$vite\$:\d+\*\//g, "").trim() + "\n";
}

// Unlayered @property --tw-* rules from the library build override the host
// Tailwind custom properties. The app already emits these.
function stripTwProperties(css) {
  const re = /@property\s+--tw-[\w-]+\s*\{/g;
  let result = "";
  let last = 0;
  let propertyMatch;
  while ((propertyMatch = re.exec(css)) !== null) {
    result += css.slice(last, propertyMatch.index);
    let depth = 1;
    let pos = propertyMatch.index + propertyMatch[0].length;
    while (depth > 0 && pos < css.length) {
      if (css[pos] === "{") depth++;
      else if (css[pos] === "}") depth--;
      pos++;
    }
    last = pos;
    re.lastIndex = pos;
  }
  result += css.slice(last);
  return result;
}
