// "On this page" rail: one chapter per h2, filled as you read.
export function initRail() {
  const rail = document.querySelector(".rail-nav");
  const prose = document.querySelector(".prose");
  const heads = [...document.querySelectorAll(".prose h2[id]")];
  if (!rail || heads.length <= 1) return;

  const title = document.createElement("p");
  title.className = "rail-head";
  title.textContent = "Index";

  const list = document.createElement("ol");
  const items = heads.map((h) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#" + h.id;
    a.textContent = h.textContent.replace(/^\s*\d+\.\s*/, "");
    li.appendChild(a);
    list.appendChild(li);
    return li;
  });
  rail.append(title, list);
  rail.hidden = false;

  const clamp = (n) => Math.min(1, Math.max(0, n));
  let ticking = false;

  function update() {
    ticking = false;
    // The reading line follows scroll progress: top of the viewport at the
    // top of the page, bottom of the viewport at the end of the page.
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? clamp(window.scrollY / max) : 1;
    const line = window.innerHeight * progress;
    const end = prose.getBoundingClientRect().bottom;

    heads.forEach((h, i) => {
      const top = h.getBoundingClientRect().top;
      const next = i + 1 < heads.length ? heads[i + 1].getBoundingClientRect().top : end;
      const fill = clamp((line - top) / Math.max(1, next - top));
      items[i].style.setProperty("--fill", fill);
      items[i].dataset.state = fill >= 1 ? "read" : fill > 0 ? "here" : "next";
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}
