# PID2Portal project page

Landing page for **PID2Portal** (PID to Portal), a SURF project to improve Dutch open research information, funded by Universities of the Netherlands (2025–2026). It brings all deliverables together in one place.

Live at: https://surf-ori.github.io/pid2portal-project/

## Editing the texts

All texts live as Markdown in [`content/`](content/). Edit a file there and the page follows; no build step. See [`content/README.md`](content/README.md) for the conventions (cards, tags, icons, buttons, video).

## Structure

```
index.html          page shell: top bar, footer, SURF Design System
assets/site.js      renders content/*.md into sections
assets/vendor/      marked 12.0.2 (Markdown parser, MIT)
assets/site.css     page layout, on top of the SURF tokens
assets/img/         screenshots and figures (from the deliverables and the PID Fest slides)
assets/icons/       SURF pictograms used on the cards
content/            the editable texts, one Markdown file per section
.nojekyll           tells GitHub Pages to serve the Markdown files as they are
```

## Preview locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Design

Built with the [SURF Design System](https://github.com/surf-ori/surf-design-system), loaded from `surf-ori.github.io/surf-design-system`. Light and dark theme follow the system setting, with a toggle in the top bar.
