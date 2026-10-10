# MiniMusicLibrary — website

A single self-contained HTML file. No build step, no server, no dependencies
other than two Google Fonts loaded over the network.

## Run it locally
Double-click `index.html`. Everything — records, images, logic — is bundled
inside that one file.

## Put it on GitHub Pages
1. Create a new repository on GitHub and upload `index.html` (keep the name,
   or rename it — GitHub Pages serves whatever is at the root as `index.html`
   by default).
2. In the repository, go to Settings > Pages.
3. Under "Build and deployment", choose "Deploy from a branch", pick `main`
   and `/ (root)`, then Save.
4. After a minute the site is live at
   `https://<your-username>.github.io/<repo-name>/`.

## Editing content
Open `index.html` in any text editor and search for these markers near the
top of the big inline `<script>` block:

- `const EMBEDS = []` — Selections page. Add entries like:
  `{ title: "Mix name", credit: "DJ name", kind: "youtube", url: "https://www.youtube.com/embed/VIDEO_ID" }`
  `kind` can be `spotify`, `bandcamp`, `youtube`, `soundcloud`, or `iframe`.
- `const MENU = [...]` — the café menu. Each category has a name and a list
  of `[item, price]` pairs. Price can be `"215"` or `"195/210"` for two sizes.

Record data (the 41 records, their covers, prices, and conditions) is in the
first inline `<script>` block as `window.MML`. Each record is one object —
edit `price`, `stock`, `vinyl`, `sleeve`, etc. directly.

## What's not in this export
Two things built into the published claude.ai version don't carry over to a
plain file:
- **Runtime capabilities** (shared uploads/database) aren't wired into this
  build — Selections works purely from the `EMBEDS` list you edit by hand.
- Nothing else is missing — the cart, filters, and checkout flow are all
  plain JavaScript and work the same here as on the published page.

## Demo data
Record conditions and most prices are placeholders. The café menu reflects
the real menu as of this export. Address, hours, and Instagram handle are
placeholders — search for "Street address goes here" and
"minimusiclibrary" to update them.
