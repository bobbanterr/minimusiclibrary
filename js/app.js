/* Selections \u2014 embeds the owners add by hand (Spotify, Bandcamp, YouTube,
   SoundCloud...). Empty for now; add entries like:
   { title: "Mix name", credit: "DJ name", kind: "youtube", url: "https://www.youtube.com/embed/VIDEO_ID" }
   kind: "spotify" | "bandcamp" | "youtube" | "soundcloud" | "iframe" (iframe = paste any embed src url) */
const EMBEDS = [
  /* None of these stations offer an official embeddable player, so these
     are direct links out rather than iframes \u2014 kind: "link" renders a
     plain outbound card. Swap in real embeds (Spotify, Bandcamp, YouTube,
     SoundCloud) with kind: "spotify" | "bandcamp" | "youtube" | "soundcloud"
     and a url, whenever you have something to embed. */
  { title: "NTS Radio", credit: "London \u2014 live, two channels", kind: "link", url: "https://www.nts.live/" },
  { title: "Rinse FM", credit: "London \u2014 live", kind: "link", url: "https://rinse.fm/" },
  { title: "Worldwide FM", credit: "London \u2014 live + shows", kind: "link", url: "https://worldwidefm.net/" },
  { title: "Dublab", credit: "Los Angeles \u2014 live", kind: "link", url: "https://www.dublab.com/" },
  { title: "The Lot Radio", credit: "New York \u2014 live, 24/7", kind: "link", url: "https://www.thelotradio.com/" },
  { title: "Balamii", credit: "London \u2014 live", kind: "link", url: "https://balamii.com/" },
  { title: "Red Light Radio", credit: "Amsterdam \u2014 live", kind: "link", url: "https://www.redlightradio.net/" },
  { title: "Refuge Worldwide", credit: "Berlin \u2014 live", kind: "link", url: "https://refugeworldwide.com/" },
  { title: "Kiosk Radio", credit: "Brussels \u2014 live", kind: "link", url: "https://kioskradio.com/" },
  { title: "Radio Alhara", credit: "Bethlehem \u2014 live, 24/7", kind: "link", url: "https://www.radioalhara.net/" },
];

/* Caf\u00e9 menu \u2014 edit this list to change what's on the site. "price" can be
   a single number-as-string ("215") or two sizes separated by a slash. */
const MENU = [
  { cat: "Espresso", items: [
    ["Americano", "195/210"], ["Cappuccino", "215"], ["Latte", "215/230"],
    ["Flat White", "235/250"], ["Cortado", "205"], ["White Mocha", "240/255"],
    ["Vanilla Latte", "240/255"], ["Caramel Latte", "240/255"],
    ["Espresso", "125/150"], ["Turkish Coffee", "120"],
  ]},
  { cat: "Espresso with", items: [
    ["Espresso Tonic", "240"], ["Espresso Spritz", "260"], ["Espresso with Lemonade", "240"],
  ]},
  { cat: "Non-coffee", items: [
    ["Tea", "240"], ["Herbal Tea", "260"], ["Chai Tea Latte", "240"], ["Hot Chocolate", "220"],
    ["Sahlep", "220"], ["Spritz", "100"], ["Iced Tea", "100"], ["Cool Lime", "215"], ["Lemonade", "215"],
  ]},
];

