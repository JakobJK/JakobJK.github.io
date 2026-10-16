// Quote in the banner: a random approved quote on each load, arrows to flick through,
// and ?qid=<id> in the URL so a link opens that quote.
const DATA_ID = "quotes-data";
const PARAM = "qid";
const EM_DASH = "\u2014";

export function initQuotes() {
  const figure = document.querySelector(".about");
  if (!figure) return;

  try {
    const quotes = JSON.parse(document.getElementById(DATA_ID)?.textContent ?? "[]");
    if (!quotes.length) return;

    const text = figure.querySelector("blockquote");
    const credit = figure.querySelector(".credit");
    const nav = figure.querySelector(".quote-nav");
    const count = figure.querySelector(".quote-count");
    count.style.minWidth = `${String(quotes.length).length * 2 + 1}ch`;

    const requested = new URL(location.href).searchParams.get(PARAM);
    const found = quotes.findIndex((quote) => String(quote.id) === requested);
    let index = found >= 0 ? found : Math.floor(Math.random() * quotes.length);

    const show = () => {
      const quote = quotes[index];
      text.textContent = quote.text;
      credit.textContent = `${EM_DASH} ${quote.attribution}`;
      if (quote.note) {
        const note = document.createElement("span");
        note.className = "note";
        note.textContent = `(${quote.note})`;
        credit.append(" ", note);
      }
      count.textContent = `${index + 1}/${quotes.length}`;
      try {
        const url = new URL(location.href);
        url.searchParams.set(PARAM, quote.id);
        history.replaceState(null, "", url);
      } catch {}
      // Restart the fade-in.
      figure.classList.remove("swap");
      void figure.offsetWidth;
      figure.classList.add("swap");
    };
    const step = (by) => {
      index = (index + by + quotes.length) % quotes.length;
      show();
    };

    show();
    nav.hidden = quotes.length < 2;
    figure.querySelector(".quote-prev").addEventListener("click", () => step(-1));
    figure.querySelector(".quote-next").addEventListener("click", () => step(1));
  } finally {
    figure.removeAttribute("data-pending");
  }
}
