# Page content

Every section of the landing page is a Markdown file in this folder. Edit the text here; `index.html` renders it with the SURF Design System.

- `sections.json` sets which files appear, and in which order.
- `footer.md` is the footer text.

## Front matter

Each file starts with a short block between `---` lines:

```
---
layout: cards          # hero | stats | cards | features | media | band | prose
id: monitoring         # anchor, so you can link to #monitoring
nav: ORI monitoring    # label in the top navigation (leave out to hide)
eyebrow: Objective 1   # small orange label above the heading
columns: 2             # cards only: fix the number of columns
---
```

The hero also takes `image`, `image2`, `image-alt` and `image2-alt`.

## Writing conventions

- `## Heading` is the section title; the paragraphs after it are the intro.
- In `cards` and `features`, every `### Heading` starts a new card.
- Directly under a `###` heading you can add a line block with card details:

  ```
  icon: research-20          # a SURF pictogram from assets/icons/
  tags: In production, Open source
  number: 1                  # a big number instead of an icon
  date: April 2026           # a date instead of an icon (for articles)
  ```

- `![alt text](assets/img/file.jpg)` in a card becomes the card image. Paths are relative to the site root.
- A list in which every item is only a link becomes a row of buttons. The first one is the main button.
- A line with only a `video.edu.nl/w/...` link becomes an embedded video.
- In `stats`, write each item as `- **number** label`.

## Preview locally

The page loads these files with `fetch`, so open it through a small web server rather than as a file:

```bash
python3 -m http.server 8000
```

Then go to http://localhost:8000.
