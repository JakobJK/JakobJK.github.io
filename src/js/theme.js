// Light/dark toggle. Follows the system until the first click, then remembers.
const STORAGE_KEY = "theme";

const systemTheme = () => (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

export function initTheme() {
  const button = document.querySelector(".theme-toggle");
  if (!button) return;
  button.hidden = false;

  button.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme ?? systemTheme();
    const next = current === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  });
}
