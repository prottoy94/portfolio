document.addEventListener("DOMContentLoaded", () => {
  const aboutSection = document.querySelector(".about-page");
  aboutSection.style.opacity = 0;
  aboutSection.style.transition = "opacity 1.2s ease";

  setTimeout(() => {
    aboutSection.style.opacity = 1;
  }, 100);
});

// Research cards slide in while scrolling; the about card's glow follows the cursor
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const research = document.querySelector(".research-section");

  if (research && "IntersectionObserver" in window && !reduceMotion) {
    const items = research.querySelectorAll(":scope > h2, :scope > article");
    research.classList.add("reveal-ready");

    const observer = new IntersectionObserver((entries) => {
      let order = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = entry.target;
        const delay = order * 0.15;
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

  const card = document.querySelector(".about-text");
  if (card && window.matchMedia("(hover: hover)").matches) {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  }
});
