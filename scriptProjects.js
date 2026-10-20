// Projects page: reveal cards while scrolling, tilt cards toward the cursor and move the glow with it
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".projects-grid");
  if (!grid) return;

  const cards = grid.querySelectorAll(".project-card");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    grid.classList.add("reveal-ready");
    let firstBatch = true;

    const observer = new IntersectionObserver((entries) => {
      // Cards appearing together come in one after another; the first ones wait for the heading
      const baseDelay = firstBatch ? 0.4 : 0;
      firstBatch = false;
      let order = 0;

      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const delay = baseDelay + order * 0.12;
        order++;

        card.style.setProperty("--reveal-delay", `${delay}s`);
        card.classList.add("is-visible");
        observer.unobserve(card);

        // Remove the delay afterwards so hover effects respond instantly
        setTimeout(() => card.style.removeProperty("--reveal-delay"), (delay + 1) * 1000);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    cards.forEach((card) => observer.observe(card));
  }

  // Glow and tilt follow the mouse (only on devices that can hover)
  if (window.matchMedia("(hover: hover)").matches) {
    cards.forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mx", `${x}px`);
        card.style.setProperty("--my", `${y}px`);

        if (reduceMotion) return;
        const maxTilt = rect.width > 700 ? 2 : 5; // the wide featured card tilts less
        card.style.setProperty("--rx", `${(0.5 - y / rect.height) * 2 * maxTilt}deg`);
        card.style.setProperty("--ry", `${(x / rect.width - 0.5) * 2 * maxTilt}deg`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }
});
