/* © Isaac CINZA — mini générateur de PDF (sans dépendance, hors-ligne)
   makePdf(modèle) -> chaîne base64 d'un PDF A4 (police Helvetica intégrée) */
(function () {
  "use strict";
  var W = 595.28, H = 841.89, M = 40;
  var GREEN = "0.039 0.29 0.251", GREY = "0.35 0.35 0.35", BLACK = "0 0 0", OK = "0.07 0.475 0.29", KO = "0.7 0.15 0.12";

  /* Largeurs Helvetica (AFM) des caractères 32 à 126, en 1/1000 d'em */
  var HW = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,
    667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,
    556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];

  function base(ch) {
    var c = ch.charCodeAt(0);
    if (c >= 32 && c < 127) return ch;
    var d = ch.normalize ? ch.normalize("NFD").charAt(0) : "e";
    var dc = d.charCodeAt(0);
    return dc >= 32 && dc < 127 ? d : "e";
  }
  function tw(s, size, bold) {
    var w = 0;
    for (var i = 0; i < s.length; i++) w += HW[base(s.charAt(i)).charCodeAt(0) - 32] || 556;
    return w * size / 1000 * (bold ? 1.06 : 1);
  }
  /* Texte -> octets WinAnsi (chaîne latin-1), avec échappement PDF */
  function enc(s) {
    var o = "";
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i), r;
      if (c === 0x2019 || c === 0x2018) r = "'";
      else if (c === 0x201C || c === 0x201D) r = '"';
      else if (c === 0x2013 || c === 0x2014) r = "-";
      else if (c === 0x2026) r = "...";
      else if (c === 0x2022) r = "\x95";
      else if (c === 0x153) r = "\x9c";
      else if (c === 0x152) r = "\x8c";
      else if (c >= 32 && c < 256) r = s.charAt(i);
      else r = "?";
      if (r === "(" || r === ")" || r === "\\") r = "\\" + r;
      o += r;
    }
    return o;
  }
  function wrap(s, maxW, size, bold) {
    var words = String(s).split(" "), lines = [], cur = "";
    words.forEach(function (w) {
      var t = cur ? cur + " " + w : w;
      if (tw(t, size, bold) <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
    });
    if (cur) lines.push(cur);
    return lines;
  }

  window.makePdf = function (m) {
    var pages = [], cur, y;
    var f2 = function (n) { return n.toFixed(2); };
    function newPage() { cur = []; pages.push(cur); y = H - M; }
    function text(x, yy, s, size, bold, col) {
      cur.push(col + " rg BT /F" + (bold ? 2 : 1) + " " + size + " Tf " + f2(x) + " " + f2(yy) + " Td (" + enc(String(s)) + ") Tj ET");
    }
    function ctext(x, w, yy, s, size, bold, col) { text(x + (w - tw(String(s), size, bold)) / 2, yy, s, size, bold, col); }
    function rect(x, yy, w, h, fill, stroke) {
      if (fill) cur.push(fill + " rg " + f2(x) + " " + f2(yy) + " " + f2(w) + " " + f2(h) + " re f");
      if (stroke) cur.push(stroke + " RG 0.6 w " + f2(x) + " " + f2(yy) + " " + f2(w) + " " + f2(h) + " re S");
    }
    function need(h) { if (y - h < M + 16) newPage(); }

    var CW = W - 2 * M, NC = 52, NW = CW - 4 * NC, SZ = 9.5, LH = 11.5;
    var colX = [M + NW, M + NW + NC, M + NW + 2 * NC, M + NW + 3 * NC];

    newPage();
    /* En-tête */
    text(M, y - 8, "MA COTE LMD", 8, true, GREEN); y -= 28;
    text(M, y, m.fac, 20, true, BLACK);
    var dw = tw(m.date, 9, false);
    text(W - M - dw, y, m.date, 9, false, GREY); y -= 17;
    text(M, y, m.promo, 12, false, "0.2 0.2 0.2"); y -= 8;
    cur.push(GREEN + " RG 1.6 w " + f2(M) + " " + f2(y) + " m " + f2(W - M) + " " + f2(y) + " l S"); y -= 6;

    function tableHeader(name) {
      rect(M, y - 17, CW, 17, "0.91 0.94 0.93", "0.62 0.71 0.69");
      text(M + 5, y - 12, name, 8.5, true, "0.1 0.1 0.1");
      ["Crédits", "TJ/10", "EXAM/10", "Cote/20"].forEach(function (t, i) { ctext(colX[i], NC, y - 12, t, 8, true, "0.1 0.1 0.1"); });
      y -= 17;
    }
    function rowBox(h) {
      cur.push("0.77 0.83 0.81 RG 0.5 w " + f2(M) + " " + f2(y - h) + " " + f2(CW) + " " + f2(h) + " re S");
      for (var i = 0; i < 4; i++) cur.push("0.77 0.83 0.81 RG 0.5 w " + f2(colX[i]) + " " + f2(y) + " m " + f2(colX[i]) + " " + f2(y - h) + " l S");
    }

    m.sems.forEach(function (s) {
      need(70);
      y -= 14;
      text(M, y, s.nom, 12, true, GREEN); y -= 8;
      s.ues.forEach(function (u) {
        need(17 + 22 + 20);
        tableHeader(u.nom);
        u.rows.forEach(function (r) {
          var lines = wrap(r.n, NW - 10, SZ, false), h = lines.length * LH + 6;
          if (y - h - 20 < M + 16) { newPage(); tableHeader(u.nom + " (suite)"); }
          rowBox(h);
          lines.forEach(function (l, i) { text(M + 5, y - 4 - SZ - i * LH + 2, l, SZ, false, BLACK); });
          var ty = y - h / 2 - 3.2;
          ctext(colX[0], NC, ty, r.c, SZ, false, BLACK);
          ctext(colX[1], NC, ty, r.a, SZ, false, BLACK);
          ctext(colX[2], NC, ty, r.b, SZ, false, BLACK);
          ctext(colX[3], NC, ty, r.cote, SZ, true, BLACK);
          y -= h;
        });
        rect(M, y - 18, CW, 18, "0.953 0.969 0.965", "0.77 0.83 0.81");
        text(M + 5, y - 12.5, "Moyenne de l’UE : " + u.avg, SZ, true, BLACK);
        var col = u.cls === "ok" ? OK : u.cls === "ko" ? KO : GREY, sw = tw(u.status, SZ, true);
        text(W - M - 6 - sw, y - 12.5, u.status, SZ, true, col);
        y -= 18 + 8;
      });
    });

    /* Récapitulatif */
    need(120);
    y -= 6;
    var bw = (CW - 8) / 2, bh = 38;
    function box(x, yy, w, label, val, col) {
      rect(x, yy - bh, w, bh, null, GREEN);
      text(x + 8, yy - 13, label.toUpperCase(), 7.5, false, GREY);
      text(x + 8, yy - 30, val, 13, true, col || BLACK);
    }
    box(M, y, bw, "Moyenne annuelle", m.sum.moy + " / 20");
    box(M + bw + 8, y, bw, "Mention", m.sum.mention);
    y -= bh + 8;
    box(M, y, bw, "Crédits validés", m.sum.val + " / " + m.sum.tot);
    y -= bh + 8;
    rect(M, y - bh, CW, bh, "0.953 0.969 0.965", GREEN);
    text(M + 8, y - 13, "DÉCISION", 7.5, false, GREY);
    text(M + 8, y - 30, m.sum.decision, 13, true, m.sum.cls === "ok" ? OK : m.sum.cls === "ko" ? KO : BLACK);
    y -= bh + 16;

    wrap(m.foot, CW, 8, false).forEach(function (l) { ctext(M, CW, y, l, 8, false, GREY); y -= 10.5; });
    ctext(M, CW, y - 2, "© Isaac CINZA · isaaccinza730@gmail.com", 8, false, GREY);

    /* Numéros de page */
    pages.forEach(function (p, i) {
      cur = p;
      ctext(0, W, 24, "Page " + (i + 1) + " / " + pages.length, 8, false, GREY);
    });

    /* Assemblage du fichier PDF */
    var objs = [], n = 4 + pages.length * 2;
    objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    var kids = [];
    for (var i = 0; i < pages.length; i++) kids.push((5 + i * 2) + " 0 R");
    objs[2] = "<< /Type /Pages /Kids [" + kids.join(" ") + "] /Count " + pages.length + " >>";
    objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
    objs[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";
    pages.forEach(function (p, i) {
      var stream = p.join("\n");
      objs[5 + i * 2] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + W + " " + H + "] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents " + (6 + i * 2) + " 0 R >>";
      objs[6 + i * 2] = "<< /Length " + stream.length + " >>\nstream\n" + stream + "\nendstream";
    });
    var out = "%PDF-1.4\n", offs = [];
    for (var k = 1; k <= n; k++) { offs[k] = out.length; out += k + " 0 obj\n" + objs[k] + "\nendobj\n"; }
    var xref = out.length;
    out += "xref\n0 " + (n + 1) + "\n0000000000 65535 f \n";
    for (var j = 1; j <= n; j++) out += ("0000000000" + offs[j]).slice(-10) + " 00000 n \n";
    out += "trailer\n<< /Size " + (n + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF";
    return btoa(out);
  };
})();
