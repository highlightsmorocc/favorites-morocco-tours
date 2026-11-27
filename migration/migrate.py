#!/usr/bin/env python3
"""Migrate missing blog articles (EN + ES) from the old WordPress into static pages.

Runs inside GitHub Actions (the runner can reach the old WordPress server).
The old WordPress is still served on mail.favoritesmoroccotours.com (same cPanel vhost).

1. Reads the blog list pages, finds article links whose page does not exist in the repo.
2. Fetches each article from the WP REST API, downloads its images into assets/wp/.
3. Builds the page from an existing article template (same header, footer, aside, styles).
4. Replaces every old wp-content image URL in the site by the local copy.
5. Adds the new pages to sitemap.xml.
"""
import html, json, math, os, re, sys, urllib.parse, urllib.request
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WP = "https://mail.favoritesmoroccotours.com"
SITE = "https://favoritesmoroccotours.com"
UA = {"User-Agent": "Mozilla/5.0 (FavoritesMigration)"}
TODAY = date.today().isoformat()
LOG = []


def log(*a):
    msg = " ".join(str(x) for x in a)
    print(msg, flush=True)
    LOG.append(msg)


def get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else data.decode("utf-8")


def rp(*p):
    return os.path.join(ROOT, *p)


def read(p):
    with open(rp(p), encoding="utf-8") as f:
        return f.read()


def write(p, s):
    full = rp(p)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(s)


# ---------------------------------------------------------------- images
IMG_RE = re.compile(
    r'(?:https?:)?(?://i[0-3]\.wp\.com/)?(?:https?://)?(?:www\.|mail\.)?favoritesmoroccotours\.com/wp-content/uploads/([^"\'\s?)<>]+)(\?[^"\'\s)<>]*)?'
)
_dl = {}


def localize(rel):
    """Download wp-content/uploads/<rel> into assets/wp/<rel>; return site path or None."""
    rel = urllib.parse.unquote(rel)
    if rel in _dl:
        return _dl[rel]
    dest = rp("assets", "wp", rel)
    ok = os.path.exists(dest)
    if not ok:
        try:
            data = get(WP + "/wp-content/uploads/" + urllib.parse.quote(rel), binary=True)
            if len(data) < 200:
                raise ValueError("too small")
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            with open(dest, "wb") as f:
                f.write(data)
            ok = True
        except Exception as e:  # noqa
            log("  image FAIL", rel, e)
    _dl[rel] = ("/assets/wp/" + urllib.parse.quote(rel)) if ok else None
    return _dl[rel]


def localize_all(text):
    def rep(m):
        local = localize(m.group(1))
        return local if local else m.group(0)
    return IMG_RE.sub(rep, text)


# ---------------------------------------------------------------- WP fetch
def wp_find(slug):
    for kind in ("posts", "pages"):
        try:
            res = json.loads(get(f"{WP}/wp-json/wp/v2/{kind}?slug={urllib.parse.quote(slug)}&_embed=wp:featuredmedia"))
        except Exception as e:  # noqa
            log("  api error", kind, slug, e)
            continue
        if res:
            return res[0]
    return None


def clean_content(c):
    c = re.sub(r"<script\b.*?</script>", "", c, flags=re.S | re.I)
    c = re.sub(r"<style\b.*?</style>", "", c, flags=re.S | re.I)
    c = re.sub(r"<!--.*?-->", "", c, flags=re.S)
    c = re.sub(r"""\s(?:srcset|sizes|style|data-[\w-]+)=(?:"[^"]*"|'[^']*')""", "", c)
    c = re.sub(r"<h1(\b[^>]*)>", r"<h2\1>", c, flags=re.I)
    c = re.sub(r"</h1>", "</h2>", c, flags=re.I)
    c = re.sub(r"<img(?![^>]*\bloading=)", '<img loading="lazy" decoding="async"', c)
    c = re.sub(r"<p>\s*(?:&nbsp;)?\s*</p>", "", c)
    c = re.sub(r"<table", '<div class="bx-table-wrap"><table class="bx-table"', c)
    c = re.sub(r"</table>", "</table></div>", c)
    # links to the old domain stay absolute (same domain now served by GitHub Pages)
    c = c.replace("https://mail.favoritesmoroccotours.com", SITE)
    c = localize_all(c)
    return c.strip()


