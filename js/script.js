document.addEventListener("DOMContentLoaded", function () {
  const texts = document.querySelectorAll(".fade-text");
  let index = 0;

  function showNextText() {
    texts.forEach((text, i) => {
      text.style.opacity = i === index ? 1 : 0;
    });
    index = (index + 1) % texts.length;
  }

  setInterval(showNextText, 5000);
  showNextText();
});