(function () {
  "use strict";
  const { config, records } = window.MML;
  const $ = (s, el = document) => el.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = n => config.currency + Number(n).toLocaleString("en-US");
  const bySku = sku => records.find(r => r.sku === sku);
  const gradeLabel = r => r.type === "New" ? "New" : `${r.vinyl} / ${r.sleeve}`;
  const COND = { Sealed: "Factory sealed", NM: "Near mint", "VG+": "Very good plus", VG: "Very good", "G+": "Good plus", G: "Good", "F/P": "Fair / poor", Generic: "Plain or replacement sleeve" };
  const COND_ORDER = ["Sealed", "NM", "VG+", "VG", "G+", "G", "F/P", "Generic"];

  /* ---------- cart ---------- */
  const KEY = "mml-cart";
  const readCart = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const writeCart = c => { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} paintCartCount(); };
  const inCart = sku => (readCart().find(i => i.sku === sku) || { qty: 0 }).qty;
  function addToCart(sku) {
    const r = bySku(sku); const c = readCart(); const it = c.find(i => i.sku === sku);
    if (it) { if (it.qty >= r.stock) return false; it.qty++; } else c.push({ sku, qty: 1 });
    writeCart(c); return true;
  }
  function paintCartCount() {
    const n = readCart().reduce((a, i) => a + i.qty, 0);
    document.querySelectorAll(".cart-ct b").forEach(el => el.textContent = n);
  }

  /* ---------- tile (used on home + records grids) ---------- */
  let tileIdx = 0;
  function tile(r, big) {
    tileIdx++;
    return `<a class="tile${big ? " big" : ""}${r.stock < 1 ? " sold" : ""}" href="#/record/${encodeURIComponent(r.sku)}">
      <img src="${r.image}" alt="" loading="lazy" width="460" height="460">
      <span class="px">${money(r.price)}</span>
      <span class="ov">
        <span class="artist">${esc(r.artist)}</span>
        <span class="ttl">${esc(r.title)} \u2014 ${esc(gradeLabel(r))}</span>
      </span>
    </a>`;
  }
  function mosaic(list, varied) {
    tileIdx = 0;
    return `<div class="mosaic">${list.map((r, i) => tile(r, varied && i % 7 === 2)).join("")}</div>`;
  }

  function toast(text) {
    let t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.innerHTML = `${esc(text)} <a href="#/cart">View cart</a>`;
    t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
  }

  const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=MiniMusicLibrary%20Ankara";
  const IG_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="0"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>`;
  const MAP_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-7.1 7-12a7 7 0 1 0-14 0c0 4.9 7 12 7 12z"/><circle cx="12" cy="9" r="2.4"/></svg>`;
  function iconRow(ink) {
    return `<span class="icon-row">
      <a href="https://instagram.com/${esc(config.instagram)}" aria-label="Instagram">${IG_ICON}</a>
      <a href="${MAPS_URL}" aria-label="Google Maps">${MAP_ICON}</a>
    </span>`;
  }

  /* ---------- theme (light / dark toggle) ---------- */
  const THEME_KEY = "mml-theme";
  function getTheme() { try { return localStorage.getItem(THEME_KEY) || "light"; } catch (e) { return "light"; } }
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    document.querySelectorAll(".theme-toggle").forEach(b => b.setAttribute("aria-pressed", t === "dark"));
  }
  const SUN = `<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>`;
  const MOON = `<svg class="moon" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>`;

  /* ---------- chrome ---------- */
  function headerFooter(route) {
    const links = [["records", "Records"], ["selections", "Selections"], ["cafe", "Caf\u00e9"], ["visit", "Visit"], ["cart", "Cart"]];
    const n = readCart().reduce((a, i) => a + i.qty, 0);
    $("#site-header").innerHTML = `
      <header class="site-header"><div class="wrap">
        <a class="brand" href="#/"><img src="images/logo.png" alt="${esc(config.shopName)}"></a>
        <div class="hdr-right">
          <button class="theme-toggle" aria-label="Toggle dark mode" aria-pressed="${getTheme() === "dark"}"><span class="knob">${SUN}${MOON}</span></button>
          <a class="cart-ct" href="#/cart">CART (<b>${n}</b>)</a>
          <button class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="nav-drawer">MENU<span class="bars"><span></span><span></span><span></span></span></button>
        </div>
      </div></header>
      <div class="nav-drawer" id="nav-drawer">
        <button class="drawer-close" id="drawer-close" aria-label="Close menu">\u00d7</button>
        <div class="wrap nav-main">
          ${links.map(([p, l]) => `<a href="#/${p}">${l}${p === "cart" ? `<span class="dn">${n}</span>` : ""}</a>`).join("")}
        </div>
        <div class="nav-drawer-foot wrap" style="max-width:1760px;margin:0 auto;width:100%">
          <span>ANKARA, TR</span><span>MINIMUSICLIBRARY</span>${iconRow()}
        </div>
      </div>`;
    $("#site-footer").innerHTML = `
      <footer class="site-footer"><div class="wrap">
        <span>${config.demo ? "Demo site \u2014 some data is placeholder." : "MiniMusicLibrary, Ankara."}</span>
        ${iconRow()}
      </div></footer>`;
    const btn = $("#menu-btn"), drawer = $("#nav-drawer"), closeBtn = $("#drawer-close");
    function openDrawer() { drawer.classList.add("open"); btn.setAttribute("aria-expanded", "true"); document.documentElement.style.overflow = "hidden"; }
    function closeDrawer() { drawer.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); document.documentElement.style.overflow = ""; }
    btn.addEventListener("click", () => { drawer.classList.contains("open") ? closeDrawer() : openDrawer(); });
    closeBtn.addEventListener("click", closeDrawer);
    drawer.querySelectorAll(".nav-main a").forEach(a => a.addEventListener("click", closeDrawer));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer(); });
    document.querySelectorAll(".theme-toggle").forEach(b => b.addEventListener("click", () => setTheme(getTheme() === "dark" ? "light" : "dark")));
  }

  /* ---------- pages ---------- */
  function pageHome() {
    return `
      <section class="landing-hero">
        <h1>RECORDS<br>+ COFF<span style="color:var(--pink)">EE.</span></h1>
        <p class="lede">A small record shop and listening caf\u00e9 in Ankara, new and used, and a counter pulling espresso next to them.</p>
        <div class="landing-actions">
          <a class="btn" href="#/records">Browse records</a>
          <a class="btn ghost" href="#/cafe">Caf\u00e9 menu</a>
        </div>
      </section>
      <div class="pillars">
        <div class="pillar"><span class="tag">RECORDS</span><h2>New + used, all genres.</h2><p>Turkish rock, Soviet-era pressings, fresh house 12"s \u2014 browse the full wall.</p><a class="text-link" href="#/records">Browse records \u2192</a></div>
        <div class="pillar"><span class="tag">CAF\u00c9</span><h2>Coffee, on record.</h2><p>Order at the counter, sit and put something on.</p><a class="text-link" href="#/cafe">See the menu \u2192</a></div>
      </div>
      <div class="section"><div class="wrap" style="justify-content:space-between">
        <span class="tag" style="font-family:var(--mono);font-size:12px;color:var(--grey)">CINNAH CD. No:10, \u00c7ANKAYA, ANKARA \u2014 OPEN DAILY 10:00\u201323:00</span>
        <a class="text-link" href="#/visit">Visit us \u2192</a>
      </div></div>`;
  }

  function pageRecords(qs) {
    setTimeout(() => initShop(qs), 0);
    return `
      <div class="page-head"><h1>RECORDS</h1></div>
      <form id="filters" onsubmit="return false"></form>
      <div class="toolbar">
        <span id="result-count"></span>
        <label>SORT <select id="sort" style="margin-left:8px">
          <option value="added">Newest</option>
          <option value="price-asc">Price \u2191</option>
          <option value="price-desc">Price \u2193</option>
          <option value="artist">Artist A\u2013Z</option>
          <option value="year">Year</option>
        </select></label>
      </div>
      <div id="results"></div>
      <div class="empty" id="empty" hidden>
        <h2 style="font-size:26px">No records match these filters.</h2>
        <button class="btn" id="empty-reset" type="button">Clear all filters</button>
      </div>`;
  }

  function initShop(qs) {
    const params = new URLSearchParams(qs || "");
    const state = { q: "", genre: new Set(), type: new Set(), vinyl: new Set(), format: new Set(), max: 0, sort: "added" };
    if (params.get("genre")) state.genre.add(params.get("genre"));
    const maxPrice = Math.max(...records.map(r => r.price));
    const step = 100; const top = Math.ceil(maxPrice / step) * step; state.max = top;
    const groups = [["genre", "Genre", r => r.genre], ["type", "Type", r => r.type], ["vinyl", "Condition", r => r.vinyl], ["format", "Format", r => r.format]];
    const order = key => key === "vinyl" ? (a, b) => COND_ORDER.indexOf(a) - COND_ORDER.indexOf(b) : (a, b) => a.localeCompare(b);
    const form = $("#filters");
    form.innerHTML = `<div class="filter-row">
      <input class="search" id="q" type="search" placeholder="Search\u2026" autocomplete="off">
      ${groups.map(([key, label, get]) => {
        const vals = [...new Set(records.map(get))].sort(order(key));
        return `<div class="grp"><span class="grp-label">${label}:</span>${vals.map(v =>
          `<button type="button" class="ftoggle" data-k="${key}" data-v="${esc(v)}">${esc(v)}<span class="n" data-count="${key}|${esc(v)}"></span></button>`).join("")}</div>`;
      }).join("")}
      <div class="grp price-row"><span class="grp-label">Up to <span id="max-out">${money(top)}</span></span>
        <input id="max" type="range" min="${step * 4}" max="${top}" step="${step}" value="${top}"></div>
      <button type="button" class="clear-all" id="clear-all">Clear all</button>
    </div>`;
    form.addEventListener("input", e => {
      if (e.target.id === "q") { state.q = e.target.value.trim().toLowerCase(); render(); }
      if (e.target.id === "max") { state.max = +e.target.value; $("#max-out").textContent = money(state.max); render(); }
    });
    form.addEventListener("click", e => {
      const b = e.target.closest(".ftoggle"); if (!b) return;
      const on = state[b.dataset.k].has(b.dataset.v);
      on ? state[b.dataset.k].delete(b.dataset.v) : state[b.dataset.k].add(b.dataset.v);
      b.classList.toggle("on", !on); render();
    });
    $("#sort").addEventListener("change", e => { state.sort = e.target.value; render(); });
    function matches(r, skip) {
      if (state.q && !`${r.artist} ${r.title} ${r.label} ${r.style}`.toLowerCase().includes(state.q)) return false;
      if (r.price > state.max) return false;
      for (const [key, , get] of groups) if (key !== skip && state[key].size && !state[key].has(get(r))) return false;
      return true;
    }
    const sorters = { added: (a, b) => b.added - a.added, "price-asc": (a, b) => a.price - b.price, "price-desc": (a, b) => b.price - a.price, artist: (a, b) => a.artist.localeCompare(b.artist), year: (a, b) => (b.year || 0) - (a.year || 0) };
    function render() {
      const list = records.filter(r => matches(r)).sort(sorters[state.sort]);
      $("#results").innerHTML = mosaic(list, false);
      $("#empty").hidden = list.length > 0;
      $("#result-count").textContent = `${list.length} / ${records.length}`;
      form.querySelectorAll("[data-count]").forEach(el => {
        const [key, val] = el.dataset.count.split("|");
        const get = groups.find(g => g[0] === key)[2];
        el.textContent = ` ${records.filter(r => matches(r, key) && get(r) === val).length}`;
      });
    }
    $("#clear-all").addEventListener("click", () => {
      groups.forEach(([key]) => state[key].clear());
      form.querySelectorAll(".ftoggle.on").forEach(b => b.classList.remove("on"));
      state.q = ""; $("#q").value = ""; state.max = top; $("#max").value = top; $("#max-out").textContent = money(top);
      render();
    });
    $("#empty-reset").addEventListener("click", () => $("#clear-all").click());
    // reflect genre preset from URL
    form.querySelectorAll(`.ftoggle[data-k="genre"]`).forEach(b => { if (state.genre.has(b.dataset.v)) b.classList.add("on"); });
    render();
  }

  function pageRecord(sku) {
    const r = bySku(sku);
    if (!r) return `<div class="wrap empty"><h1 style="font-size:36px">We couldn't find that record.</h1><a class="btn" href="#/records">Browse all records</a></div>`;
    const isNew = r.type === "New";
    const related = records.filter(x => x.genre === r.genre && x.sku !== r.sku).slice(0, 6);
    setTimeout(() => initRecord(r), 0);
    return `
      <div class="record">
        <div class="record-art"><img src="${r.image}" alt="Cover of ${esc(r.title)} by ${esc(r.artist)}" width="900" height="900"></div>
        <div class="record-info">
          <div>
            <div class="crumbs"><a href="#/records">Records</a> / <a href="#/records?genre=${encodeURIComponent(r.genre)}">${esc(r.genre)}</a></div>
            <div class="artist" style="margin-top:14px">${esc(r.artist)}</div>
            <h1>${esc(r.title)}</h1>
          </div>
          <p class="desc">${esc(r.description)}</p>
          <div class="record-buy">
            <span class="price">${money(r.price)}</span>
            <button class="btn" id="add">Add to cart</button>
          </div>
          <p class="stock-note" id="stock-note"></p>
          <dl class="specs">
            ${isNew ? `<dt>Condition</dt><dd>Sealed</dd>` : `<dt>Vinyl</dt><dd>${esc(r.vinyl)} \u2014 ${esc(COND[r.vinyl])}</dd><dt>Sleeve</dt><dd>${esc(r.sleeve)} \u2014 ${esc(COND[r.sleeve])}</dd>`}
            <dt>Genre</dt><dd>${esc(r.genre)}, ${esc(r.style)}</dd>
            <dt>Format</dt><dd>${esc(r.format)}</dd>
            ${r.label ? `<dt>Label</dt><dd>${esc(r.label)}</dd>` : ""}
            ${r.year ? `<dt>Year</dt><dd>${r.year}</dd>` : ""}
            <dt>Stock</dt><dd>${r.sku}</dd>
          </dl>
          ${r.verify && config.demo ? `<p class="verify-note">DEMO NOTE: some details for this pressing still need checking against Discogs.</p>` : ""}
          ${related.length ? `<div style="margin-top:12px"><p class="stock-note" style="margin-bottom:14px">MORE ${esc(r.genre.toUpperCase())}</p>${mosaic(related, false)}</div>` : ""}
        </div>
      </div>`;
  }

  function initRecord(r) {
    const btn = $("#add"), note = $("#stock-note");
    function sync() {
      const left = r.stock - inCart(r.sku);
      if (r.stock < 1) { btn.disabled = true; btn.textContent = "Sold out"; note.textContent = "This one has gone to a new home."; }
      else if (left < 1) { btn.disabled = true; btn.textContent = "In your cart"; note.innerHTML = `${r.stock === 1 ? "There's only one copy, and it's" : "All copies are"} in your cart. <a class="text-link" href="#/cart">Go to cart</a>`; }
      else { btn.disabled = false; btn.textContent = "Add to cart"; note.textContent = r.type === "New" ? "" : "One copy. Used records are one of a kind."; }
    }
    btn.addEventListener("click", () => { if (addToCart(r.sku)) { toast("Added to cart"); sync(); headerFooter(location.hash.replace(/^#\/?/, "").split("/")[0] || "record"); } });
    sync();
  }

  function menuRow([name, price]) {
    const p = price.includes("/") ? price.split("/").map(n => money(n)).join(" / ") : money(price);
    return `<div class="menu-row"><span>${esc(name)}</span><span class="dots"></span><span class="p">${p}</span></div>`;
  }
  function pageCafe() {
    return `
      <div class="page-head"><h1>CAF\u00c9</h1></div>
      <div class="menu" aria-label="Caf\u00e9 menu" style="max-width:720px;margin:0 auto">
        ${MENU.map(sec => `<h3>${esc(sec.cat)}</h3>${sec.items.map(menuRow).join("")}`).join("")}
        ${config.demo ? '<p class="menu-note">DEMO DATA</p>' : ""}
      </div>`;
  }

  function pageVisit() {
    return `
      <div class="page-head"><h1>VISIT</h1></div>
      <div class="visit-grid">
        <div><span class="tag">WHERE</span><h3 style="margin-top:12px;font-size:19px">Find us</h3><p>Cinnah Cd. No:10<br>\u00c7ankaya, Ankara</p>
          <p style="margin-top:14px"><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=MiniMusicLibrary%20Ankara">Get directions</a></p></div>
        <div><span class="tag">WHEN</span><h3 style="margin-top:12px;font-size:19px">Opening hours</h3><p>Monday to Sunday<br>10:00 to 23:00</p></div>
        <div><span class="tag">SAY HI</span><h3 style="margin-top:12px;font-size:19px">Stay in the loop</h3>
          <p style="margin-top:14px"><a class="text-link" href="https://instagram.com/minimusiclibrary">Instagram</a></p></div>
      </div>`;
  }

  /* ---------- selections (owner-curated embeds \u2014 see EMBEDS at the top) ---------- */
  function embedSrc(e) {
    if (e.kind === "spotify" || e.kind === "youtube" || e.kind === "iframe") return e.url;
    if (e.kind === "bandcamp") return e.url; // paste Bandcamp's own iframe src= value
    if (e.kind === "soundcloud") return `https://w.soundcloud.com/player/?url=${encodeURIComponent(e.url)}&color=%23ff2f87&auto_play=false`;
    return e.url;
  }
  function selCard(e) {
    if (e.kind === "link") {
      return `<a class="sel-card sel-link" href="${esc(e.url)}" target="_blank" rel="noopener">
        <div class="sel-body">
          <span class="sel-kind">RADIO</span>
          <strong>${esc(e.title || "")}</strong>
          ${e.credit ? `<span style="color:var(--grey);font-size:13px">${esc(e.credit)}</span>` : ""}
          <span class="text-link">Tune in \u2192</span>
        </div></a>`;
    }
    const tall = e.kind === "youtube" || (e.kind === "iframe" && e.ratio === "video");
    return `<div class="sel-card">
      <div class="sel-embed" style="aspect-ratio:${tall ? "16/9" : "1/1"}">
        <iframe src="${esc(embedSrc(e))}" loading="lazy" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:0;display:block"></iframe>
      </div>
      <div class="sel-body">
        <span class="sel-kind">${esc((e.kind || "").toUpperCase())}</span>
        <strong>${esc(e.title || "")}</strong>
        ${e.credit ? `<span style="color:var(--grey);font-size:13px">${esc(e.credit)}</span>` : ""}
      </div></div>`;
  }
  function pageSelections() {
    return `
      <div class="onair"><div class="wrap">
        <span class="live">ON AIR</span>
        <div class="ticker-mask"><div class="ticker-track"><span>${EMBEDS.length ? EMBEDS.map(e => esc((e.credit ? e.credit + " \u2014 " : "") + (e.title || ""))).join("</span><span>") : "Selections coming soon."}</span></div></div>
      </div></div>
      <div class="page-head"><h1>SELECTIONS</h1></div>
      ${EMBEDS.length
        ? `<div class="sel-grid">${EMBEDS.map(selCard).join("")}</div>`
        : `<div class="empty"><p style="color:var(--grey)">Mixes, videos and tracks the shop is playing \u2014 added by hand, coming soon.</p></div>`}`;
  }

  function pageCart() {
    setTimeout(initCart, 0);
    return `<div class="page-head"><h1>CART</h1></div><div id="cart"></div>`;
  }

  function initCart() {
    const box = $("#cart");
    function render() {
      const items = readCart().filter(i => bySku(i.sku));
      if (!items.length) { box.innerHTML = `<div class="empty"><h2>Your cart is empty.</h2><a class="btn" href="#/records">Browse records</a></div>`; return; }
      const total = items.reduce((a, i) => a + bySku(i.sku).price * i.qty, 0);
      box.innerHTML = `<div class="cart-layout">
        <div class="cart-items">${items.map(i => { const r = bySku(i.sku); return `
          <div class="cart-item"><img src="${r.image}" alt="">
            <div><a href="#/record/${encodeURIComponent(r.sku)}"><strong>${esc(r.artist)}</strong></a><br>${esc(r.title)}
              <div class="meta">${esc(r.format)}, ${esc(gradeLabel(r))}</div>
              ${r.stock > 1 ? `<div class="qty"><button data-a="dec" data-s="${r.sku}">\u2212</button><span>${i.qty}</span><button data-a="inc" data-s="${r.sku}"${i.qty >= r.stock ? " disabled" : ""}>+</button></div>` : ""}
              <div><button class="remove" data-a="rm" data-s="${r.sku}">Remove</button></div></div>
            <span class="price">${money(r.price * i.qty)}</span></div>`; }).join("")}
        </div>
        <aside class="summary" aria-label="Order summary">
          <h2 style="font-size:24px">CHECKOUT</h2>
          <div class="sum-row"><span>Records</span><span>${money(total)}</span></div>
          <form class="form" id="checkout">
            <div class="radio-row" role="radiogroup" aria-label="How you'll get your records">
              <label class="check"><input type="radio" name="how" value="pickup" checked> Pick up in store</label>
              <label class="check"><input type="radio" name="how" value="ship"> Ship to me</label>
            </div>
            <label>Full name <input name="name" required autocomplete="name"></label>
            <label>Phone <input name="phone" required type="tel" autocomplete="tel"></label>
            <label id="addr" hidden>Address <input name="address" autocomplete="street-address"></label>
            <div class="sum-row total"><span>Total</span><span>${money(total)}</span></div>
            <button class="btn" type="submit">Place order</button>
            <p class="stock-note">Payment is taken at pickup or on delivery \u2014 nothing is charged online yet.</p>
          </form>
          <div id="done"></div>
        </aside></div>`;
      const f = $("#checkout");
      f.addEventListener("change", () => { const ship = f.how.value === "ship"; $("#addr").hidden = !ship; f.address.required = ship; });
      f.addEventListener("submit", e => {
        e.preventDefault();
        const orderItems = items.map(i => ({ r: bySku(i.sku), qty: i.qty }));
        const how = f.how.value, name = f.name.value.trim();
        writeCart([]);
        box.innerHTML = `
          <div class="order-done">
            <div class="confirm" role="status">
              <h3 style="font-size:20px">Order placed, ${esc(name.split(" ")[0] || "thanks")}.</h3>
              <p style="font-size:13px">We'll call to confirm, and hold your records ${how === "ship" ? "until they ship" : "at the counter for 3 days"}.</p>
            </div>
            <div class="items">
              ${orderItems.map(({ r, qty }) => `<div class="oi"><img src="${r.image}" alt="">
                <div><strong>${esc(r.artist)}</strong> \u2014 ${esc(r.title)}<div style="color:var(--grey);font-size:12px">${qty} \u00d7 ${money(r.price)}</div></div>
                <span>${money(r.price * qty)}</span></div>`).join("")}
            </div>
            <div class="sum-row total"><span>Total</span><span>${money(total)}</span></div>
            <a class="btn" href="#/records">Browse more records</a>
          </div>`;
      });
    }
    box.addEventListener("click", e => {
      const b = e.target.closest("button[data-a]"); if (!b) return;
      const c = readCart(); const it = c.find(i => i.sku === b.dataset.s); const r = bySku(b.dataset.s);
      if (b.dataset.a === "rm") c.splice(c.indexOf(it), 1);
      if (b.dataset.a === "inc" && it.qty < r.stock) it.qty++;
      if (b.dataset.a === "dec") { it.qty--; if (it.qty < 1) c.splice(c.indexOf(it), 1); }
      writeCart(c); render();
    });
    render();
  }

  /* ---------- router ---------- */
  function route() {
    const h = location.hash.replace(/^#\/?/, "");
    const [path, qs] = h.split("?");
    const parts = path.split("/").filter(Boolean);
    const main = $("#app");
    let name = "home", html = "";
    if (!parts.length) { name = "home"; html = pageHome(); }
    else if (parts[0] === "records") { name = "records"; html = pageRecords(qs); }
    else if (parts[0] === "record") { name = "record"; html = pageRecord(decodeURIComponent(parts[1] || "")); }
    else if (parts[0] === "cafe") { name = "cafe"; html = pageCafe(); }
    else if (parts[0] === "visit") { name = "visit"; html = pageVisit(); }
    else if (parts[0] === "selections") { name = "selections"; html = pageSelections(); }
    else if (parts[0] === "cart") { name = "cart"; html = pageCart(); }
    else { name = "home"; html = pageHome(); }
    main.innerHTML = html;
    headerFooter(name);
    window.scrollTo(0, 0);
  }
  document.documentElement.setAttribute("data-theme", getTheme());
  window.addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", route);
})();
