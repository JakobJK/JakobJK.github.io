# JakobJK

Personal blog of notes, information first. Eleventy 3 with Nunjucks layouts, markdown content, KaTeX for math.

## Layout

- `src/notes/*.md`: the notes. Frontmatter: `layout: post.njk`, `title`, `date`, `excerpt`, `tags`, `draft`. Drafts are hidden from the site.
- `src/_includes/`: `base.njk` (shell), `post.njk` (note layout).
- `src/index.njk`: home page, a plain list of notes.
- `src/blog/`: images, served at `/blog/...`.
- `src/css/style.css`: all styling. Math uses `$...$` and `$$...$$`.
- `eleventy.config.js`: restart `npm start` after changing it. The dev server does not reliably pick up config changes.

## Design

Minimal and information first. Neutral greys, one muted blue accent, Inter for text, a mono font only for small labels and code. No cards, gradients, glows, decorative prefixes or filler taglines. When adding UI, prefer less.

## Writing

Based on the author's own rules (`src/notes/how_i_write.md`) and Zinsser's *On Writing Well*. Apply to notes, excerpts and any site copy.

- Simplicity. Short words, short sentences, plain structure. Cut every word that does no work.
- Write in the first person. Use "I".
- Know the reader before writing. Decide how much context they need, and give exactly that.
- Be precise and direct. Say the specific thing, with the number, name or example.
- Open with the point. Don't announce what the note will cover.
- Prefer strong verbs and the active voice. Drop adverbs and qualifiers such as "very", "quite" and "really", and don't hedge.
- One idea per note and per paragraph. Keep to it and cut the digressions.
- Explain how it works, and show what I learned. Don't pad with background the reader already has.
- No filler, hype or inspirational tone. Excerpts are one plain sentence.
- End when the point is made. No summary paragraph that repeats the note.
