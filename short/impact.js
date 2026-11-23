// 두근두근 당곡 · 숏 · 임팩트판 — 장 넘기기 · 장 안 단계 · 연출
(function () {
  "use strict";
  var stage = document.getElementById("stage"), slides = [].slice.call(document.querySelectorAll(".s"));
  var cur = 0, step = 0, RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NOTES = window.NOTES || [];

  function fit() { var k = Math.min(innerWidth / 1920, innerHeight / 1080); stage.style.transform = "scale(" + k + ")"; }
  addEventListener("resize", fit); fit();

  function setStep(s, k) { for (var i = 1; i <= 6; i++) s.classList.toggle("k" + i, i <= k); s.dataset.k = k; }
  function show(i, k) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var changed = i !== cur || !slides[i].classList.contains("on");
    slides.forEach(function (s, j) { s.classList.toggle("on", j === i); if (j !== i) setStep(s, 0); });
    cur = i; step = k || 0; setStep(slides[i], step);
    if (changed && ENTER[i]) ENTER[i](slides[i]);
    if (STEP[i]) STEP[i](slides[i], step);
    document.getElementById("cnt").textContent = (i + 1) + " / " + slides.length;
    var n = document.getElementById("notes"); n.innerHTML = "<b>" + (i + 1) + "장</b> " + (NOTES[i] || "");
    try { history.replaceState(null, "", "#" + (i + 1)); } catch (e) {}
  }
  function next() { var max = +slides[cur].dataset.steps || 0; if (step < max) show(cur, step + 1); else if (cur < slides.length - 1) show(cur + 1, 0); }
  function prev() { if (step > 0) show(cur, step - 1); else if (cur > 0) show(cur - 1, +slides[cur - 1].dataset.steps || 0); }
  addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowRight" || k === " " || k === "PageDown" || k === "ArrowDown") { e.preventDefault(); next(); }
    else if (k === "ArrowLeft" || k === "PageUp" || k === "ArrowUp") { e.preventDefault(); prev(); }
    else if (k === "Home") show(0, 0); else if (k === "End") show(slides.length - 1, 0);
    else if (k === "n" || k === "N") document.getElementById("notes").classList.toggle("on");
    else if (k === "f" || k === "F") { if (!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(function () {}); else document.exitFullscreen(); }
  });
  addEventListener("message", function (e) { if (e.data && e.data.deckKey) dispatchEvent(new KeyboardEvent("keydown", { key: e.data.deckKey })); });
  document.getElementById("ivPlay").addEventListener("click", function (e) { e.stopPropagation(); var v = document.getElementById("ivVid"); v.currentTime = 0; v.play().then(function () { e.target.hidden = true; }).catch(function () {}); });
  document.getElementById("viewport").addEventListener("click", function (e) { if (e.target.closest("iframe,button,video")) return; (e.clientX < innerWidth * 0.2 ? prev : next)(); });

  // ---- 6장: 편제표(실제 2026 선택 묶음) + 국어국문학과 권장 과목 필름 ----
  function buildTT(d) {
    var tt = document.getElementById("tt"), n = 0, seen = {};
    d.sems.forEach(function (s) {
      var box = document.createElement("div"); box.className = "sem";
      var g = s.groups.filter(function (x) { return !x.art; })[0], art = s.groups.filter(function (x) { return x.art; })[0];
      box.innerHTML = "<h4>" + s.label + "</h4><div class='pick'>선택 " + (g ? g.pick : "") + "</div>";
      var ch = document.createElement("div"); ch.className = "chips";
      [g, art].forEach(function (grp) {
        if (!grp) return;
        grp.rows.forEach(function (r) {
          var rec = r.rec && r.departs.indexOf("국어국문학과") >= 0;
          var c = document.createElement("span"); c.className = "chip" + (rec ? " rec" : "") + (grp.art ? " art" : ""); c.textContent = r.name;
          if (rec) { c.style.transitionDelay = (0.9 + n * 0.12) + "s"; if (!seen[r.name]) { seen[r.name] = 1; n++; } }
          ch.appendChild(c);
        });
      });
      box.appendChild(ch); tt.appendChild(box);
    });
    document.getElementById("ttSum").innerHTML = "편집자의 꿈 → 국어국문학과 권장 과목 <b>" + n + "개</b>, 우리 학교 묶음까지 한 장";
  }
  fetch("data/counsel.json").then(function (r) { return r.json(); }).then(buildTT).catch(function () {});

  // ---- 7장 01: 직업 성운(923개) → 서윤의 별 → 추천 직업 ----
  var NEB = null, nebRaf = 0;
  fetch("data/nebula2d.json").then(function (r) { return r.json(); }).then(function (d) { NEB = d; }).catch(function () {});
  var PAL = ["#F87171","#60A5FA","#818CF8","#4ADE80","#FACC15","#FB923C","#22D3EE","#C084FC","#2DD4BF","#A3E635","#A78BFA","#F472B6","#38BDF8","#34D399","#E879F9","#BEF264","#FB7185","#FDE047","#93C5FD","#F9A8D4","#86EFAC","#FCA5A5","#CBD5E1"];
  function nebula() {
    cancelAnimationFrame(nebRaf);
    var cv = document.getElementById("neb"), g = cv.getContext("2d"); if (!NEB) return;
    var gi = {}; Object.keys(NEB.groups).forEach(function (k, i) { gi[k] = PAL[i % PAL.length]; });
    var X = function (v) { return 260 + v * 1400; }, Y = function (v) { return 150 + v * 760; };
    var me = [X(NEB.me[0]), Y(NEB.me[1])], tops = NEB.top.map(function (t) { var j = NEB.jobs[t.i]; return { n: t.n, s: t.s, x: X(j[0]), y: Y(j[1]) }; });
    var t0 = performance.now(), from = [520, 960];
    (function frame(now) {
      var t = (now - t0) / 1000; g.clearRect(0, 0, 1920, 1080);
      NEB.jobs.forEach(function (j, i) { var tw = 0.55 + 0.45 * Math.sin(t * 1.3 + i); g.globalAlpha = 0.25 + 0.45 * tw; g.fillStyle = gi[j[2]] || "#9CA3AF";
        g.beginPath(); g.arc(X(j[0]), Y(j[1]), 3.2, 0, 6.283); g.fill(); });
      g.globalAlpha = 1;
      // 한 줄이 날아가 별이 됨(0~1.6초)
      var u = Math.min(1, t / 1.6), e = 1 - Math.pow(1 - u, 3), px = from[0] + (me[0] - from[0]) * e, py = from[1] + (me[1] - from[1]) * e;
      if (u < 1) { g.font = "48px 'Nanum Pen Script'"; g.fillStyle = "rgba(255,240,190," + (1 - u * 0.8) + ")"; g.textAlign = "center"; g.fillText("친구 글 맞춤법·어색한 문장 고쳐 주기", px, py); }
      else {
        var r = 14 + 4 * Math.sin(t * 3); var grd = g.createRadialGradient(me[0], me[1], 0, me[0], me[1], 70);
        grd.addColorStop(0, "rgba(255,226,122,.9)"); grd.addColorStop(1, "rgba(255,226,122,0)"); g.fillStyle = grd; g.beginPath(); g.arc(me[0], me[1], 70, 0, 6.283); g.fill();
        star(g, me[0], me[1], r + 10, "#ffd23f");
        g.font = "600 30px Pretendard"; g.fillStyle = "#fff2b8"; g.textAlign = "center"; g.fillText("서윤", me[0], me[1] + 58);
        tops.forEach(function (o, k) {
          var v = Math.max(0, Math.min(1, (t - 1.8 - k * 0.45) / 0.7)); if (!v) return;
          g.strokeStyle = "rgba(255,210,63," + (k ? 0.55 : 0.95) + ")"; g.lineWidth = k ? 2.5 : 5; g.beginPath(); g.moveTo(me[0], me[1]); g.lineTo(me[0] + (o.x - me[0]) * v, me[1] + (o.y - me[1]) * v); g.stroke();
          if (v === 1) { var SL = [[-330, -150], [180, -190], [230, 40]][k], lx = me[0] + SL[0], ly = me[1] + SL[1];
            g.setLineDash([4, 6]); g.strokeStyle = "rgba(230,234,255,.6)"; g.lineWidth = 1.5; g.beginPath(); g.moveTo(o.x, o.y); g.lineTo(lx, ly); g.stroke(); g.setLineDash([]);
            g.font = (k ? "600 32px" : "800 46px") + " Pretendard"; var tw = g.measureText((k ? "" : "★ ") + o.n).width;
            g.fillStyle = k ? "rgba(20,26,60,.85)" : "rgba(60,42,0,.9)"; g.beginPath(); g.roundRect(lx - 16, ly - (k ? 26 : 36), tw + 32, k ? 50 : 66, 14); g.fill();
            g.fillStyle = k ? "#e6eaff" : "#ffe27a"; g.textAlign = "left"; g.textBaseline = "middle"; g.fillText((k ? "" : "★ ") + o.n, lx, ly - 1); g.textBaseline = "alphabetic"; }
        });
      }
      nebRaf = requestAnimationFrame(frame);
    })(t0);
  }
  function star(g, x, y, R, c) { g.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * 0.5 : R; g.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } g.closePath(); g.fillStyle = c; g.fill(); }

  var ENTER = {}, STEP = {};
  STEP[6] = function (s, k) {
    s.querySelector(".no").textContent = k ? "0" + k : "";
    if (k === 1) nebula(); else cancelAnimationFrame(nebRaf);
    var v = document.getElementById("ivVid"), pb = document.getElementById("ivPlay");
    if (k === 3) { v.currentTime = 0; var pr = v.play(); if (pr && pr.then) pr.then(function () { pb.hidden = true; }).catch(function () { pb.hidden = false; }); }
    else { v.pause(); pb.hidden = true; }
    var f = document.getElementById("starFrame");
    if (k === 2) f.src = f.dataset.src + "&t=" + Date.now(); else if (f.src) f.removeAttribute("src");
  };

  var h = parseInt((location.hash || "").slice(1), 10);
  show(h > 0 ? h - 1 : 0, 0);
})();
