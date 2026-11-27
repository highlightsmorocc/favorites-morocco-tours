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

/* Favorites Morocco Tours - "Book your tour" email form (bk-) */
(function () {
  function fmtWaBtn(box, text) {
    var a = document.createElement("a");
    a.className = "fmt-wa-fallback"; a.target = "_blank"; a.rel = "noopener";
    a.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
    a.textContent = "WhatsApp \u2192";
    box.appendChild(document.createElement("br")); box.appendChild(a);
  }
  var MAIL = "contact@favoritesmoroccotours.com", FS = "f7d5c08fb5cfd9ab121b320069439439";
  var lang = (document.documentElement.lang || "en").slice(0, 2);
  var S = {
    en: { kicker: "Private tour request", title: "Book your Morocco tour", sub: "Tell us your plans and we reply by email within 24 hours with a tailor-made itinerary and price.",
      name: "Full name", email: "Email", phone: "WhatsApp / phone", tour: "What would you like to book?", date: "Arrival date", adults: "Adults", kids: "Children", msg: "Your message",
      msgPh: "Cities you want to see, hotel style, special requests...", send: "Send my request", sending: "Sending...", close: "Close",
      tours: ["Sahara desert tour from Marrakech", "Tour from Fes", "Tour from Casablanca", "Tour from Tangier", "Tour from Errachidia", "Day trip", "Merzouga luxury camp packages", "Tailor-made trip"],
      ok: "Thank you! Your request has been sent.", ok2: "We will reply by email within 24 hours. For a faster answer, write to us on WhatsApp.",
      fail: "The form could not be sent. Tap below to send your request on WhatsApp, or write to contact@favoritesmoroccotours.com.",
      trust: ["Reply within 24 h", "20% deposit, rest paid in Morocco", "Free cancellation up to 14 days"], or: "Prefer WhatsApp?", subject: "New tour request" },
    es: { kicker: "Solicitud de viaje privado", title: "Reserva tu viaje a Marruecos", sub: "Cuéntanos tus planes y te respondemos por email en menos de 24 horas con un itinerario a medida y el precio.",
      name: "Nombre completo", email: "Email", phone: "WhatsApp / teléfono", tour: "¿Qué quieres reservar?", date: "Fecha de llegada", adults: "Adultos", kids: "Niños", msg: "Tu mensaje",
      msgPh: "Ciudades que quieres ver, tipo de alojamiento, peticiones especiales...", send: "Enviar mi solicitud", sending: "Enviando...", close: "Cerrar",
      tours: ["Tour por el desierto desde Marrakech", "Tour desde Fez", "Tour desde Casablanca", "Tour desde Tánger", "Tour desde Errachidia", "Excursión de un día", "Paquetes campamento de lujo Merzouga", "Viaje a medida"],
      ok: "¡Gracias! Tu solicitud se ha enviado.", ok2: "Te responderemos por email en menos de 24 horas. Para una respuesta más rápida, escríbenos por WhatsApp.",
      fail: "No se pudo enviar el formulario. Pulsa abajo para enviar tu solicitud por WhatsApp, o escríbenos a contact@favoritesmoroccotours.com.",
      trust: ["Respuesta en 24 h", "20% de depósito, resto en Marruecos", "Cancelación gratis hasta 14 días"], or: "¿Prefieres WhatsApp?", subject: "Nueva solicitud de viaje" },
    pt: { kicker: "Pedido de viagem privada", title: "Reserve sua viagem ao Marrocos", sub: "Conte seus planos e respondemos por e-mail em até 24 horas com um roteiro sob medida e o preço.",
      name: "Nome completo", email: "E-mail", phone: "WhatsApp / telefone", tour: "O que você quer reservar?", date: "Data de chegada", adults: "Adultos", kids: "Crianças", msg: "Sua mensagem",
      msgPh: "Cidades que quer conhecer, tipo de hospedagem, pedidos especiais...", send: "Enviar meu pedido", sending: "Enviando...", close: "Fechar",
      tours: ["Tour pelo deserto saindo de Marrakech", "Tour saindo de Fez", "Tour saindo de Casablanca", "Tour saindo de Tânger", "Tour saindo de Errachidia", "Passeio de um dia", "Pacotes acampamento de luxo Merzouga", "Viagem sob medida"],
      ok: "Obrigado! Seu pedido foi enviado.", ok2: "Responderemos por e-mail em até 24 horas. Para uma resposta mais rápida, fale conosco pelo WhatsApp.",
      fail: "Não foi possível enviar o formulário. Toque abaixo para enviar seu pedido pelo WhatsApp, ou escreva para contact@favoritesmoroccotours.com.",
      trust: ["Resposta em 24 h", "Sinal de 20%, restante no Marrocos", "Cancelamento grátis até 14 dias"], or: "Prefere WhatsApp?", subject: "Novo pedido de viagem" },
    it: { kicker: "Richiesta di viaggio privato", title: "Prenota il tuo viaggio in Marocco", sub: "Raccontaci i tuoi piani: ti rispondiamo via email entro 24 ore con un itinerario su misura e il prezzo.",
      name: "Nome e cognome", email: "Email", phone: "WhatsApp / telefono", tour: "Cosa vuoi prenotare?", date: "Data di arrivo", adults: "Adulti", kids: "Bambini", msg: "Il tuo messaggio",
      msgPh: "Città che vuoi vedere, tipo di alloggio, richieste speciali...", send: "Invia la richiesta", sending: "Invio in corso...", close: "Chiudi",
      tours: ["Tour nel deserto da Marrakech", "Tour da Fes", "Tour da Casablanca", "Tour da Tangeri", "Tour da Errachidia", "Escursione di un giorno", "Pacchetti campo di lusso Merzouga", "Viaggio su misura"],
      ok: "Grazie! La tua richiesta è stata inviata.", ok2: "Ti risponderemo via email entro 24 ore. Per una risposta più rapida, scrivici su WhatsApp.",
      fail: "Non è stato possibile inviare il modulo. Tocca qui sotto per inviare la richiesta su WhatsApp, oppure scrivi a contact@favoritesmoroccotours.com.",
      trust: ["Risposta entro 24 h", "Acconto del 20%, saldo in Marocco", "Cancellazione gratuita fino a 14 giorni"], or: "Preferisci WhatsApp?", subject: "Nuova richiesta di viaggio" }
  };
  var t = S[lang] || S.en;
  var me = document.querySelector('script[src*="assets/main.js"]');
  var root = me ? me.getAttribute("src").replace(/assets\/main\.js.*$/, "") : "";
  var today = new Date().toISOString().slice(0, 10);
  function esc(s) { return String(s).replace(/[<>"]/g, ""); }
  var ico = {
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.2 4.2L19 7"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>'
  };
  var opts = t.tours.map(function (o) { return "<option>" + o + "</option>"; }).join("");
  var counter = function (n, label, v, min) {
    return '<div class="bk-field"><label>' + label + '</label><div class="bk-step"><button type="button" data-step="-1" aria-label="-">−</button><input name="' + n + '" type="number" min="' + min + '" max="40" value="' + v + '" inputmode="numeric"><button type="button" data-step="1" aria-label="+">+</button></div></div>';
  };
  var html =
    '<div class="bk" id="bk" role="dialog" aria-modal="true" aria-labelledby="bk-title" hidden><div class="bk-backdrop" data-close></div>' +
    '<div class="bk-box"><button class="bk-x" type="button" data-close aria-label="' + t.close + '">' + ico.close + '</button>' +
    '<aside class="bk-side" style="background-image:linear-gradient(180deg,rgba(2,48,71,.35),rgba(2,48,71,.92)),url(' + root + 'assets/cards/merzouga-dunes.jpg)">' +
    '<img class="bk-logo" src="' + root + 'assets/logo-favorites.png" alt="Favorites Morocco Tours" height="64">' +
    '<div><span class="bk-kicker">' + t.kicker + '</span><ul class="bk-trust">' + t.trust.map(function (x) { return "<li><span>" + ico.check + "</span>" + x + "</li>"; }).join("") + '</ul>' +
    '<a class="bk-wa" href="https://wa.me/212786278943" target="_blank" rel="noopener">' + ico.wa + '<span><small>' + t.or + '</small>+212 786 278 943</span></a></div></aside>' +
    '<div class="bk-main"><div class="bk-form-wrap"><span class="bk-kicker bk-kicker--m">' + t.kicker + '</span><h2 id="bk-title">' + t.title + '</h2><p class="bk-sub">' + t.sub + '</p>' +
    '<form class="bk-form" novalidate>' +
    '<input type="text" name="_honey" class="bk-hp" tabindex="-1" autocomplete="off">' +
    '<div class="bk-grid">' +
    '<div class="bk-field"><label for="bk-name">' + t.name + ' *</label><input id="bk-name" name="name" required autocomplete="name"></div>' +
    '<div class="bk-field"><label for="bk-email">' + t.email + ' *</label><input id="bk-email" name="email" type="email" required autocomplete="email"></div>' +
    '<div class="bk-field"><label for="bk-phone">' + t.phone + '</label><input id="bk-phone" name="phone" type="tel" autocomplete="tel"></div>' +
    '<div class="bk-field"><label for="bk-date">' + t.date + '</label><input id="bk-date" name="arrival" type="date" min="' + today + '"></div>' +
    '<div class="bk-field bk-full"><label for="bk-tour">' + t.tour + '</label><select id="bk-tour" name="tour">' + opts + '</select></div>' +
    counter("adults", t.adults, 2, 1) + counter("children", t.kids, 0, 0) +
    '<div class="bk-field bk-full"><label for="bk-msg">' + t.msg + '</label><textarea id="bk-msg" name="message" rows="3" placeholder="' + t.msgPh + '"></textarea></div>' +
    '</div><button class="bk-send" type="submit"><span>' + t.send + '</span>' + ico.send + '</button><p class="bk-err" role="alert" hidden></p></form></div>' +
    '<div class="bk-done" hidden><div class="bk-done-ico">' + ico.check + '</div><h3>' + t.ok + '</h3><p>' + t.ok2 + '</p><a class="bk-wa bk-wa--light" href="https://wa.me/212786278943" target="_blank" rel="noopener">' + ico.wa + '<span>WhatsApp +212 786 278 943</span></a></div>' +
    '</div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
  var bk = document.getElementById("bk"), form = bk.querySelector(".bk-form"), last = null;
  function open(preset) {
    last = document.activeElement;
    bk.querySelector(".bk-form-wrap").hidden = false; bk.querySelector(".bk-done").hidden = true;
    if (preset) { var sel = form.tour; for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text.toLowerCase().indexOf(preset.toLowerCase()) > -1) sel.selectedIndex = i; }
    var navOpen = document.querySelector(".fh-burger[aria-expanded=true]"); if (navOpen) navOpen.click();
    bk.hidden = false; document.documentElement.classList.add("bk-lock");
    requestAnimationFrame(function () { bk.classList.add("is-open"); });
    setTimeout(function () { form.name.focus(); }, 250);
  }
  function close() {
    bk.classList.remove("is-open"); document.documentElement.classList.remove("bk-lock");
    setTimeout(function () { bk.hidden = true; if (last) last.focus(); }, 300);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest(".fh-cta, [data-book]");
    if (a) { e.preventDefault(); open(a.getAttribute("data-book")); var px = a.getAttribute("data-pax"); if (px) form.adults.value = px; return; }
    if (e.target.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !bk.hidden) close(); });
  bk.addEventListener("click", function (e) {
    var b = e.target.closest("[data-step]"); if (!b) return;
    var inp = b.parentNode.querySelector("input"), v = (parseInt(inp.value, 10) || 0) + parseInt(b.getAttribute("data-step"), 10);
    inp.value = Math.max(parseInt(inp.min, 10), Math.min(40, v));
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var err = form.querySelector(".bk-err"); err.hidden = true;
    form.querySelectorAll("[required]").forEach(function (f) { f.classList.toggle("bk-bad", !f.checkValidity()); });
    if (!form.checkValidity()) { var bad = form.querySelector(".bk-bad"); if (bad) bad.focus(); return; }
    if (form._honey.value) return;
    var btn = form.querySelector(".bk-send"), lbl = btn.querySelector("span");
    btn.disabled = true; lbl.textContent = t.sending;
    var data = {};
    new FormData(form).forEach(function (v, k) { if (k !== "_honey") data[k] = esc(v); });
    data._subject = t.subject + " – " + data.tour + " – " + data.name;
    data._replyto = data.email; data._template = "table"; data._captcha = "false";
    data.page = location.href; data.language = lang.toUpperCase();
    fetch("https://formsubmit.co/ajax/" + FS, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) === "false") throw new Error("fail"); }); })
      .then(function () { bk.querySelector(".bk-form-wrap").hidden = true; bk.querySelector(".bk-done").hidden = false; form.reset(); })
      .catch(function () {
        err.textContent = t.fail; err.hidden = false;
        var body = ["name", "email", "phone", "arrival", "tour", "adults", "children", "message"].map(function (k) { return k + ": " + (data[k] || ""); }).join("\n");
        fmtWaBtn(err, data._subject + "\n" + body);
      })
      .then(function () { btn.disabled = false; lbl.textContent = t.send; });
  });

  /* Page forms (home + contact) -> email */
  document.querySelectorAll("form[data-mail]").forEach(function (pf) {
    pf.addEventListener("submit", function (e) {
      e.preventDefault();
      if (pf._honey && pf._honey.value) return;
      if (!pf.checkValidity()) { pf.reportValidity(); return; }
      var btn = pf.querySelector("button[type=submit]"), old = btn.innerHTML;
      btn.disabled = true; btn.textContent = t.sending;
      var d = {};
      new FormData(pf).forEach(function (v, k) { if (k !== "_honey" && v) d[k] = esc(v); });
      var who = d.Name || d.Nombre || d.Nome || "";
      d._subject = t.subject + " – " + who; d._replyto = d.Email || ""; d._template = "table"; d._captcha = "false";
      d.page = location.href; d.language = lang.toUpperCase();
      fetch("https://formsubmit.co/ajax/" + FS, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(d) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) === "false") throw new Error("fail"); }); })
        .then(function () {
          pf.innerHTML = '<div class="pf-done"><div class="bk-done-ico">' + ico.check + '</div><h3>' + t.ok + '</h3><p>' + t.ok2 + '</p></div>';
        })
        .catch(function () {
          btn.disabled = false; btn.innerHTML = old;
          var body = Object.keys(d).filter(function (k) { return k.charAt(0) !== "_"; }).map(function (k) { return k + ": " + d[k]; }).join("\n");
          var pe = pf.querySelector(".pf-err");
          if (!pe) { pe = document.createElement("p"); pe.className = "pf-err bk-err"; pe.setAttribute("role", "alert"); btn.insertAdjacentElement("afterend", pe); }
          pe.textContent = t.fail; pe.hidden = false;
          fmtWaBtn(pe, d._subject + "\n" + body);
        });
    });
  });
})();

