const portfolio = document.getElementById("portfolio");
const toggle = document.getElementById("portfolioToggle");

let isOpen = false;

toggle.addEventListener("click", () => {
  isOpen = !isOpen;

  portfolio.classList.toggle("open", isOpen);
  portfolio.classList.toggle("collapsed", !isOpen);

  toggle.textContent = isOpen
    ? "Hide portfolio ↑"
    : "A few of our projects ↓";
});