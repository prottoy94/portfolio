// Qualification page: reveal cards while scrolling and move the card spotlight with the cursor
document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector(".qualifications-list");
  if (!list) return;

  const items = list.querySelectorAll(".q-item");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !reduceMotion) {
    list.classList.add("reveal-ready");
    let firstBatch = true;

    const observer = new IntersectionObserver((entries) => {
      // Cards appearing together come in one after another; the first ones wait for the heading
      const baseDelay = firstBatch ? 0.5 : 0;
      firstBatch = false;
      let order = 0;

      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = entry.target;
        const delay = baseDelay + order * 0.15;
        order++;

        item.style.setProperty("--reveal-delay", `${delay}s`);
        item.classList.add("is-visible");
        observer.unobserve(item);

        // Remove the delay afterwards so hover effects respond instantly
        setTimeout(() => item.style.removeProperty("--reveal-delay"), (delay + 1) * 1000);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    items.forEach((item) => observer.observe(item));
  }

  // Spotlight follows the mouse (only on devices that can hover)
  if (window.matchMedia("(hover: hover)").matches) {
    items.forEach((item) => {
      item.addEventListener("pointermove", (e) => {
        const rect = item.getBoundingClientRect();
        item.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        item.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    });
  }
});