/* Favorites Morocco Tours - group offer counter (go-) */
(function () {
  var card = document.querySelector("[data-go]");
  if (!card) return;
  var r = card.querySelector("#go-range"), out = card.querySelector("#go-out b"), msg = card.querySelector(".go-msg"), btn = card.querySelector(".go-btn");
  function upd() {
    var v = parseInt(r.value, 10), min = parseInt(r.min, 10), max = parseInt(r.max, 10);
    out.textContent = v;
    r.style.setProperty("--p", ((v - min) / (max - min) * 100) + "%");
    var on = v >= 16;
    card.classList.toggle("is-on", on);
    msg.textContent = on ? card.getAttribute("data-ok") : card.getAttribute("data-more").replace("{n}", 16 - v);
    btn.setAttribute("data-pax", v);
  }
  r.addEventListener("input", upd);
  card.querySelectorAll(".go-pm").forEach(function (b) {
    b.addEventListener("click", function () {
      r.value = Math.max(parseInt(r.min, 10), Math.min(parseInt(r.max, 10), parseInt(r.value, 10) + parseInt(b.getAttribute("data-d"), 10)));
      upd();
    });
  });
  upd();
})();

/* Favorites Morocco Tours - day / night switch (dt-) */
(function () {
  var root = document.documentElement, KEY = "fmt-theme";
  var lang = (root.lang || "en").slice(0, 2);
  var L = { en: ["Switch to night mode", "Switch to day mode"], es: ["Cambiar a modo noche", "Cambiar a modo día"], pt: ["Mudar para modo noite", "Mudar para modo dia"], it: ["Passa alla modalità notte", "Passa alla modalità giorno"] }[lang] || ["Night mode", "Day mode"];
  var bar = document.querySelector(".fh-top .fh-right");
  if (!bar) return;
  var sun = '<svg class="dt-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var moon = '<svg class="dt-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var b = document.createElement("button");
  b.type = "button"; b.className = "dt-switch"; b.innerHTML = '<span class="dt-knob">' + sun + moon + "</span>";
  function sync() { var d = root.getAttribute("data-theme") === "dark"; b.setAttribute("aria-pressed", d ? "true" : "false"); b.setAttribute("aria-label", d ? L[1] : L[0]); b.title = d ? L[1] : L[0]; }
  b.addEventListener("click", function () {
    var d = root.getAttribute("data-theme") !== "dark";
    if (d) root.setAttribute("data-theme", "dark"); else root.removeAttribute("data-theme");
    try { localStorage.setItem(KEY, d ? "dark" : "light"); } catch (e) {}
    sync();
  });
  bar.appendChild(b); sync();
})();
