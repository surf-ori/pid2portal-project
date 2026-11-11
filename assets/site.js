/* PID2Portal landing page: renders the Markdown files in content/ into SURF-styled sections.
   Conventions are documented in content/README.md. */
(function () {
  "use strict";

  var CONTENT = "content/";
  var META_KEYS = ["icon", "tags", "number", "status", "date"];

  /* ---------- helpers ---------- */

  function parseFrontMatter(text) {
    var meta = {};
    var m = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (!m) return { meta: meta, body: text };
    m[1].split("\n").forEach(function (line) {
      var kv = line.match(/^\s*([\w-]+)\s*:\s*(.*?)\s*(#.*)?$/);
      if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
    });
    return { meta: meta, body: text.slice(m[0].length) };
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function toFragment(md) {
    var t = document.createElement("template");
    t.innerHTML = window.marked.parse(md, { gfm: true });
    return t.content;
  }

  function isExternal(a) {
    return /^https?:\/\//.test(a.getAttribute("href") || "") && a.hostname !== location.hostname;
  }

  // A list item that holds nothing but one link.
  function linkOnly(li) {
    var links = li.querySelectorAll("a");
    if (links.length !== 1) return null;
    return li.textContent.trim() === links[0].textContent.trim() ? links[0] : null;
  }

  // Turn trailing link-only list items into a button row.
  function buttonize(root) {
    root.querySelectorAll("ul").forEach(function (ul) {
      if (ul.closest(".actions")) return;
      var items = Array.prototype.slice.call(ul.children);
      var k = items.length;
      while (k > 0 && linkOnly(items[k - 1])) k--;
      if (k === items.length) return;
      var row = el("div", "actions");
      items.slice(k).forEach(function (li, i) {
        var a = linkOnly(li);
        a.classList.add("button");
        if (i > 0) a.classList.add("outline");
        if (isExternal(a)) a.insertAdjacentHTML("beforeend", '<span class="arrow" aria-hidden="true">↗</span>');
        else a.insertAdjacentHTML("beforeend", '<span class="arrow" aria-hidden="true">→</span>');
        row.appendChild(a);
        li.remove();
      });
      ul.after(row);
      if (!ul.children.length) ul.remove();
    });
  }

  function embedVideos(root) {
    root.querySelectorAll("p").forEach(function (p) {
      var a = p.querySelector("a");
      if (!a || p.textContent.trim() !== a.textContent.trim()) return;
      var m = a.href.match(/^https:\/\/video\.edu\.nl\/w\/([\w-]+)/);
      if (!m) return;
      var wrap = el("div", "video");
      var f = document.createElement("iframe");
      f.src = "https://video.edu.nl/videos/embed/" + m[1];
      f.title = "Video";
      f.loading = "lazy";
      f.allowFullscreen = true;
      f.setAttribute("allow", "fullscreen");
      wrap.appendChild(f);
      p.replaceWith(wrap);
    });
  }

  function decorateLinks(root) {
    // [ORCID](https://orcid.org/…) becomes the ORCID iD icon after a name.
    root.querySelectorAll('a[href^="https://orcid.org/"]').forEach(function (a) {
      if (a.textContent.trim().toUpperCase() !== "ORCID") return;
      var id = a.getAttribute("href").split("/").pop();
      a.className = "orcid";
      a.setAttribute("aria-label", "ORCID iD " + id);
      a.title = "ORCID iD " + id;
      a.innerHTML = '<img src="assets/img/orcid.svg" alt="" width="16" height="16">';
    });
    root.querySelectorAll('a[href^="https://ror.org/"]').forEach(function (a) {
      a.title = "ROR " + a.getAttribute("href").split("/").pop();
    });
    root.querySelectorAll("a[href]").forEach(function (a) {
      if (isExternal(a)) { a.target = "_blank"; a.rel = "noopener"; }
    });
    root.querySelectorAll("img").forEach(function (img) { img.loading = "lazy"; img.decoding = "async"; });
  }

  // Read a "key: value" paragraph straight under a card heading.
  function takeMeta(nodes) {
    var meta = {};
    var first = nodes[0];
    if (!first || first.tagName !== "P") return meta;
    var lines = first.textContent.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
    var ok = lines.length && lines.every(function (l) {
      var m = l.match(/^([a-z]+)\s*:\s*(.+)$/i);
      return m && META_KEYS.indexOf(m[1].toLowerCase()) > -1;
    });
    if (!ok) return meta;
    lines.forEach(function (l) {
      var m = l.match(/^([a-z]+)\s*:\s*(.+)$/i);
      meta[m[1].toLowerCase()] = m[2];
    });
    nodes.shift();
    return meta;
  }

  function tagsHtml(tags) {
    if (!tags) return "";
    var tones = ["orange", "blue", "green", "purple"];
    return '<div class="tags">' + tags.split(",").map(function (t, i) {
      t = t.trim();
      var tone = /production|live/i.test(t) ? "green" : tones[i % tones.length];
      return '<span class="tag tone-' + tone + '">' + escapeHtml(t) + "</span>";
    }).join("") + "</div>";
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Split the children of a fragment into an intro and groups that each start with an <h3>.
  function splitByH3(frag) {
    var intro = [], groups = [], cur = null;
    Array.prototype.slice.call(frag.childNodes).forEach(function (n) {
      if (n.nodeType === 3 && !n.textContent.trim()) return;
      if (n.tagName === "H3") { cur = { head: n, nodes: [] }; groups.push(cur); }
      else if (cur) cur.nodes.push(n);
      else intro.push(n);
    });
    return { intro: intro, groups: groups };
  }

  // Pull the first standalone image out of a group of nodes.
  function takeImage(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.tagName === "P" && n.children.length === 1 && n.firstElementChild.tagName === "IMG" && !n.textContent.trim()) {
        nodes.splice(i, 1);
        return n.firstElementChild;
      }
    }
    return null;
  }

  function takeImagePeek(nodes) {
    return nodes.some(function (n) { return n.tagName === "P" && n.children.length === 1 && n.firstElementChild.tagName === "IMG" && !n.textContent.trim(); });
  }

  function sectionHeader(meta, introNodes) {
    var head = el("div", "section-head");
    if (meta.eyebrow) head.appendChild(el("p", "eyebrow", escapeHtml(meta.eyebrow)));
    introNodes.forEach(function (n) { head.appendChild(n); });
    return head;
  }

  /* ---------- layouts ---------- */

  var layouts = {
    hero: function (frag, meta, inner) {
      var grid = el("div", "hero-grid");
      var text = el("div", "hero-text");
      if (meta.eyebrow) text.appendChild(el("p", "eyebrow", escapeHtml(meta.eyebrow)));
      text.appendChild(frag);
      grid.appendChild(text);
      if (meta.image) {
        var vis = el("div", "hero-visual");
        // Template cover: coloured rounded blocks behind the screenshots.
        vis.innerHTML = '<span class="blk blk-orange" aria-hidden="true"></span><span class="blk blk-yellow" aria-hidden="true"></span><span class="blk blk-green" aria-hidden="true"></span><span class="blk blk-peach" aria-hidden="true"></span>' +
          '<figure class="frame frame-a"><img src="' + meta.image + '" alt="' + escapeHtml(meta["image-alt"] || "") + '"></figure>' +
          (meta.image2 ? '<figure class="frame frame-b"><img src="' + meta.image2 + '" alt="' + escapeHtml(meta["image2-alt"] || "") + '"></figure>' : "");
        grid.appendChild(vis);
      }
      inner.appendChild(grid);
    },

    stats: function (frag, meta, inner) {
      var list = el("ul", "stats");
      frag.querySelectorAll("li").forEach(function (li) {
        var strong = li.querySelector("strong");
        var item = el("li", "stat");
        if (strong) {
          item.appendChild(el("span", "stat-value", strong.innerHTML));
          strong.remove();
        }
        item.appendChild(el("span", "stat-label", li.innerHTML.trim()));
        list.appendChild(item);
      });
      inner.appendChild(list);
    },

    cards: function (frag, meta, inner) {
      var parts = splitByH3(frag);
      inner.appendChild(sectionHeader(meta, parts.intro));
      var grid = el("div", "card-grid");
      if (meta.columns) grid.style.setProperty("--cols", meta.columns);
      var anyImg = parts.groups.some(function (o) { return takeImagePeek(o.nodes); });
      parts.groups.forEach(function (g) {
        var cm = takeMeta(g.nodes);
        var img = takeImage(g.nodes);
        var card = el("article", "card deliverable");
        if (img) {
          var media = el("figure", "card-media");
          media.appendChild(img);
          card.appendChild(media);
        } else if (cm.icon && !cm.number && anyImg) {
          // Keep rows even: a card without a picture in a grid with pictures shows its pictogram large.
          var ph = el("div", "card-media card-media-icon");
          ph.innerHTML = '<img class="pictogram pictogram-lg" src="assets/icons/' + encodeURIComponent(cm.icon) + '.svg" alt="">';
          card.appendChild(ph);
          cm.bigIcon = true;
        }
        var body = el("div", "card-body");
        var top = el("div", "card-top");
        if (cm.date) top.appendChild(el("span", "card-date", escapeHtml(cm.date)));
        else if (cm.number) top.appendChild(el("span", "card-number", escapeHtml(cm.number)));
        else if (cm.icon && !cm.bigIcon) top.innerHTML = '<img class="pictogram" src="assets/icons/' + encodeURIComponent(cm.icon) + '.svg" alt="">';
        top.insertAdjacentHTML("beforeend", tagsHtml(cm.tags));
        body.appendChild(top);
        body.appendChild(g.head);
        g.nodes.forEach(function (n) { body.appendChild(n); });
        card.appendChild(body);
        grid.appendChild(card);
      });
      inner.appendChild(grid);
    },

    features: function (frag, meta, inner) {
      var parts = splitByH3(frag);
      inner.appendChild(sectionHeader(meta, parts.intro));
      parts.groups.forEach(function (g, i) {
        var cm = takeMeta(g.nodes);
        var img = takeImage(g.nodes);
        var row = el("article", "feature" + (i % 2 ? " flip" : ""));
        if (img) {
          var fig = el("figure", "frame feature-media");
          fig.appendChild(img);
          row.appendChild(fig);
        }
        var text = el("div", "feature-text");
        text.insertAdjacentHTML("beforeend", tagsHtml(cm.tags));
        text.appendChild(g.head);
        g.nodes.forEach(function (n) { text.appendChild(n); });
        row.appendChild(text);
        inner.appendChild(row);
      });
    },

    media: function (frag, meta, inner) {
      var head = [], rest = [];
      Array.prototype.slice.call(frag.childNodes).forEach(function (n) {
        if (n.nodeType === 3 && !n.textContent.trim()) return;
        (n.classList && n.classList.contains("video") ? rest : (rest.length ? rest : head)).push(n);
      });
      var grid = el("div", "media-grid");
      var text = sectionHeader(meta, head);
      grid.appendChild(text);
      var side = el("div", "media-side");
      rest.forEach(function (n) {
        if (n.classList && n.classList.contains("video")) {
          var frame = el("div", "frame video-frame");
          frame.appendChild(n);
          side.appendChild(frame);
        } else text.appendChild(n);
      });
      grid.appendChild(side);
      inner.appendChild(grid);
    },

    statement: function (frag, meta, inner) {
      // Template "ambition" slide: label between two lines, one big statement.
      var box = el("div", "statement");
      if (meta.eyebrow) box.appendChild(el("p", "statement-label", escapeHtml(meta.eyebrow)));
      Array.prototype.slice.call(frag.childNodes).forEach(function (n) {
        if (n.tagName === "P" && !box.querySelector(".statement-text")) n.className = "statement-text";
        box.appendChild(n);
      });
      inner.appendChild(box);
    },

    timeline: function (frag, meta, inner) {
      // Template "timeline": a line with coloured date pills, text under each.
      var intro = [];
      var list = null;
      Array.prototype.slice.call(frag.childNodes).forEach(function (n) {
        if (n.tagName === "UL" && !list) list = n; else if (n.nodeType !== 3 || n.textContent.trim()) intro.push(n);
      });
      inner.appendChild(sectionHeader(meta, intro));
      var ol = el("ol", "timeline");
      if (list) Array.prototype.slice.call(list.children).forEach(function (li) {
        var item = el("li", "tl-item");
        var strong = li.querySelector("strong");
        if (strong) { item.appendChild(el("span", "tl-pill", strong.innerHTML)); strong.remove(); }
        item.appendChild(el("span", "tl-text", li.innerHTML.trim()));
        ol.appendChild(item);
      });
      ol.style.setProperty("--n", ol.children.length);
      inner.appendChild(ol);
    },

    band: function (frag, meta, inner) {
      var box = el("div", "band-box");
      box.appendChild(sectionHeader(meta, Array.prototype.slice.call(frag.childNodes)));
      inner.appendChild(box);
    },

    prose: function (frag, meta, inner) {
      var box = el("div", "prose");
      box.appendChild(sectionHeader(meta, Array.prototype.slice.call(frag.childNodes)));
      inner.appendChild(box);
    }
  };

  /* ---------- rendering ---------- */

  function renderSection(name, text) {
    var parsed = parseFrontMatter(text);
    var meta = parsed.meta;
    var layout = layouts[meta.layout] ? meta.layout : "prose";
    var frag = toFragment(parsed.body);
    embedVideos(frag);
    buttonize(frag);
    decorateLinks(frag);

    var section = el("section", "section layout-" + layout);
    section.id = meta.id || name.replace(/\.md$/, "").replace(/^\d+-/, "");
    section.dataset.source = CONTENT + name;
    var inner = el("div", "wrap");
    layouts[layout](frag, meta, inner);
    section.appendChild(inner);
    var label = section.querySelector("h1, h2");
    if (label) {
      if (!label.id) label.id = section.id + "-title";
      section.setAttribute("aria-labelledby", label.id);
    }
    return { section: section, nav: meta.nav };
  }

  function fetchText(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(url + " (" + r.status + ")");
      return r.text();
    });
  }

  function showError(err) {
    var box = document.getElementById("sections");
    box.innerHTML = "";
    var w = el("div", "wrap");
    w.innerHTML =
      '<div role="alert" data-variant="error"><strong>The page content could not be loaded.</strong> ' +
      escapeHtml(String(err && err.message || err)) +
      '. Opening <code>index.html</code> straight from disk does not work; start a small web server in this folder with <code>python3 -m http.server</code> and go to <code>http://localhost:8000</code>.</div>';
    box.appendChild(w);
  }

  function setupNav(entries) {
    var nav = document.getElementById("nav");
    entries.forEach(function (e) {
      if (!e.nav) return;
      var a = el("a", null, escapeHtml(e.nav));
      a.href = "#" + e.section.id;
      nav.appendChild(a);
    });
    if (!("IntersectionObserver" in window)) return;
    var links = nav.querySelectorAll("a");
    var io = new IntersectionObserver(function (obs) {
      obs.forEach(function (o) {
        if (!o.isIntersecting) return;
        links.forEach(function (l) {
          if (l.getAttribute("href") === "#" + o.target.id) l.setAttribute("aria-current", "true");
          else l.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    entries.forEach(function (e) { if (e.nav) io.observe(e.section); });
  }

  function start() {
    if (!window.marked) { showError(new Error("the Markdown library did not load")); return; }
    fetchText(CONTENT + "sections.json")
      .then(function (t) {
        var files = JSON.parse(t);
        return Promise.all(files.map(function (f) {
          return fetchText(CONTENT + f).then(function (txt) { return renderSection(f, txt); });
        }));
      })
      .then(function (entries) {
        var box = document.getElementById("sections");
        box.innerHTML = "";
        entries.forEach(function (e) { box.appendChild(e.section); });
        setupNav(entries);
        if (location.hash) {
          var target = document.getElementById(location.hash.slice(1));
          if (target) target.scrollIntoView();
        }
      })
      .catch(showError);

    fetchText(CONTENT + "footer.md").then(function (t) {
      var f = toFragment(parseFrontMatter(t).body);
      decorateLinks(f);
      document.getElementById("footer").appendChild(f);
    }).catch(function () {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
