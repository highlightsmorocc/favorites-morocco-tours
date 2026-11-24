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

/* Favorites Morocco Tours — hero search (fhh-) */
(function () {
  var f = document.querySelector('form[data-fhh]');
  if (!f) return;
  var out = f.querySelector('output'), n = 2;
  function render() { out.textContent = n + ' ' + (n === 1 ? out.getAttribute('data-one') : out.getAttribute('data-many')); }
  f.querySelectorAll('.fhh-step').forEach(function (b) {
    b.addEventListener('click', function () { n = Math.min(60, Math.max(1, n + Number(b.getAttribute('data-step')))); render(); });
  });
  var d = f.querySelector('input[type="date"]');
  if (d) d.min = new Date().toISOString().slice(0, 10);
  function go(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var c = document.getElementById('contact');
    if (c) {
      var cd = c.querySelector('input[type="date"]'); if (cd && d && d.value) cd.value = d.value;
      var cn = c.querySelector('input[type="number"]'); if (cn) cn.value = n;
    }
    var dest = f.elements.dest.value, exp = f.elements.exp.value;
    if (exp === 'daytrip') { go('day-trips'); return; }
    var ok = { marrakech: 1, fes: 1, casablanca: 1, errachidia: 1 };
    var key = ok[dest] ? dest : (exp === 'imperial' ? 'fes' : 'all');
    var chip = document.querySelector('#tours [data-filter="' + key + '"]');
    if (chip) chip.click();
    go('tours');
  });
  render();
})();

