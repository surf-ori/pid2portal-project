/* SURF theme switch: light, system or dark, after the DURF design system (durf-nav.js).
   window.SURFTheme: init(), get(), set("light"|"system"|"dark"), cycle(), resolved().
   <surf-theme-toggle> renders a three-way switch; add the attribute compact for a single cycling button.
   The choice is kept in localStorage under "surf-theme"; "system" removes it and follows the OS.
   With nothing chosen yet, a data-theme the page already set is left alone until someone picks a theme.
   Load this file in <head> and call SURFTheme.init() right after it, before first paint. */
(function () {
  var KEY = 'surf-theme';
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var started = false;
  var owned = false; // false while a host page (or preview frame) set data-theme and nothing was chosen here

  function read() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : 'system'; }
    catch (e) { return 'system'; }
  }
  function resolved(pref) {
    pref = pref || read();
    if (pref === 'system') return media && media.matches ? 'dark' : 'light';
    return pref;
  }
  function apply() {
    root.setAttribute('data-theme', resolved());
    var els = document.querySelectorAll('surf-theme-toggle');
    for (var i = 0; i < els.length; i++) if (els[i].paint) els[i].paint();
  }
  function init() {
    if (started) return;
    started = true;
    if (read() !== 'system' || !root.hasAttribute('data-theme')) { owned = true; apply(); }
    if (media) {
      var onChange = function () { if (owned && read() === 'system') apply(); };
      if (media.addEventListener) media.addEventListener('change', onChange); else if (media.addListener) media.addListener(onChange);
    }
    window.addEventListener('storage', function (e) { if (e.key === KEY) { owned = true; apply(); } });
  }
  function set(pref) {
    try { if (pref === 'light' || pref === 'dark') localStorage.setItem(KEY, pref); else localStorage.removeItem(KEY); } catch (e) {}
    if (!started) init();
    owned = true;
    apply();
    try { root.dispatchEvent(new CustomEvent('surf-theme-change', { detail: { theme: read(), resolved: resolved() } })); } catch (e) {}
  }
  var NEXT = { system: 'light', light: 'dark', dark: 'system' };
  function cycle() { set(NEXT[read()]); }

  window.SURFTheme = { init: init, get: read, set: set, cycle: cycle, resolved: function () { return resolved(); } };

  var ICON = {
    light: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    system: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
    dark: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'
  };
  var ORDER = ['light', 'system', 'dark'];

  if (window.customElements && !customElements.get('surf-theme-toggle')) {
    customElements.define('surf-theme-toggle', class extends HTMLElement {
      static get observedAttributes() { return ['compact', 'labels']; }
      label(t) {
        var dflt = { light: 'Licht', system: 'Systeem', dark: 'Donker' };
        return this.getAttribute('label-' + t) || dflt[t];
      }
      connectedCallback() { init(); this.render(); }
      attributeChangedCallback() { if (this.isConnected) this.render(); }
      render() {
        var self = this, compact = this.hasAttribute('compact'), labels = this.getAttribute('labels') === 'visible';
        this.innerHTML = '';
        if (compact) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'surf-theme-toggle__cycle';
          b.addEventListener('click', function () { cycle(); });
          this.appendChild(b);
        } else {
          var g = document.createElement('div');
          g.className = 'surf-theme-toggle__group';
          g.setAttribute('role', 'radiogroup');
          g.setAttribute('aria-label', this.getAttribute('label') || 'Thema');
          ORDER.forEach(function (t) {
            var o = document.createElement('button');
            o.type = 'button';
            o.className = 'surf-theme-toggle__option';
            o.setAttribute('role', 'radio');
            o.dataset.value = t;
            o.innerHTML = ICON[t] + '<span' + (labels ? '' : ' class="surf-theme-toggle__sr"') + '>' + self.label(t) + '</span>';
            if (!labels) o.title = self.label(t);
            o.addEventListener('click', function () { set(t); });
            o.addEventListener('keydown', function (e) {
              var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
              if (!d) return;
              e.preventDefault();
              var n = ORDER[(ORDER.indexOf(read()) + d + 3) % 3];
              set(n);
              var next = g.querySelector('[data-value="' + n + '"]');
              if (next) next.focus();
            });
            g.appendChild(o);
          });
          this.appendChild(g);
        }
        this.paint();
      }
      paint() {
        var cur = read();
        var c = this.querySelector('.surf-theme-toggle__cycle');
        if (c) {
          var name = (this.getAttribute('label') || 'Thema') + ': ' + this.label(cur).toLowerCase();
          c.innerHTML = ICON[cur];
          c.setAttribute('aria-label', name);
          c.title = name;
        }
        var opts = this.querySelectorAll('.surf-theme-toggle__option');
        for (var i = 0; i < opts.length; i++) {
          var on = opts[i].dataset.value === cur;
          opts[i].setAttribute('aria-checked', on ? 'true' : 'false');
          opts[i].tabIndex = on ? 0 : -1;
        }
      }
    });
  }
})();
