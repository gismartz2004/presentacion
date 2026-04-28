import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function getDistPath() {
  return path.resolve(__dirname, "public");
}

export async function getProdTemplate() {
  const template = await fs.promises.readFile(path.resolve(getDistPath(), "index.html"), "utf-8");
  return deferRenderBlockingStyles(template);
}

const CRITICAL_CSS = `<style id="critical-css">
html{font-size:16.5px;scroll-behavior:smooth}body{margin:0;background:#fdf8ff;color:#4a3362;font-family:Montserrat,Arial,sans-serif;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased}*{box-sizing:border-box}#root{padding:0}.relative{position:relative}.absolute{position:absolute}.fixed{position:fixed}.inset-0{inset:0}.z-10{z-index:10}.z-50{z-index:50}.flex{display:flex}.hidden{display:none}.h-full{height:100%}.w-full{width:100%}.min-h-screen{min-height:100vh}.items-center{align-items:center}.items-end{align-items:flex-end}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.overflow-hidden{overflow:hidden}.bg-white{background:#fff}.text-white{color:#fff}.object-cover{object-fit:cover}.object-center{object-position:center}.rounded-full{border-radius:9999px}nav{position:fixed;top:0;z-index:50;width:100%;border-bottom:1px solid rgba(90,63,115,.1);background:#fff;padding:1.5rem 0;box-shadow:0 10px 30px rgba(0,0,0,.03)}main{min-height:100vh;background:#fdf8ff}main>section:first-of-type{position:relative;padding-top:6rem}main>section:first-of-type>section{position:relative;overflow:hidden;background:#111}main>section:first-of-type>section>div{position:relative;height:72vh;min-height:560px}main>section:first-of-type img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;filter:brightness(.86)}@media (min-width:1024px){nav{padding:1.75rem 0}main>section:first-of-type{padding-top:7rem}}@media (min-width:768px){main>section:first-of-type>section>div{height:82vh}}
</style>`;

function deferRenderBlockingStyles(template: string) {
  const cssLinks: string[] = [];
  const deferredTemplate = template.replace(
    /<link rel="stylesheet"([^>]*?)href="([^"]+\.css)"([^>]*)>/g,
    (_match, before, href, after) => {
      cssLinks.push(`<noscript><link rel="stylesheet"${before}href="${href}"${after}></noscript>`);
      return `<link rel="preload"${before}href="${href}"${after} as="style" onload="this.onload=null;this.rel='stylesheet'">`;
    },
  );

  return deferredTemplate.replace("<!--app-head-->", `${CRITICAL_CSS}<!--app-head-->${cssLinks.join("")}`);
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
      index: false,
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
