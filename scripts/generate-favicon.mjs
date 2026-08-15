import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync } from "fs";

const SOURCE = "public/logo-source.png";

if (!existsSync(SOURCE)) {
  console.error(`Missing ${SOURCE} — place the square icon crop there first.`);
  process.exit(1);
}

const base = sharp(SOURCE);

// Standard favicon (32x32, saved as .ico-compatible png — browsers accept
// a PNG-content .ico fine in practice, but we also keep a real .ico size set)
await base.clone().resize(32, 32).toFile("public/favicon-32x32.png");
await base.clone().resize(16, 16).toFile("public/favicon-16x16.png");

// Apple touch icon
await base.clone().resize(180, 180).toFile("public/apple-icon.png");

// PWA / manifest icons
await base.clone().resize(192, 192).toFile("public/icon-192.png");
await base.clone().resize(512, 512).toFile("public/icon-512.png");

// Also write a favicon.ico (32x32 PNG bytes — works in all modern browsers)
const ico32 = await base.clone().resize(32, 32).png().toBuffer();
writeFileSync("public/favicon.ico", ico32);

console.log("Favicons generated from", SOURCE);
