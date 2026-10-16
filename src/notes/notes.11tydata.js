module.exports = {
  eleventyComputed: {
    // Drafts are built only by the dev server (npm start).
    permalink: (data) =>
      data.draft && process.env.ELEVENTY_RUN_MODE !== "serve" ? false : `/notes/${data.page.fileSlug}/`,
  },
};
