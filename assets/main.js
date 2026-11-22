(function () {
  var WA = "212786278943";
  var header = document.querySelector("header.site");
  window.addEventListener("scroll", function () {
    header.classList.toggle("scrolled", window.scrollY > 40);
  });

  // Mobile menu
  var burger = document.querySelector(".burger");
  var menu = document.querySelector(".menu");
  burger.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { menu.classList.remove("open"); });
  });

  // Tour filters
  var chips = document.querySelectorAll(".chip");
  var cards = document.querySelectorAll(".card[data-cat]");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      chips.forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); });
      c.classList.add("on"); c.setAttribute("aria-pressed", "true");
      var f = c.dataset.filter;
      cards.forEach(function (card) {
        card.classList.toggle("hide", f !== "all" && card.dataset.cat.indexOf(f) === -1);
      });
    });
  });

  // Group calculator (30% off from 16 travellers)
  var range = document.getElementById("pax");
  if (range) {
    var paxOut = document.getElementById("paxOut");
    var discOut = document.getElementById("discOut");
    var upd = function () {
      paxOut.textContent = range.value;
      discOut.textContent = range.value >= 16 ? "-30%" : (16 - range.value) + " " + discOut.dataset.more;
    };
    range.addEventListener("input", upd); upd();
  }

  // Forms -> WhatsApp message (no server needed on GitHub Pages)
  document.querySelectorAll("form[data-wa]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var lines = [];
      new FormData(form).forEach(function (v, k) { if (v) lines.push(k + ": " + v); });
      var msg = form.dataset.intro + "\n" + lines.join("\n");
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });
  });

  // Reveal on scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
})();
