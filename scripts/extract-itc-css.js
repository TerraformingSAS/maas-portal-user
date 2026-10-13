const fs = require("fs");
const path = require("path");

const src = "node_modules/itc-frontend-base/dist/itc-frontend-base.css";
const dest = "public/vendor/itc-frontend-base.css";

if (!fs.existsSync(src)) {
  console.log("itc-frontend-base CSS not found, skipping extraction");
  process.exit(0);
}

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

// Extract: @layer components + everything after @layer utilities
const componentsLayer = layers.find((l) => l.name === "components");
const utilitiesLayer = layers.find((l) => l.name === "utilities");

if (!componentsLayer || !utilitiesLayer) {
  console.log("Could not find components/utilities layers, copying full CSS");
  fs.writeFileSync(dest, content);
  process.exit(0);
}

const itcCss = content.substring(componentsLayer.start, componentsLayer.end) +
  content.substring(utilitiesLayer.end);

fs.writeFileSync(dest, itcCss);
console.log(`Extracted itc component styles: ${itcCss.length} bytes (from ${content.length} bytes)`);