/* Favorites Morocco Tours - language dropdown */
(function () {
  var dd = document.querySelector(".fh-langdd");
  if (!dd) return;
  var btn = dd.querySelector(".fh-langbtn");
  function set(open) {
    dd.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  btn.addEventListener("click", function (e) { e.stopPropagation(); set(!dd.classList.contains("is-open")); });
  document.addEventListener("click", function (e) { if (!dd.contains(e.target)) set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
})();

/* Favorites Morocco Tours - tour & day-trip cards (fc-) */
(function () {
  var T = {
    en: ["Night in a Merzouga desert camp","Camel ride in the Erg Chebbi dunes","One-way trip ending in Fes","One-way trip ending in Marrakech","Round trip back to Fes","Private 4x4 with your driver","A night in the Sahara desert","Private driver for the whole trip","Flexible, tailor-made itinerary","Night in a Zagora desert camp","Camel ride at sunset","Ait Ben Haddou & the Draa Valley","Hotel or riad pick-up","Private driver","Back the same evening","Day trip","Ends in Fes","Ends in Marrakech","Round trip","Private tour","View tour","View day trip"],
    es: ["Noche en un campamento en Merzouga","Paseo en camello por las dunas de Erg Chebbi","Ruta de ida que termina en Fez","Ruta de ida que termina en Marrakech","Ida y vuelta a Fez","4x4 privado con tu conductor","Una noche en el desierto del Sáhara","Conductor privado todo el viaje","Itinerario flexible y a medida","Noche en un campamento en Zagora","Paseo en camello al atardecer","Ait Ben Haddou y el valle del Draa","Recogida en tu hotel o riad","Conductor privado","Vuelta el mismo día","Excursión de un día","Termina en Fez","Termina en Marrakech","Ida y vuelta","Tour privado","Ver tour","Ver excursión"],
    pt: ["Noite em acampamento em Merzouga","Passeio de camelo nas dunas de Erg Chebbi","Roteiro só de ida terminando em Fez","Roteiro só de ida terminando em Marrakech","Ida e volta a Fez","4x4 privado com seu motorista","Uma noite no deserto do Saara","Motorista particular a viagem toda","Roteiro flexível e sob medida","Noite em acampamento em Zagora","Passeio de camelo ao pôr do sol","Ait Ben Haddou e o Vale do Draa","Busca no hotel ou riad","Motorista particular","Volta no mesmo dia","Passeio de um dia","Termina em Fez","Termina em Marrakech","Ida e volta","Tour privado","Ver tour","Ver passeio"],
    it: ["Notte in un campo tendato a Merzouga","Escursione in cammello sulle dune di Erg Chebbi","Viaggio di sola andata fino a Fes","Viaggio di sola andata fino a Marrakech","Andata e ritorno a Fes","4x4 privato con il tuo autista","Una notte nel deserto del Sahara","Autista privato per tutto il viaggio","Itinerario flessibile e su misura","Notte in un campo tendato a Zagora","Escursione in cammello al tramonto","Ait Ben Haddou e la Valle del Draa","Partenza dal tuo hotel o riad","Autista privato","Rientro in giornata","Escursione","Fine a Fes","Fine a Marrakech","Andata e ritorno","Tour privato","Vedi tour","Vedi escursione"]
  };
  var lang = (document.documentElement.lang || "en").slice(0, 2);
  var t = T[lang] || T.en;
  var me = document.currentScript && document.currentScript.src;
  var assets = me ? me.replace(/main.js.*$/, "") : "";
  /* Photos stored in this repository (assets/). Add more: "part-of-tour-url": "file.jpg" */
  /* Fallbacks: by city + number of days, and day trips by place name (works in every language) */
  var BYCAT = {
      "marrakech-2": "cards/zagora-oasis.jpg",
      "marrakech-3": "cards/camels-merzouga.jpg",
      "marrakech-4": "cards/caravan-sunset.jpg",
      "marrakech-5": "cards/merzouga-dunes.jpg",
      "marrakech-6": "cards/caravan-shadows.jpg",
      "marrakech-7": "cards/sahara-camp-night.jpg",
      "marrakech fes-3": "cards/marrakech-jemaa-el-fna.jpg",
      "marrakech fes-4": "cards/fes-tannery.jpg",
      "marrakech fes-5": "cards/fes-medina.jpg",
      "marrakech-12": "cards/chefchaouen.jpg",
      "casablanca-6": "cards/casablanca-hassan-ii-mosque.jpg",
      "casablanca-7": "cards/fes-medina.jpg",
      "casablanca-8": "cards/chefchaouen.jpg",
      "casablanca-10": "cards/rabat-kasbah-udayas.jpg",
      "casablanca-15": "cards/essaouira.jpg",
      "errachidia-3": "cards/errachidia-oasis.jpg",
      "errachidia-4": "cards/caravan-shadows.jpg",
      "tangier-15": "cards/tangier.jpg",
      "tangier-12": "cards/tangier-harbor.jpg",
      "tangier-10": "cards/chefchaouen-blue-alley.jpg",
      "tangier-7": "cards/rabat-kasbah-udayas.jpg",
      "tangier-6": "cards/chefchaouen.jpg",
      "fes-6": "cards/chefchaouen-blue-alley.jpg",
      "fes-5": "cards/merzouga-dunes.jpg"
  };
  var DAYIMG = [["Ait Ben Haddou","ait-ben-haddou-kasbah-morocco.jpg"],["Agafay","cards/agafay-desert.jpg"],["Ouzoud","cards/ouzoud-waterfalls.jpg"],["Ourika","cards/ourika-valley.jpg"],["Imlil","cards/imlil-atlas.jpg"],["Essaouira","cards/essaouira.jpg"],["Volubilis","cards/volubilis.jpg"]];
  var IMG = {
      "2-days-tour-from-marrakech-to-zagora": "cards/zagora-oasis.jpg",
      "3-days-tour-from-marrakech-to-desert": "cards/camels-merzouga.jpg",
      "4-days-tour-from-marrakech-to-the-sahara-desert": "cards/caravan-sunset.jpg",
      "5-days-tour-from-marrakech-to-the-sahara-desert": "cards/merzouga-dunes.jpg",
      "6-days-tour-from-marrakech-to-the-sahara-desert": "cards/caravan-shadows.jpg",
      "7-days-private-tour-from-marrakech-to-the-sahara-desert": "cards/sahara-camp-night.jpg",
      "3-days-tour-from-marrakech-to-fes": "cards/marrakech-jemaa-el-fna.jpg",
      "4-days-tour-from-marrakech-to-fes": "cards/fes-tannery.jpg",
      "5-days-tour-from-marrakech-to-fes": "cards/fes-medina.jpg",
      "12-day-tour-marrakech-to-sahara": "cards/chefchaouen.jpg",
      "6-days-fes-to-marrakech-tour-mountains-desert-imperial-cities": "cards/chefchaouen-blue-alley.jpg",
      "5-days-fes-to-merzouga-marrakech-tour": "cards/merzouga-dunes.jpg",
      "4-days-desert-tour-from-fes-to-marrakech": "cards/caravan-sunset.jpg",
      "4-days-desert-tour-from-fes-to-fes": "cards/fes-tannery.jpg",
      "3-days-tour-from-fes-to-marrakech": "cards/sahara-camp-night.jpg",
      "3-days-tour-from-fes-to-merzouga-sahara": "cards/camels-merzouga.jpg",
      "6-days-tour-from-casablanca": "cards/casablanca-hassan-ii-mosque.jpg",
      "7-days-private-tour-from-casablanca": "cards/fes-medina.jpg",
      "8-days-private-tour-from-casablanca": "cards/chefchaouen.jpg",
      "10-days-morocco-itinerary-from-casablanca": "cards/rabat-kasbah-udayas.jpg",
      "15-days-tour-through-morocco-from-casablanca": "cards/essaouira.jpg",
      "15-days-morocco-tour-from-tangier": "cards/tangier.jpg",
      "12-days-tour-from-tangier": "cards/tangier-harbor.jpg",
      "10-days-tour-from-tangier": "cards/chefchaouen-blue-alley.jpg",
      "7-days-tour-from-tangier": "cards/rabat-kasbah-udayas.jpg",
      "6-days-tour-from-tangier-to-marrakech": "cards/chefchaouen.jpg",
      "3-days-desert-tour-from-errachidia": "cards/errachidia-oasis.jpg",
      "4-days-tour-from-errachidia-to-marrakech": "cards/caravan-shadows.jpg",
      "agafay-desert-quad-bike-and-camel-ride": "cards/agafay-desert.jpg",
      "ouzoud-waterfalls-day-trip-from-marrakech": "cards/ouzoud-waterfalls.jpg",
      "ourika-valley-day-trip-from-marrakech": "cards/ourika-valley.jpg",
      "imlil-valley-day-trip-from-marrakech": "cards/imlil-atlas.jpg",
      "essaouira-on-a-full-day-trip-from-marrakech": "cards/essaouira.jpg",
      "volubilis-day-trip-from-fes": "cards/volubilis.jpg",
      "ait-ben-haddou-day-trip-from-marrakech": "ait-ben-haddou-kasbah-morocco.jpg"
  };
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  document.querySelectorAll("a.card").forEach(function (c) {
    if (c.classList.contains("fc")) return;
    var h = c.getAttribute("href") || "";
    var routeEl = c.querySelector(".route"), daysEl = c.querySelector(".days"), thumb = c.querySelector(".thumb"), more = c.querySelector(".more");
    if (!thumb || !daysEl || !more) return;
    var route = routeEl ? routeEl.textContent : "";
    var n = parseInt(daysEl.textContent, 10) || 1;
    var word = daysEl.textContent.replace(/[0-9]+/, "").trim();
    var day = !!c.closest("#day-trips") || n === 1 || /day-trip|quad-bike|essaouira-on/.test(h);
    var round = /fes-to-fes/.test(h);
    var endFes = !round && (/marrakech-to-fes/.test(h) || /-to-fes.?$/.test(h));
    var endMar = /-to-marrakech/.test(h);
    var pts, chip = endFes ? t[16] : endMar ? t[17] : round ? t[18] : t[19];
    if (day) { pts = [t[12], t[13], t[14]]; chip = t[15]; }
    else if (/zagora/.test(h)) { pts = [t[9], t[10], t[11]]; }
    else if (/Merzouga|Erg Chebbi/.test(route) && n < 7) { pts = [t[0], t[1], endFes ? t[2] : endMar ? t[3] : round ? t[4] : t[5]]; }
    else { pts = [t[6], t[7], t[8]]; }
    daysEl.innerHTML = "<b>" + n + "</b><small>" + word + "</small>";
    var chipEl = document.createElement("span"); chipEl.className = "fc-chip"; chipEl.textContent = chip; thumb.appendChild(chipEl);
    var slug = h.split("/").filter(Boolean).pop() || "";
    var ttl = (c.querySelector("h3") || {}).textContent || "";
    var file = "";
    if (day) {
      DAYIMG.forEach(function (d) { if (!file && ttl.indexOf(d[0]) > -1) file = d[1]; });
    }
    if (!file) file = IMG[slug] || BYCAT[(c.getAttribute("data-cat") || "") + "-" + n] || "";
    if (file && assets) {
      var im = document.createElement("img"); im.className = "fc-img"; im.loading = "lazy"; im.decoding = "async"; im.width = 900; im.height = 675;
      im.src = assets + file; im.alt = ttl;
      thumb.insertBefore(im, thumb.firstChild.nextSibling); thumb.classList.add("fc-has-img");
    }
    var ul = document.createElement("ul"); ul.className = "fc-pts";
    pts.forEach(function (p) { var li = document.createElement("li"); li.textContent = p; ul.appendChild(li); });
    if (routeEl) routeEl.after(ul); else more.before(ul);
    more.innerHTML = (day ? t[21] : t[20]) + '<span class="fc-go">' + ARROW + "</span>";
    c.classList.add("fc");
  });
})();