def strip_tags(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


# ---------------------------------------------------------------- build
T = {
    "en": {"tpl": "alcohol-in-morocco/index.html", "home": "Home", "home_url": "/", "blog_url": "/blog/",
           "eyebrow": "Travel guide · {n} min read", "updated": "Updated", "locale": "en_GB",
           "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
           "cta": "Plan your private Morocco tour with us", "cta_p": "Tell us your dates and we send you a tailor-made itinerary and price within 24 hours.",
           "cta_btn": "Request a free quote", "tours": "/morocco-tours/"},
    "es": {"tpl": "es/alcohol-en-marruecos/index.html", "home": "Inicio", "home_url": "/es/", "blog_url": "/es/blog/",
           "eyebrow": "Guía de viaje · {n} min de lectura", "updated": "Actualizado", "locale": "es_ES",
           "months": ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
           "cta": "Organiza tu viaje privado por Marruecos con nosotros", "cta_p": "Dinos tus fechas y te enviamos un itinerario a medida con el precio en menos de 24 horas.",
           "cta_btn": "Pedir presupuesto gratis", "tours": "/es/tours-por-marruecos/"},
}


def fmt_date(iso, lang):
    y, m, d = iso[:10].split("-")
    if lang == "en":
        return f"{int(d)} {T['en']['months'][int(m)-1]} {y}"
    return f"{int(d)} de {T['es']['months'][int(m)-1]} de {y}"


def esc(s):
    return html.escape(s, quote=True)


def build(lang, path, post, alts):
    t = T[lang]
    tpl = read(t["tpl"])
    url = SITE + path
    yo = post.get("yoast_head_json") or {}
    title_plain = strip_tags(post["title"]["rendered"])
    seo_title = strip_tags(yo.get("title") or (title_plain + " | Favorites Morocco Tours"))
    if "Favorites Morocco Tours" not in seo_title:
        seo_title += " | Favorites Morocco Tours"
    desc = strip_tags(yo.get("description") or post.get("excerpt", {}).get("rendered", ""))[:300]
    if not desc:
        desc = title_plain
    content = clean_content(post["content"]["rendered"])

    # featured image
    img = None
    try:
        fm = post.get("_embedded", {}).get("wp:featuredmedia", [None])[0]
        if fm and fm.get("source_url"):
            img = localize_all(fm["source_url"])
            img_alt = fm.get("alt_text") or title_plain
    except Exception:  # noqa
        pass
    if not img or "/assets/wp/" not in img:
        img = "/assets/cards/merzouga-dunes.jpg"
        img_alt = title_plain
    img_abs = SITE + img

    words = len(strip_tags(content).split())
    mins = max(2, math.ceil(words / 220))
    published = post.get("date", TODAY)[:10]
    modified = post.get("modified", TODAY)[:10]

    # ---- head
    s = tpl
    s = re.sub(r"<title>.*?</title>", f"<title>{esc(seo_title)}</title>", s, count=1, flags=re.S)
    s = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{esc(desc)}">', s, count=1)
    s = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">', s, count=1)
    alt_links = "".join(f'<link rel="alternate" hreflang="{l}" href="{SITE}{p}">' for l, p in sorted(alts.items()))
    xdef = alts.get("en", path)
    alt_links += f'<link rel="alternate" hreflang="x-default" href="{SITE}{xdef}">'
    s = re.sub(r'(<link rel="alternate" hreflang="[^"]*" href="[^"]*">)+', alt_links, s, count=1)
    s = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{esc(title_plain)}">', s, count=1)
    s = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{esc(desc)}">', s, count=1)
    s = re.sub(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">', s, count=1)
    s = re.sub(r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{img_abs}">', s, count=1)
    s = re.sub(r'<link rel="preload" as="image" href="[^"]*"', f'<link rel="preload" as="image" href="{img}"', s, count=1)
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "BlogPosting", "@id": url + "#article", "headline": title_plain[:110], "description": desc,
         "inLanguage": lang, "image": img_abs, "datePublished": published, "dateModified": modified,
         "author": {"@type": "Organization", "name": "Favorites Morocco Tours", "url": SITE + "/"},
         "publisher": {"@type": "TravelAgency", "@id": SITE + "/#organization", "name": "Favorites Morocco Tours",
                       "logo": {"@type": "ImageObject", "url": SITE + "/assets/logo-favorites.png"}},
         "mainEntityOfPage": url, "about": {"@type": "Country", "name": "Morocco"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": t["home"], "item": SITE + t["home_url"]},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": SITE + t["blog_url"]},
            {"@type": "ListItem", "position": 3, "name": title_plain, "item": url}]}]}
    # FAQ schema from WP faq blocks (class="pregunta" questions followed by answer)
    faqs = []
    for q, a in re.findall(r'<(?:h3|h4|p|div)[^>]*class=["\'][^"\']*pregunta[^"\']*["\'][^>]*>(.*?)</(?:h3|h4|p|div)>\s*<p[^>]*>(.*?)</p>', content, flags=re.S):
        if strip_tags(q) and strip_tags(a):
            faqs.append({"@type": "Question", "name": strip_tags(q), "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}})
    if faqs:
        ld["@graph"].append({"@type": "FAQPage", "mainEntity": faqs[:10]})
    s = re.sub(r'<script type="application/ld\+json">.*?</script>',
               lambda m: '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + "</script>", s, count=1, flags=re.S)

    # ---- language menu
    def lang_href(l):
        if l in alts:
            return alts[l]
        return {"en": "/blog/", "es": "/es/blog/", "pt": "/pt/blog/", "it": "/it/blog/"}[l]
    s = re.sub(r'<a href="[^"]*" hreflang="([a-z]{2})"', lambda mm: f'<a href="{lang_href(mm.group(1))}" hreflang="{mm.group(1)}"', s)

    # ---- main
    a, b = s.find("<main>"), s.find("</main>")
    main_tpl = s[a:b]
    am = re.search(r'<aside class="tp-aside".*?</aside>', main_tpl, re.S)
    aside = am.group(0) if am else ""
    hero = (
        f'<section class="dp-hero" aria-labelledby="dp-title"><div class="dp-hero-media"><img src="{img}" alt="{esc(img_alt)}" width="1600" height="900" fetchpriority="high" decoding="async"></div>'
        f'<div class="dp-in"><nav aria-label="Breadcrumb"><ol class="dp-crumbs"><li><a href="{t["home_url"]}">{t["home"]}</a></li><li><a href="{t["blog_url"]}">Blog</a></li><li aria-current="page">{esc(title_plain)}</li></ol></nav>'
        f'<p class="dp-eyebrow">{t["eyebrow"].format(n=mins)}</p><h1 id="dp-title">{esc(title_plain)}</h1>'
        f'<p class="dp-intro">{esc(desc)}</p><p class="ar-meta">Favorites Morocco Tours · <time datetime="{modified}">{t["updated"]}: {fmt_date(modified, lang)}</time></p></div></section>'
    )
    cta = (f'<section class="wp-cta-box"><h2>{t["cta"]}</h2><p>{t["cta_p"]}</p>'
           f'<a class="tp-btn tp-btn--gold" href="{t["tours"]}" data-book="">{t["cta_btn"]}</a></section>')
    body = (f'<div class="tp-wrap"><div class="tp-layout"><article class="tp-main ar-body bx wp-article">{content}{cta}</article>\n'
            f'{aside}</div></div>')
    s = s[:a] + "<main>\n" + hero + "\n" + body + "\n" + s[b:]
    # tail of the template main (after aside) is replaced above; keep </main> and the rest
    write(path.strip("/") + "/index.html", s)
    return {"loc": url, "lastmod": modified, "alts": alts}


# ---------------------------------------------------------------- targets
def list_targets():
    targets = []
    for lang, f in (("en", "blog/index.html"), ("es", "es/blog/index.html")):
        s = read(f)
        for href in dict.fromkeys(re.findall(r'<h3><a href="([^"]+)"', s)):
            path = re.sub(r"^https?://(?:www\.)?favoritesmoroccotours\.com", "", href)
            if path.startswith("http") or not path.startswith("/"):
                continue
            if not path.endswith("/"):
                path += "/"
            if not os.path.exists(rp(path.strip("/"), "index.html")):
                targets.append((lang, path))
    return targets


def main():
    targets = list_targets()
    log(f"{len(targets)} missing articles")
    posts = {}
    for lang, path in targets:
        slug = path.strip("/").split("/")[-1]
        p = wp_find(slug)
        if not p:
            log("  NOT FOUND in WP:", path)
            continue
        posts[(lang, path)] = p
        log("  found", lang, path, "->", p.get("link"))

    # pair EN <-> ES translations by shared featured image
    by_media = {}
    for (lang, path), p in posts.items():
        fm = p.get("featured_media") or 0
        if fm:
            by_media.setdefault(fm, {})[lang] = path

    built = []
    for (lang, path), p in posts.items():
        alts = {lang: path}
        pair = by_media.get(p.get("featured_media") or -1, {})
        if len(pair) == 2:
            alts.update(pair)
        try:
            built.append(build(lang, path, p, alts))
            log("  BUILT", path)
        except Exception as e:  # noqa
            log("  BUILD FAIL", path, repr(e))

    # localize every remaining old wp image URL in the site
    changed = 0
    for dirpath, dirs, files in os.walk(ROOT):
        if "/.git" in dirpath or "/assets/wp" in dirpath:
            continue
        for fn in files:
            if not fn.endswith((".html", ".xml", ".txt", ".css", ".js")):
                continue
            full = os.path.join(dirpath, fn)
            with open(full, encoding="utf-8", errors="ignore") as f:
                s = f.read()
            if "wp-content/uploads" not in s:
                continue
            n = localize_all(s)
            if n != s:
                with open(full, "w", encoding="utf-8") as f:
                    f.write(n)
                changed += 1
    log(f"{changed} files with localized images")

    # sitemap
    sm = read("sitemap.xml")
    add = ""
    for b in built:
        if f"<loc>{b['loc']}</loc>" in sm:
            continue
        links = "".join(f'\n    <xhtml:link rel="alternate" hreflang="{l}" href="{SITE}{p}"/>' for l, p in sorted(b["alts"].items()))
        add += f"  <url>\n    <loc>{b['loc']}</loc>\n    <lastmod>{b['lastmod']}</lastmod>{links}\n  </url>\n"
    if add:
        write("sitemap.xml", sm.replace("</urlset>", add + "</urlset>"))
    write("migration/last-run.log", "\n".join(LOG) + "\n")


if __name__ == "__main__":
    main()
