document.addEventListener("DOMContentLoaded", () => {
  const aboutSection = document.querySelector(".about-page");
  aboutSection.style.opacity = 0;
  aboutSection.style.transition = "opacity 1.2s ease";

  setTimeout(() => {
    aboutSection.style.opacity = 1;
  }, 100);
});
