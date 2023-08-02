#!/usr/bin/env node

const puppeteer = require("puppeteer"); // v 1.1.0
const { URL } = require("url");
const fse = require("fs-extra"); // v 5.0.0
const path = require("path");

// based on https://fettblog.eu/scraping-with-puppeteer/
async function start(urlsToFetch) {
  /* 1 */
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  /* 2 */
  page.on("response", async (response) => {
    const url = new URL(response.url());
    let filePath = path.resolve(`./static${url.pathname}`);
    if (path.extname(url.pathname).trim() === "") {
      filePath = `${filePath}/index.html`;
    }
    await fse.outputFile(filePath, await response.buffer());
  });

  /* 3 */
  await Promise.allSettled(
    urlsToFetch.map((url) =>
      page.goto(url, {
        waitUntil: "networkidle0",
      })
    )
  );
  browser.close();
}

const args = process.argv.slice(2);
start(args);
