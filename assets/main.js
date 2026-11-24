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

/* Favorites Morocco Tours — premium header (fh-) */
(function () {
  var h = document.getElementById('fh');
  if (!h) return;
  var nav = document.getElementById('fh-nav');
  var burger = h.querySelector('.fh-burger');
  var overlay = h.querySelector('.fh-overlay');
  var openLabel = burger.getAttribute('aria-label');
  var closeLabel = burger.getAttribute('data-close') || openLabel;

  function onScroll() { h.classList.toggle('is-scrolled', window.scrollY > 30); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    overlay.classList.toggle('is-open', open);
    document.body.classList.toggle('fh-lock', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? closeLabel : openLabel);
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  overlay.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1100) setMenu(false); });

  h.querySelectorAll('.fh-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var li = btn.parentElement;
      var open = !li.classList.contains('is-open');
      li.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      var f = a.getAttribute('data-filter');
      if (f) {
        var b = document.querySelector('#tours [data-filter="' + f + '"]');
        if (b) b.click();
      }
      if ((a.getAttribute('href') || '').charAt(0) === '#') setMenu(false);
    });
  });

  var links = Array.prototype.slice.call(h.querySelectorAll('.fh-menu > li > .fh-link[href^="#"]'));
  if ('IntersectionObserver' in window && links.length) {
    var map = {};
    links.forEach(function (l) {
      var id = l.getAttribute('href').slice(1);
      if (document.getElementById(id)) map[id] = l;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var l = map[en.target.id];
        if (!l) return;
        links.forEach(function (x) { x.classList.remove('is-active'); });
        l.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }
})();
