#!/usr/bin/env node

const esbuild = require("esbuild");

async function watch() {
  let ctx = await esbuild.context({
    entryPoints: ["src/main.ts"],
    bundle: true,
    outdir: "docs",
    loader: {
      ".png": "file",
      ".wav": "file",
    },
  });
  await ctx.watch();
  console.log("Watching..");
}
watch();
