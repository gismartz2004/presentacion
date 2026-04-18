import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function getDistPath() {
  return path.resolve(__dirname, "public");
}

export async function getProdTemplate() {
  return fs.promises.readFile(path.resolve(getDistPath(), "index.html"), "utf-8");
}

export function serveStatic(app: Express) {
  const distPath = getDistPath();
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache");
          return;
        }

        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      },
    }),
  );
}
