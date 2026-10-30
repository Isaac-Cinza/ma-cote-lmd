/* © Isaac CINZA — logique de calcul LMD */
(function () {
  "use strict";

  var D = window.DATA;
  var $ = function (id) { return document.getElementById(id); };
  var et = $("et"), fa = $("fa"), pr = $("pr"), app = $("app");

  /* ---------- Règles de décision ---------- */
  var ET = function () { return D[et.value]; };
  var FA = function () { return ET().facultes[fa.value]; };
  var PR = function () { return FA().promotions[pr.value]; };
  var R = function () { return ET().regles; };
  var pick = function (tab, m, def) { for (var i = 0; i < tab.length; i++) if (m >= tab[i][0]) return tab[i][1]; return def; };
  var mention = function (m) { return pick(R().mentions, m, "Ajourné"); };
  var lettre = function (m) { return pick(R().lettres, m, "F"); };
  /* Mention affichée : jamais en cas d'ajournement, et seulement en VT si la faculté le décide */
  function mentionLabel(moy, kind, any) {
    if (!any) return "–";
    if (kind === "aj") return "Ajourné";
    if (kind === "vp" && R().mentionVT) return "Pas de mention en VP";
    return mention(moy) + " (" + lettre(moy) + ")";
  }

  /* ---------- Utilitaires ---------- */
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var toastTimer;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("on"); }, 2200);
  }
  var opts = function (el, arr) {
    el.innerHTML = arr.map(function (x, i) { return '<option value="' + i + '">' + esc(x.nom) + "</option>"; }).join("");
  };
  var num = function (el) {
    var s = el.value.trim().replace(",", ".");
    return s === "" ? 0 : Number(s);
  };
  var storageKey = function () { return "cinza-lmd:notes:" + et.value + ":" + fa.value + ":" + pr.value; };

  var ueName = function (n) { return /^UE non/.test(n) ? "Matières du semestre" : n; };

  /* ---------- Construction de l'écran ---------- */
  function build() {
    var p = PR();
    app.innerHTML = p.semestres.map(function (s, si) {
      var semCredits = s.ues.reduce(function (a, u) { return a + u.cours.reduce(function (b, c) { return b + c[1]; }, 0); }, 0);
      var head = '<h3 class="sem">' + esc(s.nom) + "<em>" + semCredits + " crédits</em></h3>";
      return head + s.ues.map(function (u, ui) {
        var id = si + "_" + ui;
        var lbl = /^UE non/.test(u.nom) ? s.nom : s.nom + " · " + u.nom;
        var rows = u.cours.map(function (c) {
          return '<div class="row" data-u="' + id + '" data-cr="' + c[1] + '">' +
            '<div class="nm">' + esc(c[0]) + "<span>" + c[1] + " crédit" + (c[1] > 1 ? "s" : "") + "</span></div>" +
            '<div class="in">' +
            '<div><label>TJ/10</label><input inputmode="decimal" autocomplete="off" enterkeyhint="next"></div>' +
            '<div><label>EXAM/10</label><input inputmode="decimal" autocomplete="off" enterkeyhint="next"></div>' +
            '<div><label>Cote/20</label><input inputmode="decimal" autocomplete="off" enterkeyhint="next" placeholder="auto"></div>' +
            "</div></div>";
        }).join("");
        return "<section data-lbl=\"" + esc(lbl) + "\"><h2>" + esc(ueName(u.nom)) + "</h2>" + rows + '<div class="uem" id="u' + id + '"></div></section>';
      }).join("");
    }).join("");
    restore();
    calc();
  }

  /* ---------- Enregistrement local des notes ---------- */
  function save() {
    var vals = Array.prototype.map.call(app.querySelectorAll("input"), function (i) { return i.value; });
    store.set(storageKey(), JSON.stringify(vals));
  }
  function restore() {
    var raw = store.get(storageKey());
    if (!raw) return;
    try {
      var vals = JSON.parse(raw), inputs = app.querySelectorAll("input");
      if (vals.length !== inputs.length) return;
      for (var i = 0; i < inputs.length; i++) inputs[i].value = vals[i];
    } catch (e) {}
  }

  /* ---------- Calcul ---------- */
  var last = null;
  function calc() {
    var g = {}, bad = false, any = false, list = [];
    app.querySelectorAll(".row").forEach(function (r) {
      var inp = r.querySelectorAll("input"), a = inp[0], b = inp[1], c = inp[2];
      var x = num(a), y = num(b), z = num(c), cr = +r.dataset.cr;
      var ba = isNaN(x) || x < 0 || x > 10, bb = isNaN(y) || y < 0 || y > 10, bc = isNaN(z) || z < 0 || z > 20;
      a.classList.toggle("bad", ba);
      b.classList.toggle("bad", bb);
      c.classList.toggle("bad", bc);
      c.placeholder = (a.value.trim() || b.value.trim()) && !ba && !bb ? +(x + y).toFixed(2) : "auto";
      if (ba || bb || bc) { bad = true; return; }
      var cote = c.value.trim() !== "" ? z : x + y;
      var o = g[r.dataset.u] || (g[r.dataset.u] = { p: 0, c: 0, t: false });
      o.p += cote * cr;
      o.c += cr;
      var touched = !!(a.value.trim() || b.value.trim() || c.value.trim());
      if (touched) { o.t = true; any = true; }
      list.push({ n: r.querySelector(".nm").firstChild.textContent, cr: cr, id: r.dataset.u, t: touched, p: cote * cr, lbl: r.parentNode.dataset.lbl });
    });

    var tot = 0, pts = 0, nv = 0, ues = {};
    for (var id in g) {
      var o = g[id], m = o.p / o.c, ok = m >= R().seuilUE, el = $("u" + id), sc = el.parentNode;
      ues[id] = { m: m, ok: ok, t: o.t };
      tot += o.c;
      pts += o.p;
      if (!ok) nv += o.c;
      el.className = "uem";
      if (!o.t) {
        sc.className = "";
        el.innerHTML = '<span>Moyenne UE</span><span class="chip">En attente</span>';
        continue;
      }
      sc.className = ok ? "ok" : "ko";
      el.innerHTML = "<span>Moyenne UE <b>" + fr(m.toFixed(2)) + '</b></span><span class="chip ' + (ok ? "ok" : "ko") + '">' + (ok ? "Validée" : "Non validée") + "</span>";
    }

    var val = tot - nv, pct = val / tot * 100, moy = pts / tot, fin;
    var rest = list.reduce(function (a, x) { return a + (x.t ? 0 : x.cr); }, 0);
    if (bad) fin = ["ko", "Corrigez les notes en rouge"];
    else if (!any) fin = ["", "Saisissez les notes pour voir la décision"];
    else if (moy >= R().seuilAnnee) fin = val === tot ? ["ok", "Validation Totale (VT)"] : pct >= R().partielMin ? ["ok", "Validation Partielle (VP)"] : ["ko", "Ajourné (crédits validés insuffisants)"];
    else fin = ["ko", "Ajourné (moyenne annuelle insuffisante)"];
    var kind = bad || !any ? "" : /^Validation Totale/.test(fin[1]) ? "vt" : /^Validation Partielle/.test(fin[1]) ? "vp" : "aj";

    $("dl").innerHTML =
      '<div class="top"><div><small>Moyenne annuelle</small><div class="big">' + fr(moy.toFixed(2)) + "</div></div>" +
      '<div class="mn">' + mentionLabel(moy, kind, any) + "</div></div>" +
      '<div class="pb"><i style="width:' + pct.toFixed(1) + '%"></i></div>' +
      '<p class="pt">' + val + " crédits validés sur " + tot + " (" + fr(pct.toFixed(1)) + " %)</p>" +
      (rest > 0 && any ? '<p class="pt prov">Résultat provisoire : les ' + rest + " crédits sans note comptent pour 0 pour l’instant.</p>" : "") +
      '<div class="tiles"><div><small>Crédits</small><b>' + tot + "</b></div><div><small>Validés</small><b>" + val + "</b></div>" +
      "<div><small>Non validés</small><b>" + nv + "</b></div><div><small>Total pondéré</small><b>" + fr(+pts.toFixed(2)) + "</b></div></div>";

    var provisional = any && !bad && rest > 0;
    var short = provisional ? "Provisoire" : any && !bad ? fin[1].split(" (")[0].replace("Validation Totale", "VT").replace("Validation Partielle", "VP") : "…";
    $("bar").innerHTML =
      "<div><small>Moyenne</small><b>" + fr(moy.toFixed(2)) + "</b></div>" +
      "<div><small>Crédits validés</small><b>" + val + "/" + tot + "</b></div>" +
      '<span class="chip ' + (provisional ? "" : fin[0]) + '">' + short + "</span>";

    var f = $("fin");
    f.className = fin[0];
    f.textContent = "DÉCISION FINALE : " + fin[1];

    last = { any: any, bad: bad, moy: moy, val: val, tot: tot, nv: nv, pts: pts, decision: fin[1], kind: kind, ues: ues, rest: rest };
    objective(list, tot, pts, bad);
  }

  /* ---------- Fiche de résultats (personnelle, non officielle) ---------- */
  var fmt = function (v) { return +v.toFixed(2); };
  var fr = function (t) { return String(t).replace(".", ","); };
  var FOOT = "Fiche de calcul personnelle établie à partir des notes saisies par l’utilisateur. Elle n’a aucune valeur officielle : seul le procès-verbal de la faculté fait foi.";

  /* Modèle de données unique, utilisé pour l'impression HTML et pour le PDF */
  function reportModel() {
    var p = PR(), rows = app.querySelectorAll(".row"), k = 0;
    var m = {
      fac: FA().nom, promo: p.nom, sems: [],
      foot: FOOT + (last.rest > 0 ? " Résultat provisoire : " + last.rest + " crédits sans note comptent pour 0." : ""),
      date: "Édité le " + new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      sum: {
        moy: fr(last.moy.toFixed(2)), mention: mentionLabel(last.moy, last.kind, last.any),
        val: last.val, tot: last.tot, decision: last.decision,
        cls: /^Validation/.test(last.decision) ? "ok" : /^Ajourn/.test(last.decision) ? "ko" : ""
      }
    };
    p.semestres.forEach(function (s, si) {
      var sem = { nom: s.nom, ues: [] };
      s.ues.forEach(function (u, ui) {
        var ue = last.ues[si + "_" + ui], o = { nom: ueName(u.nom), rows: [] };
        u.cours.forEach(function (c) {
          var inp = rows[k++].querySelectorAll("input"), a = inp[0].value.trim(), b = inp[1].value.trim(), z = inp[2].value.trim();
          o.rows.push({ n: c[0], c: String(c[1]), a: fr(a), b: fr(b), cote: z !== "" ? fr(fmt(num(inp[2]))) : (a || b) ? fr(fmt(num(inp[0]) + num(inp[1]))) : "" });
        });
        o.avg = ue && ue.t ? fr(ue.m.toFixed(2)) : "–";
        o.status = !ue || !ue.t ? "En attente" : ue.ok ? "Validée" : "Non validée";
        o.cls = !ue || !ue.t ? "" : ue.ok ? "ok" : "ko";
        sem.ues.push(o);
      });
      m.sems.push(sem);
    });
    return m;
  }

  /* Version HTML (navigateur, Windows) : n'est visible qu'à l'impression */
  function buildPrint() {
    if (!last) return;
    var m = reportModel();
    var html = '<div class="pv-head"><div><div class="pv-k">Ma Cote LMD</div><h1>' + esc(m.fac) + '</h1><div class="pv-s">' + esc(m.promo) + '</div></div><div class="pv-d">' + esc(m.date) + "</div></div>";
    m.sems.forEach(function (s) {
      html += "<h2>" + esc(s.nom) + "</h2>";
      s.ues.forEach(function (u) {
        html += '<table><thead><tr><th class="l">' + esc(u.nom) + "</th><th>Crédits</th><th>TJ/10</th><th>EXAM/10</th><th>Cote/20</th></tr></thead><tbody>";
        u.rows.forEach(function (r) {
          html += '<tr><td class="l">' + esc(r.n) + "</td><td>" + r.c + "</td><td>" + esc(r.a) + "</td><td>" + esc(r.b) + "</td><td><b>" + r.cote + "</b></td></tr>";
        });
        html += '<tr class="ue"><td class="l" colspan="4">Moyenne de l’UE : ' + u.avg + '</td><td class="' + u.cls + '">' + u.status + "</td></tr></tbody></table>";
      });
    });
    html += '<div class="pv-sum"><div><span>Moyenne annuelle</span><b>' + m.sum.moy + " / 20</b></div><div><span>Mention</span><b>" + esc(m.sum.mention) + "</b></div>" +
      "<div><span>Crédits validés</span><b>" + m.sum.val + " / " + m.sum.tot + '</b></div><div class="dec"><span>Décision</span><b>' + esc(m.sum.decision) + "</b></div></div>" +
      '<p class="pv-foot">' + esc(m.foot) + "<br>© Isaac CINZA · isaaccinza730@gmail.com</p>";
    $("pv").innerHTML = html;
  }
  window.addEventListener("beforeprint", buildPrint);

  /* Application Android : PDF généré puis ouvert dans la feuille de partage / d'impression */
  var isNative = function () { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); };
  function pdfNative() {
    var P = window.Capacitor.Plugins || {};
    if (!P.Filesystem || !P.Share) { toast("Module PDF indisponible : mettez l’application à jour"); return; }
    var name = "Fiche-" + PR().nom.split(" (")[0].replace(/[^A-Za-z0-9]+/g, "-") + ".pdf";
    var data;
    try { data = window.makePdf(reportModel()); } catch (e) { toast("Création du PDF impossible"); return; }
    P.Filesystem.writeFile({ path: name, data: data, directory: "CACHE" })
      .then(function (r) { return P.Share.share({ title: "Ma Cote LMD · Fiche de résultats", url: r.uri, dialogTitle: "Imprimer ou enregistrer la fiche" }); })
      .catch(function (e) { if (!e || !/cancel/i.test(String(e.message || e))) toast("Impossible d’ouvrir la fiche PDF"); });
  }

  function printSheet() {
    if (!last || !last.any || last.bad) { toast("Saisissez des notes valides d’abord"); return; }
    if (isNative()) { pdfNative(); return; }
    buildPrint();
    try { window.print(); } catch (e) { toast("Impression indisponible sur cet appareil"); }
  }

  /* ---------- Partage du résultat ---------- */
  function shareText() {
    var fac = FA().nom, promo = PR().nom;
    return fac + " — " + promo + "\n" +
      "Moyenne annuelle : " + fr(last.moy.toFixed(2)) + "/20 (" + mentionLabel(last.moy, last.kind, last.any) + ")\n" +
      "Crédits validés : " + last.val + "/" + last.tot + "\n" +
      "Décision : " + last.decision + "\n" +
      "Calculé avec Ma Cote LMD · par Isaac CINZA";
  }
  function sendText(text) {
    if (navigator.share) navigator.share({ text: text }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { toast("Résultat copié"); }, function () { toast("Copie impossible"); });
    else toast("Partage non disponible");
  }
  function share() {
    if (!last || !last.any || last.bad) { toast("Saisissez des notes valides d’abord"); return; }
    sendText(shareText());
  }

  /* ---------- Mon objectif ---------- */
  var OBJ = [];
  function buildObjOptions() {
    var r = R(), keep = $("ob").value;
    OBJ = [["vt", "Valider toute l’année (VT)", r.seuilAnnee]].concat(r.mentions.filter(function (m) { return m[0] > r.seuilAnnee; }).slice().reverse().map(function (m) { return [String(m[0]), m[1] + " (" + m[0] + "/20)", m[0]]; }));
    $("ob").innerHTML = OBJ.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + "</option>"; }).join("");
    var sv = keep || store.get("cinza-lmd:obj");
    if (sv && OBJ.some(function (o) { return o[0] === sv; })) $("ob").value = sv;
  }
  var up2 = function (v) { return fr(+(Math.ceil(v * 100 - 1e-9) / 100).toFixed(2)); };
  $("ob").onchange = function () { store.set("cinza-lmd:obj", $("ob").value); calc(); };

  function objective(list, tot, pts, bad) {
    var out = $("oo"), sel = $("ob").value;
    var target = OBJ.filter(function (o) { return o[0] === sel; })[0][2];
    if (bad) { out.innerHTML = '<p class="om ko">Corrigez d’abord les notes en rouge.</p>'; return; }

    var U = {}, RC = 0, left = [];
    list.forEach(function (x) {
      var u = U[x.id] || (U[x.id] = { c: 0, p: 0, r: 0, lbl: x.lbl });
      u.c += x.cr; u.p += x.p;
      if (!x.t) { u.r += x.cr; RC += x.cr; left.push(x); }
    });

    /* Besoin par UE : moyenne minimale à obtenir sur ses cours restants pour atteindre 10 */
    var lost = null, danger = [], pool = 0, maxUE = 0;
    Object.keys(U).forEach(function (id) {
      var u = U[id];
      if (u.r > 0) {
        var need = (R().seuilUE * u.c - u.p) / u.r;
        if (need > 0) { danger.push({ lbl: u.lbl, need: need }); pool += need * u.r; if (need > maxUE) maxUE = need; }
      } else if (u.p / u.c < R().seuilUE && !lost) lost = u.lbl;
    });

    /* Besoin global pour la mention visée (l’année doit aussi être validée) */
    var needAll = sel === "vt" ? 0 : (RC > 0 ? (target * tot - pts) / RC : (pts / tot >= target ? -1 : Infinity));
    var strict = sel === "vt" || R().mentionVT;
    var eff = RC > 0 ? (strict ? Math.max(needAll, pool / RC) : needAll) : (needAll === Infinity ? Infinity : -1);
    var maxMoy = (pts + 20 * RC) / tot, msg, cls = "", details = "";

    if (lost || eff > 20 || maxUE > 20) {
      cls = "ko";
      msg = lost ? "Objectif hors d’atteinte : « " + esc(lost) + " » est déjà sous 10 et n’a plus de cours à venir."
        : sel === "vt" ? "Objectif hors d’atteinte : même avec 20/20 partout sur les cours restants, une UE ne peut plus atteindre 10."
        : "Objectif hors d’atteinte : même avec 20/20 partout sur les cours restants, il ne peut pas être atteint (moyenne maximale possible : " + fr(maxMoy.toFixed(2)) + "/20).";
    } else if (eff <= 0) {
      cls = "ok";
      msg = RC > 0 ? "Objectif sécurisé : même avec 0 sur les cours restants, vous l’atteignez." : "Objectif atteint.";
    } else {
      msg = "Il vous faut en moyenne <b>" + up2(eff) + "/20</b> sur les " + RC + " crédits restants.";
      var top = left.slice().sort(function (a, b) { return b.cr - a.cr; }).slice(0, 3);
      details += '<h4 class="oh">Cours à privilégier</h4><ul class="ol">' + top.map(function (x) {
        return "<li><b>" + esc(x.n) + "</b><span>" + x.cr + " crédit" + (x.cr > 1 ? "s" : "") + " · " + Math.round(x.cr / RC * 100) + " % des crédits restants · chaque point gagné ajoute +" + fr((x.cr / tot).toFixed(2)) + " à votre moyenne</span></li>";
      }).join("") + "</ul>";
      if (danger.length) {
        danger.sort(function (a, b) { return b.need - a.need; });
        details += '<h4 class="oh">UE à sécuriser</h4><ul class="ol">' + danger.slice(0, 3).map(function (d) {
          return "<li><b>" + esc(d.lbl) + "</b><span>au moins " + up2(d.need) + "/20 de moyenne sur ses cours restants</span></li>";
        }).join("") + "</ul>";
      }
    }
    out.innerHTML = '<p class="om ' + cls + '">' + msg + "</p>" +
      (details ? '<details class="od"><summary>Voir où concentrer vos efforts</summary>' + details + "</details>" : "") +
      (sel === "vt" || !R().mentionVT ? "" : '<p class="onote">La mention suppose que toutes les UE soient validées (validation totale).</p>');
  }

  /* ---------- Écrans « À propos » et « Avis » ---------- */
  var WA = "https://wa.me/243808464837", MAIL = "isaaccinza730@gmail.com";
  function openSheet(id) { $(id).hidden = false; document.body.style.overflow = "hidden"; $(id).querySelector(".sheet-card").scrollTop = 0; }
  function closeSheet(id) { $(id).hidden = true; document.body.style.overflow = ""; }
  function openAbout(first) { $("ab-go").textContent = first ? "Commencer" : "Fermer"; openSheet("ab"); }
  var rating = 0;
  function fbLinks() {
    var t = $("fb-t").value.trim();
    var msg = "Avis sur Ma Cote LMD" + (rating ? "\nNote : " + rating + "/5" : "") + (t ? "\n\n" + t : "");
    $("fb-wa").href = WA + "?text=" + encodeURIComponent(msg);
    $("fb-ml").href = "mailto:" + MAIL + "?subject=" + encodeURIComponent("Avis sur Ma Cote LMD") + "&body=" + encodeURIComponent(msg);
  }
  function openFeedback() { closeSheet("ab"); fbLinks(); openSheet("fb"); }
  $("ab-open").onclick = function () { openAbout(false); };
  $("ft-contact").onclick = function () { openAbout(false); };
  $("ft-avis").onclick = openFeedback;
  $("ab-fb").onclick = openFeedback;
  $("ab-go").onclick = function () { store.set("cinza-lmd:welcomed", "1"); closeSheet("ab"); };
  document.querySelectorAll("[data-close]").forEach(function (b) {
    b.onclick = function () { if (b.dataset.close === "ab") store.set("cinza-lmd:welcomed", "1"); closeSheet(b.dataset.close); };
  });
  ["ab", "fb"].forEach(function (id) {
    $(id).addEventListener("click", function (e) { if (e.target === $(id)) { if (id === "ab") store.set("cinza-lmd:welcomed", "1"); closeSheet(id); } });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeSheet("ab"); closeSheet("fb"); } });
  $("fb-st").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var v = +b.dataset.v; rating = rating === v ? 0 : v;
    Array.prototype.forEach.call($("fb-st").children, function (x) { x.classList.toggle("on", +x.dataset.v <= rating); x.setAttribute("aria-pressed", +x.dataset.v <= rating); });
    fbLinks();
  });
  $("fb-t").addEventListener("input", fbLinks);

  /* ---------- Thème clair / sombre ---------- */
  function applyTheme(t) {
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "dark" ? "#0b3d35" : "#0a4a40");
  }
  function currentTheme() {
    var t = document.documentElement.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  applyTheme(store.get("cinza-lmd:theme"));
  $("th").onclick = function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    store.set("cinza-lmd:theme", next);
  };

  /* ---------- Événements ---------- */
  /* Établissement -> faculté (ou section) -> promotion. Chaque choix est mémorisé. */
  var key = function () { return Array.prototype.slice.call(arguments).join(":"); };
  function fillET() {
    et.innerHTML = D.map(function (e, i) {
      return '<option value="' + i + '"' + (e.bientot ? " disabled" : "") + ">" + esc(e.nom) + (e.bientot ? " (bientôt)" : "") + "</option>";
    }).join("");
    var se = store.get("cinza-lmd:et");
    et.value = se !== null && D[se] && !D[se].bientot ? se : "0";
    fillFA();
  }
  function fillFA() {
    $("fa-l").textContent = ET().niveau;
    opts(fa, ET().facultes);
    var sf = store.get(key("cinza-lmd:fa", et.value));
    if (sf !== null && ET().facultes[sf]) fa.value = sf;
    fillPR();
  }
  function fillPR() {
    opts(pr, FA().promotions);
    var sp = store.get(key("cinza-lmd:pr", et.value, fa.value));
    if (sp !== null && FA().promotions[sp]) pr.value = sp;
    $("ob").innerHTML = "";
    buildObjOptions();
    build();
  }
  et.onchange = function () { store.set("cinza-lmd:et", et.value); fillFA(); };
  fa.onchange = function () { store.set(key("cinza-lmd:fa", et.value), fa.value); fillPR(); };
  pr.onchange = function () { store.set(key("cinza-lmd:pr", et.value, fa.value), pr.value); build(); };
  app.addEventListener("input", function () { calc(); save(); });
  app.addEventListener("focusin", function (e) {
    if (e.target.tagName === "INPUT") setTimeout(function () { try { e.target.select(); } catch (x) {} }, 0);
  });
  $("sh").onclick = share;
  $("pn").onclick = printSheet;
  $("rz").onclick = function () {
    if (!confirm("Effacer toutes les notes de cette promotion ?")) return;
    app.querySelectorAll("input").forEach(function (i) { i.value = ""; });
    calc();
    save();
  };

  /* ---------- Démarrage ---------- */
  fillET();

  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !navigator.standalone && !window.matchMedia("(display-mode: standalone)").matches;
  if (ios && !isNative()) $("ios-tip").hidden = false;
  if (!store.get("cinza-lmd:welcomed")) openAbout(true);

  /* Version web installable (hors-ligne) : pas utile dans l'application Android */
  if ("serviceWorker" in navigator && /^https?:/.test(location.protocol) && !isNative()) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
