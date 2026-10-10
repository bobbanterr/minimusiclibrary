# MiniMusicLibrary — website

A static site: plain HTML, CSS and JavaScript, with real separate files.
No build step, no server, no framework.

## Folder structure

    index.html          entry point — one page, routes itself with the URL hash
    css/style.css        all styling
    js/app.js             site logic: routing, cart, filters, checkout
    js/data.js            the 41 records + site settings (edit this to change stock)
    images/logo.png       logo
    images/records/*.jpg  one cover photo per record, named by SKU

## Run it locally
Double-click `index.html`. It loads `css/style.css`, `js/data.js` and
`js/app.js` the normal way, so just opening the file works.

## Put it on GitHub Pages
1. Create a new repository on GitHub and upload this whole folder
   (keep the folder structure — `css/`, `js/`, `images/` must stay where they are
   relative to `index.html`).
2. In the repository, go to Settings > Pages.
3. Under "Build and deployment", choose "Deploy from a branch", pick `main`
   and `/ (root)`, then Save.
4. After a minute the site is live at
   `https://<your-username>.github.io/<repo-name>/`.

## Pages
The site is one HTML file that changes what it shows based on the URL
hash (`#/records`, `#/record/VNL-TR-00001`, `#/cafe`, `#/visit`,
`#/selections`, `#/cart`) — this keeps the whole site in one `index.html`
without needing a server, which is what makes plain GitHub Pages hosting work.

## Editing records
Open `js/data.js`. Each record is one object:

    { "sku": "VNL-RK-00017", "artist": "Sonic Youth", "title": "Goo", "year": 1990,
      "label": "DGC", "format": "LP", "genre": "Rock", "style": "Noise Rock",
      "type": "Used", "vinyl": "VG+", "sleeve": "NM", "price": 3900, "stock": 1,
      "image": "images/records/VNL-RK-00017.jpg", "description": "...",
      "added": 26, "verify": false }

- `type`: `"New"` (sealed) or `"Used"`
- `vinyl` / `sleeve`: Sealed, M, NM, VG+, VG, G+, G, F/P, or Generic
- `stock`: `0` shows the record as sold out
- `added`: higher number = shows first under "Newest"
- `image`: path to the cover photo in `images/records/`
- `verify: true`: a demo flag — details still to double-check on Discogs

To add a record: drop its photo in `images/records/` and add a matching
object to the `records` array in `js/data.js`.

## Editing the café menu
Also in `js/data.js` — wait, actually in `js/app.js`, near the top: the
`MENU` constant. Each category has a name and a list of `[item, price]`
pairs. Price can be `"215"` or `"195/210"` for two sizes.

## Editing Selections
Also at the top of `js/app.js`: the `EMBEDS` constant, currently empty.
Add entries like:

    { title: "Mix name", credit: "DJ name", kind: "youtube",
      url: "https://www.youtube.com/embed/VIDEO_ID" }

`kind` can be `spotify`, `bandcamp`, `youtube`, `soundcloud`, or `iframe`
(paste any embed's `src=` URL).

## Settings
Near the top of `js/data.js`, in `config`:
- `reserveEnabled`: set to `true` to show a "Reserve on WhatsApp" button
- `whatsappNumber`: country code + number, no spaces or plus sign
- `instagram`: your handle
- `demo`: set to `false` to hide the demo notes on the site

## Demo data
Record conditions and most prices are placeholders, except Acid Pauli,
Cosmjn, Paranoid London and Nine Years of Love, which use the prices from
the shop's own stickers. The café menu is the real menu. Address, hours,
and Instagram handle are placeholders — search `js/app.js` for
"Street address goes here" and "minimusiclibrary" to update them.
