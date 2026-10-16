const markdownIt = require("markdown-it");
const texmath = require("markdown-it-texmath");
const katex = require("katex");
const anchor = require("markdown-it-anchor");
const fs = require("fs");
const path = require("path");
const { imageSize } = require("image-size");
const site = require("./src/_data/site.json");

// "1. Traverse the scene" -> "1-traverse-the-scene"
const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-");

// Give images in /blog an explicit width and height, so the page does not
// shift while they load. CSS keeps them responsive.
const imageSizes = (md) => {
  md.core.ruler.push("image-sizes", (state) => {
    for (const block of state.tokens) {
      for (const token of block.children || []) {
        const src = token.type === "image" && token.attrGet("src");
        if (!src || !src.startsWith("/blog/")) continue;
        const { width, height } = imageSize(fs.readFileSync(path.join("public", src)));
        token.attrSet("width", String(width));
        token.attrSet("height", String(height));
      }
    }
  });
};

// Colour brackets by nesting depth, like VS Code's bracket pair colorization.
const BRACKETS = {
  light: ["#0431FA", "#319331", "#7B3814"],
  dark: ["#FFD700", "#DA70D6", "#179FFF"],
};

const bracketColors = {
  name: "bracket-colors",
  tokens(lines) {
    const stack = [];
    return lines.map((line) =>
      line.flatMap((token) => {
        const scopes = (token.explanation || []).flatMap((e) => e.scopes.map((s) => s.scopeName));
        if (scopes.some((s) => /^(string|comment)/.test(s)) || !/[()[\]{}]/.test(token.content)) return [token];

        const pieces = [];
        let offset = token.offset;
        for (const part of token.content.split(/([()[\]{}])/).filter(Boolean)) {
          const piece = { ...token, content: part, offset };
          offset += part.length;
          if (/^[()[\]{}]$/.test(part)) {
            if ("([{".includes(part)) stack.push(part);
            const depth = Math.max(0, stack.length - 1) % 3;
            if (")]}".includes(part)) stack.pop();
            piece.htmlStyle = { "--shiki-light": BRACKETS.light[depth], "--shiki-dark": BRACKETS.dark[depth] };
          }
          pieces.push(piece);
        }
        return pieces;
      })
    );
  },
};

// A header bar at the top of each code block: the language, and an optional
// file name from the fence, e.g. ```python title="paint.py".
const LANGUAGES = { python: "Python", cpp: "C++", javascript: "JavaScript", js: "JavaScript" };

const codeHeader = {
  name: "code-header",
  pre(node) {
    const { lang, meta } = this.options;
    const title = /title="([^"]*)"/.exec(meta?.__raw ?? "")?.[1];
    const span = (cls, text) => ({
      type: "element",
      tagName: "span",
      properties: { class: cls },
      children: [{ type: "text", value: text }],
    });
    node.children.unshift({
      type: "element",
      tagName: "span",
      properties: { class: "code-head" },
      children: [span("code-lang", LANGUAGES[lang] ?? lang), ...(title ? [span("code-title", title)] : [])],
    });
  },
};

module.exports = async function (eleventyConfig) {
  const { default: shiki } = await import("@shikijs/markdown-it");

  eleventyConfig.addGlobalData("year", () => new Date().getFullYear());
  eleventyConfig.addPassthroughCopy("src/css");
  // Vite copies public/ to the site root untouched (robots.txt, favicon.ico, blog/ images).
  eleventyConfig.addPassthroughCopy("public");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2": "fonts/inter-latin-wght-normal.woff2",
    "node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2": "fonts/jetbrains-mono-latin-wght-normal.woff2",
    "node_modules/katex/dist/katex.min.css": "css/katex.min.css",
    "node_modules/katex/dist/fonts": "css/fonts",
  });

  // Atom feed of the published notes, with the full text of each.
  const { feedPlugin } = await import("@11ty/eleventy-plugin-rss");
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "notes", limit: 0 },
    metadata: {
      language: "en",
      title: site.title,
      subtitle: site.description,
      base: "https://jakobjk.github.io/",
      author: { name: "Jakob Kousholt" },
    },
  });

  // Vite bundles, minifies and hashes the built site.
  // The feed keeps a fixed address (/feed.xml), everything else gets a hash.
  const assetFileNames = (asset) =>
    (asset.names?.[0] ?? "").endsWith(".xml") ? "[name][extname]" : "assets/[name]-[hash][extname]";
  eleventyConfig.addPlugin((await import("@11ty/eleventy-plugin-vite")).default, {
    viteOptions: { build: { rolldownOptions: { output: { assetFileNames } } } },
  });

  eleventyConfig.on("eleventy.after", ({ dir }) => {
    const file = path.join(dir.output, "css", "katex.min.css");
    const css = fs.readFileSync(file, "utf8");
    fs.writeFileSync(file, css.replace(/@font-face\{/g, "@font-face{font-display:swap;"));
  });

  eleventyConfig.setLibrary(
    "md",
    markdownIt({ html: true })
      .use(await shiki({
        themes: { light: "light-plus", dark: "dark-plus" },
        defaultColor: false,
        langs: ["python", "cpp", "javascript"],
        includeExplanation: true,
        transformers: [bracketColors, codeHeader],
      }))
      .use(imageSizes)
      .use(anchor, { slugify, level: [2] })
      .use(texmath, { engine: katex, delimiters: "dollars" })
  );

  eleventyConfig.addCollection("notes", (api) =>
    api.getFilteredByGlob("src/notes/*.md").filter((p) => !p.data.draft || process.env.ELEVENTY_RUN_MODE === "serve").sort((a, b) => b.date - a.date)
  );

  // JSON for a <script type="application/json"> tag: "<" is escaped so "</script>" cannot end the tag.
  eleventyConfig.addFilter("jsonScript", (value) => JSON.stringify(value).replace(/</g, "\\u003c"));
  // Number each item by its position in the list (1, 2, 3, ...).
  eleventyConfig.addFilter("numbered", (list) => list.map((item, i) => ({ id: i + 1, ...item })));
  eleventyConfig.addFilter("isoDate", (d) => d.toISOString().slice(0, 10));

  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md"],
  };
};
