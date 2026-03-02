const esbuild = require("esbuild");
const path = require("path");

const isWatch = process.argv.includes("--watch");

const baseConfig = {
  bundle: true,
  minify: true,
  platform: "browser",
  target: ["es2017"],
  outdir: path.join(__dirname, "dist"),
};

async function build() {
  const ctxCollect = await esbuild.context({
    ...baseConfig,
    entryPoints: [path.join(__dirname, "src/collect.ts")],
    outfile: path.join(__dirname, "dist/collect.js"),
    outdir: undefined,
    globalName: undefined,
  });

  const ctxWall = await esbuild.context({
    ...baseConfig,
    entryPoints: [path.join(__dirname, "src/wall.ts")],
    outfile: path.join(__dirname, "dist/wall.js"),
    outdir: undefined,
    globalName: undefined,
  });

  if (isWatch) {
    await ctxCollect.watch();
    await ctxWall.watch();
    console.log("Watching for changes...");
  } else {
    const result1 = await ctxCollect.rebuild();
    await ctxCollect.dispose();
    const result2 = await ctxWall.rebuild();
    await ctxWall.dispose();

    const fs = require("fs");
    const collectSize = fs.statSync(path.join(__dirname, "dist/collect.js")).size;
    const wallSize = fs.statSync(path.join(__dirname, "dist/wall.js")).size;
    console.log(`✅ collect.js: ${(collectSize / 1024).toFixed(1)}KB`);
    console.log(`✅ wall.js: ${(wallSize / 1024).toFixed(1)}KB`);
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
