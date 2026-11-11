/* Floating feedback button for the PID2Portal pages (after the DURF feedback button).
   Two routes:
   1. Share an intervention: opens the matching issue form in surf-ori/ori-dashboard
      (01-coverage … 04-accuracy), prefilled with what was typed here.
   2. Feedback on this website: opens an issue in surf-ori/pid2portal-project.
   Both can also be sent by e-mail. Built in a shadow root, so page styles do not leak in;
   it reads the SURF Design System tokens (custom properties cross the shadow boundary).
   Edit the settings below to change where feedback goes. */
(function () {
  "use strict";

  var FEEDBACK_EMAIL = "ori@surf.nl";
  var DASHBOARD_REPO = "https://github.com/surf-ori/ori-dashboard";
  var SITE_REPO = "https://github.com/surf-ori/pid2portal-project";
  var TEMPLATES = {
    Coverage: "01-coverage.yml",
    Completeness: "02-completeness.yml",
    Enrichment: "03-enrichment.yml",
    Accuracy: "04-accuracy.yml"
  };

  if (document.getElementById("ori-feedback")) return;

  var CSS =
    ":host{all:initial}*{box-sizing:border-box}" +
    ".fab{position:fixed;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:90;display:inline-flex;align-items:center;gap:8px;" +
      "padding:12px 18px;border:0;border-radius:999px;cursor:pointer;font:700 15px/1.2 var(--font-body,system-ui,sans-serif);" +
      "background:var(--surf-orange,#e67300);color:#000;box-shadow:0 4px 14px rgba(0,0,0,.18)}" +
    ".fab:hover{background:var(--surf-orange-300,#f4a95a)}.fab:focus-visible{outline:2px solid var(--fg-1,#000);outline-offset:3px}" +
    ".fab svg{width:18px;height:18px}" +
    "@media (max-width:640px){.fab span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.fab{padding:14px}}" +
    "@media print{.fab{display:none}}" +
    "dialog{width:min(560px,calc(100vw - 32px));max-height:calc(100dvh - 32px);padding:0;border:0;border-radius:20px;" +
      "background:var(--bg-1,#fff);color:var(--fg-1,#000);font:400 16px/1.5 var(--font-body,system-ui,sans-serif);box-shadow:0 24px 48px rgba(0,0,0,.3)}" +
    "dialog::backdrop{background:rgba(0,0,0,.5)}" +
    "form{display:flex;flex-direction:column;max-height:calc(100dvh - 32px);margin:0}" +
    ".body{padding:24px 24px 8px;overflow-y:auto}" +
    "h2{margin:0 0 8px;padding-left:12px;border-left:5px solid var(--surf-orange,#e67300);font:800 24px/1.2 var(--font-display,system-ui,sans-serif);letter-spacing:-.01em}" +
    "p{margin:0 0 12px}.muted{color:var(--fg-3,#6b6b6b);font-size:14px}" +
    "a{color:var(--fg-accent-strong,#b85b00);font-weight:600}" +
    ".modes{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0 4px}" +
    ".modes label{display:flex;gap:8px;align-items:flex-start;margin:0;padding:12px;border:1px solid var(--border-1,#d9d9d9);border-radius:12px;cursor:pointer;font-weight:700;font-size:15px}" +
    ".modes label small{display:block;font-weight:400;color:var(--fg-3,#6b6b6b);font-size:13px;margin-top:2px}" +
    ".modes input{margin-top:3px;accent-color:var(--surf-orange,#e67300)}" +
    ".modes label:has(input:checked){border-color:var(--surf-orange,#e67300);background:var(--bg-accent-soft,#fff3e3)}" +
    "label.f{display:block;margin:14px 0 4px;font-weight:700;font-size:15px}" +
    "textarea,input[type=text],select{width:100%;padding:9px 11px;border:1px solid var(--border-1,#d9d9d9);border-radius:8px;background:var(--bg-1,#fff);color:inherit;font:inherit}" +
    "textarea{min-height:110px;resize:vertical}" +
    "textarea:focus,input:focus,select:focus{outline:2px solid var(--surf-orange,#e67300);outline-offset:0;border-color:transparent}" +
    ".row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}" +
    ".scale{font-size:13px;color:var(--fg-3,#6b6b6b);margin-top:6px}" +
    "[hidden]{display:none!important}" +
    ".actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;padding:16px 24px 20px;border-top:1px solid var(--border-2,#ececec)}" +
    "button{font:600 15px/1.2 var(--font-body,system-ui,sans-serif);padding:10px 16px;border-radius:10px;cursor:pointer;border:1px solid var(--border-1,#d9d9d9);background:transparent;color:inherit}" +
    "button.primary{background:var(--surf-orange,#e67300);border-color:var(--surf-orange,#e67300);color:#000}" +
    "button.ghost{border-color:transparent;margin-right:auto}" +
    "button:focus-visible{outline:2px solid var(--surf-orange,#e67300);outline-offset:2px}" +
    ".hint{margin:8px 0 0;font-size:14px;color:var(--status-error,#df3226)}" +
    "@media (max-width:480px){.modes,.row{grid-template-columns:1fr}}";

  var opt = function (list) { return list.map(function (o) { return "<option>" + o + "</option>"; }).join(""); };

  var host = document.createElement("div");
  host.id = "ori-feedback";
  var sh = host.attachShadow({ mode: "open" });
  sh.innerHTML = "<style>" + CSS + "</style>" +
    '<button class="fab" type="button" aria-haspopup="dialog">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      "<span>Feedback</span></button>" +
    '<dialog aria-labelledby="fb-title"><form method="dialog">' +
      '<div class="body">' +
        '<h2 id="fb-title">Which approach works for you?</h2>' +
        "<p>Share an intervention your institution tried or is considering, with what it took and what it brought. Together we build a shared list of interventions, scored on effort and impact. Any other remark about this website is just as welcome.</p>" +
        '<div class="modes" role="radiogroup" aria-label="What would you like to share?">' +
          '<label><input type="radio" name="mode" value="intervention" checked><span>Share an intervention<small>Goes to the ORI dashboard</small></span></label>' +
          '<label><input type="radio" name="mode" value="site"><span>Feedback on this website<small>A question, idea or typo</small></span></label>' +
        "</div>" +
        '<div id="fb-int">' +
          '<label class="f" for="fb-aspect">Which gap does it close?</label>' +
          '<select id="fb-aspect">' + opt(["Completeness", "Coverage", "Enrichment", "Accuracy"]) + "</select>" +
          '<label class="f" for="fb-ititle">Intervention</label>' +
          '<input id="fb-ititle" type="text" placeholder="e.g. Mandate ORCID at staff onboarding">' +
          '<label class="f" for="fb-idesc">What does it involve, and what did (or would) it bring?</label>' +
          '<textarea id="fb-idesc"></textarea>' +
          '<div class="row">' +
            '<div><label class="f" for="fb-status">Status</label><select id="fb-status">' + opt(["Already implemented", "Planned", "Considering"]) + "</select></div>" +
            '<div><label class="f" for="fb-effort">Effort</label><select id="fb-effort">' + opt(["Low", "Medium", "High"]) + "</select></div>" +
            '<div><label class="f" for="fb-impact">Impact</label><select id="fb-impact">' + opt(["High", "Medium", "Low"]) + "</select></div>" +
          "</div>" +
          '<p class="scale">On GitHub you can also pick your organisation and add a link. <a href="' + DASHBOARD_REPO + '/issues?q=label%3Aintervention" target="_blank" rel="noopener">See interventions shared so far</a></p>' +
        "</div>" +
        '<div id="fb-site" hidden>' +
          '<label class="f" for="fb-text">Your feedback</label>' +
          '<textarea id="fb-text" placeholder="What would you like to share?"></textarea>' +
          '<label class="f" for="fb-contact">Your name or e-mail <span class="muted">(optional, if you would like a reply)</span></label>' +
          '<input id="fb-contact" type="text" autocomplete="email">' +
        "</div>" +
        '<p class="hint" id="fb-hint" hidden>Write a few words first, then choose how to send it.</p>' +
        '<p class="muted">On GitHub your contribution becomes a public issue (you need a GitHub account). By e-mail it reaches the SURF ORI team at <a href="mailto:' + FEEDBACK_EMAIL + '">' + FEEDBACK_EMAIL + "</a>.</p>" +
      "</div>" +
      '<div class="actions">' +
        '<button type="submit" class="ghost" value="cancel">Cancel</button>' +
        '<button type="button" id="fb-mail">Send by e-mail</button>' +
        '<button type="button" class="primary" id="fb-gh">Continue on GitHub</button>' +
      "</div>" +
    "</form></dialog>";

  var $ = function (id) { return sh.getElementById(id); };
  var dlg = sh.querySelector("dialog");
  var fab = sh.querySelector(".fab");
  var hint = $("fb-hint");

  function mode() { return sh.querySelector('input[name="mode"]:checked').value; }
  function sync() {
    var site = mode() === "site";
    $("fb-int").hidden = site;
    $("fb-site").hidden = !site;
    hint.hidden = true;
  }
  sh.querySelectorAll('input[name="mode"]').forEach(function (r) { r.addEventListener("change", sync); });

  function pageUrl() { return location.href.split("#")[0]; }

  function ready() {
    var ok = mode() === "site" ? $("fb-text").value.trim() : ($("fb-ititle").value.trim() || $("fb-idesc").value.trim());
    if (ok) return true;
    hint.hidden = false;
    (mode() === "site" ? $("fb-text") : $("fb-ititle")).focus();
    return false;
  }

  function intervention() {
    var aspect = $("fb-aspect").value;
    var t = $("fb-ititle").value.trim() || "Intervention";
    return {
      aspect: aspect,
      title: "[" + aspect + "] " + t,
      fields: {
        submission_type: "Sharing an intervention",
        description: t,
        intervention_title: $("fb-ititle").value.trim(),
        intervention_description: $("fb-idesc").value.trim(),
        intervention_status: $("fb-status").value,
        effort: $("fb-effort").value,
        impact: $("fb-impact").value
      }
    };
  }

  $("fb-gh").addEventListener("click", function () {
    if (!ready()) return;
    var url;
    if (mode() === "site") {
      var body = $("fb-text").value.trim() + "\n\n" + ($("fb-contact").value ? "From: " + $("fb-contact").value + "\n" : "") + "Page: " + pageUrl() + "\n";
      url = SITE_REPO + "/issues/new?" + new URLSearchParams({ title: "Feedback: " + document.title, body: body }).toString();
    } else {
      var iv = intervention();
      var q = new URLSearchParams(Object.assign({ template: TEMPLATES[iv.aspect], title: iv.title }, iv.fields));
      url = DASHBOARD_REPO + "/issues/new?" + q.toString();
    }
    window.open(url, "_blank", "noopener");
    dlg.close();
  });

  $("fb-mail").addEventListener("click", function () {
    if (!ready()) return;
    var subject, body;
    if (mode() === "site") {
      subject = "Feedback: " + document.title;
      body = $("fb-text").value.trim() + "\n\n" + ($("fb-contact").value ? "From: " + $("fb-contact").value + "\n" : "") + "Page: " + pageUrl() + "\n";
    } else {
      var iv = intervention();
      subject = "Intervention: " + iv.title;
      body = "Gap: " + iv.aspect + "\nIntervention: " + iv.fields.intervention_title + "\n\n" + iv.fields.intervention_description +
        "\n\nStatus: " + iv.fields.intervention_status + "\nEffort: " + iv.fields.effort + "\nImpact: " + iv.fields.impact + "\n\nPage: " + pageUrl() + "\n";
    }
    location.href = "mailto:" + FEEDBACK_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    dlg.close();
  });

  function open(m) {
    if (m) { sh.querySelector('input[value="' + m + '"]').checked = true; }
    sync();
    dlg.showModal();
    (mode() === "site" ? $("fb-text") : $("fb-ititle")).focus();
  }
  fab.addEventListener("click", function () { open(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  // Links to "#share-intervention" or "#feedback" anywhere on the page open the dialog.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href="#share-intervention"], a[href="#feedback"]');
    if (!a) return;
    e.preventDefault();
    open(a.getAttribute("href") === "#feedback" ? "site" : "intervention");
  });

  function mount() { document.body.appendChild(host); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
