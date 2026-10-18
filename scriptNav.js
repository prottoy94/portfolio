// Mobile menu: adds a toggle button to the navbar (shown only on small screens by the CSS)
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const menu = navbar && navbar.querySelector("ul");
  if (!menu) return;

  if (!menu.id) menu.id = "nav-menu";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "menu-toggle";
  toggle.setAttribute("aria-controls", menu.id);
  toggle.innerHTML = "<span></span><span></span><span></span>";
  navbar.appendChild(toggle);
  navbar.classList.add("has-toggle");

  const setOpen = (open) => {
    navbar.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  setOpen(false);

  toggle.addEventListener("click", () => setOpen(!navbar.classList.contains("menu-open")));

  // Close after choosing a link, tapping outside the navbar, or pressing Escape
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("pointerdown", (e) => {
    if (!navbar.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // Reset when the screen grows back to desktop size
  const desktop = window.matchMedia("(min-width: 901px)");
  const onResize = () => { if (desktop.matches) setOpen(false); };
  if (desktop.addEventListener) desktop.addEventListener("change", onResize);
  else desktop.addListener(onResize);
});
