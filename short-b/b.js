// 두근두근 당곡 · B판 「기록 배송 조회」 — 장 넘기기 · 장 안 단계 · 연출
(function () {
  "use strict";
  var stage = document.getElementById("stage"), slides = [].slice.call(document.querySelectorAll(".s"));
  var cur = 0, step = 0;
  var NOTES = window.NOTES || [];

  function fit() { var k = Math.min(innerWidth / 1920, innerHeight / 1080); stage.style.transform = "scale(" + k + ")"; }
  addEventListener("resize", fit); fit();

  // ---------- 포스트잇 벽(같은 씨앗 → 처음과 마지막이 같은 벽) ----------
  var TASKS = ["참여 명단 확인", "생기부 입력 마감", "프로그램 홍보", "과목 상담 예약", "소감문 걷기", "출석부 정리", "신청서 회수",
    "선발 결과 안내", "활동 사진 정리", "편제표 PDF 찾기", "상담 일지", "가정통신문", "진로 활동 입력", "메신저 답장", "학년부 회의",
    "동아리 명단", "행사 계획서", "모집 마감 공지"];
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function buildWall(el, falling) {
    var R = rng(20261123), cols = 9, rows = 6, cw = 1920 / cols, ch = 1080 / rows, n = 0, html = "";
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var x = c * cw + (R() - 0.5) * 50 - 14, y = r * ch + (R() - 0.5) * 40 - 16, rot = (R() - 0.5) * 16;
      var tone = ["#ffe45c", "#ffd93d", "#fff07a", "#ffe45c"][Math.floor(R() * 4)];
      var d = falling ? (0.05 + R() * 1.7) : (0.1 + R() * 2.6);
      html += "<div class='pn' style='left:" + x.toFixed(0) + "px;top:" + y.toFixed(0) + "px;--r:" + rot.toFixed(1) + "deg;--d:" + d.toFixed(2) + "s;background:" + tone + "'><span>" + TASKS[Math.floor(R() * TASKS.length)] + "</span></div>";
      n += 7;
    }
    el.innerHTML = html;
  }
  buildWall(document.getElementById("wallA"), true);
  buildWall(document.getElementById("wallB"), false);

  // ---------- 배송 조회 화면 ----------
  var NODES = [["접수", "학생 입력"], ["담임 상담", "과목 · 프로그램"], ["프로그램 신청", "나도 작가 글쓰기"], ["참여 확인", "프로그램 담당 교사"], ["도착", "생기부 · 내 활동"]];
  var NX = [230, 595, 960, 1325, 1690];
  var CHECK = "<svg viewBox='0 0 52 52'><path d='M14 27 L23 36 L39 18'/></svg>";
  // 장 × 단계별 상태: done(이미 찍힘) · fresh(지금 찍히는 체크) · cur(현재 위치) · 상태 글 · 포스트잇(0 숨김 · 1 붙음 · 2 해결)
  var TRK = {
    a: [{ done: [], fresh: [0], cur: 1, st: "배송 중", where: "다음 정거장 · 담임 상담", log: "3월 · 학생 입력 · 접수 완료", q: [1, 1, 1] }],
    b: [{ done: [0], fresh: [1, 2], cur: 3, st: "배송 중", where: "프로그램 신청 완료(선발 진행)", log: "나도 작가 글쓰기 · 신청 완료", q: [2, 2, 1] },
        { done: [0, 1, 2], fresh: [3], cur: 4, st: "배송 중", where: "참여 확인 · 4회 중 4회 출석", log: "프로그램 담당 교사 · 출석 · 관찰 · 후기 확인", q: [3, 3, 1] }],
    c: [{ done: [0, 1, 2, 3], fresh: [4], cur: -1, st: "배송 완료", where: "생기부 자료 · 학생 ‘내 활동’", log: "생기부 담당 교사 종합 · 배포 → 담임 교사 확정", q: [3, 3, 2], stamp: 1, dest: 1 }]
  };
  // 포스트잇 순서: 과목(담임 상담 아래) · 프로그램(프로그램 신청 아래) · 생기부(참여 확인 → 도착 사이)
  var QP = [{ x: 595, cls: "qa", t: "그 학과 권장 과목이<br><b>우리 학교에선 어느 묶음이지?</b>" },
            { x: 960, cls: "qb", t: "이거 해 보고 싶다던 아이,<br><b>지금 신청할 프로그램 있나?</b>" },
            { x: 1510, cls: "qc", t: "명단에 서윤이 이름은 있는데,<br><b>실제로 뭘 했지?</b>" }];
  function trkHTML() {
    var h = "<header class='tk-head'><b class='tk-logo'>기록 배송 조회</b><span class='tk-no'>송장 서윤-2026-001</span><span class='tk-brand'>두근두근 당곡</span></header>";
    h += "<div class='tk-sum'><div class='tk-item'><small>품목 · 서윤의 기록 1건</small><span class='pen'>친구 글 맞춤법·어색한 문장 고쳐 주기</span></div>" +
      "<div class='tk-st'><b class='st'></b><span class='where'></span><p class='log'><i>최근 처리</i><span></span></p></div><div class='tk-stamp'>배송 완료</div></div>";
    h += "<div class='tk-step'><div class='rail'><i class='fill'></i></div><div class='parcel'><svg viewBox='0 0 64 56'><path d='M6 16 L32 4 L58 16 L58 44 L32 54 L6 44 Z' fill='#c8955c' stroke='#5b3a17' stroke-width='3' stroke-linejoin='round'/><path d='M6 16 L32 27 L58 16 M32 27 L32 54' fill='none' stroke='#5b3a17' stroke-width='3' stroke-linejoin='round'/><path d='M19 10 L45 22' stroke='#f3d9a8' stroke-width='6'/></svg></div>";
    NODES.forEach(function (n, i) { h += "<div class='nd' style='left:" + NX[i] + "px'><div class='dot'><em>" + (i + 1) + "</em>" + CHECK + "</div><b>" + n[0] + "</b><small>" + n[1] + "</small></div>"; });
    h += "</div><div class='tk-q'>";
    QP.forEach(function (q) { h += "<div class='tq " + q.cls + "' style='left:" + (q.x - 180) + "px'><p>" + q.t + "</p><i class='ok'>해결</i></div>"; });
    h += "</div><div class='dest'><div class='dc d-star'><b class='ds'>★</b><div><small>새 별 하나</small><strong>학생 ‘내 활동’</strong></div></div><i class='dplus'>+</i><div class='dc d-rec'><b class='dd'></b><div><small>출석 · 관찰 · 후기</small><strong>생기부 자료</strong></div></div></div>";
    return h;
  }
  slides.forEach(function (s) { var t = s.querySelector(".trk"); if (t) t.innerHTML = trkHTML(); });
  function trkSet(s, k, enter) {
    var cfg = TRK[s.dataset.trk][Math.min(k, TRK[s.dataset.trk].length - 1)];
    s.querySelectorAll(".nd").forEach(function (n, i) {
      var fresh = cfg.fresh.indexOf(i) >= 0, done = cfg.done.indexOf(i) >= 0;
      n.classList.toggle("done", done || fresh); n.classList.remove("fresh"); n.classList.toggle("cur", cfg.cur === i);
      if (fresh) { void n.offsetWidth; n.classList.add("fresh"); n.style.setProperty("--fd", (0.35 + cfg.fresh.indexOf(i) * 0.55) + "s"); }
    });
    var last = cfg.cur >= 0 ? cfg.cur : 4, reach = cfg.done.concat(cfg.fresh);
    var far = reach.length ? Math.max.apply(null, reach) : 0;
    var p = cfg.cur >= 0 ? (NX[cfg.cur] - NX[0]) / (NX[4] - NX[0]) : 1;
    s.querySelector(".fill").style.width = (p * (NX[4] - NX[0])) + "px";
    s.querySelector(".parcel").style.left = (NX[0] + p * (NX[4] - NX[0])) + "px";
    s.querySelector(".parcel").classList.toggle("arrived", cfg.cur < 0);
    s.querySelector(".st").textContent = cfg.st; s.querySelector(".st").classList.toggle("fin", cfg.cur < 0);
    s.querySelector(".where").textContent = cfg.where; s.querySelector(".log span").textContent = cfg.log;
    if (enter) { s.classList.remove("stamped", "dest-on"); void s.offsetWidth; }
    if (enter && s.dataset.trk === "a") { s.querySelectorAll(".tq").forEach(function (q) { q.className = q.className.replace(/ ?q[0-3]$/, "") + " q0"; }); void s.offsetWidth; }
    s.querySelectorAll(".tq").forEach(function (q, i) { q.className = q.className.replace(/ ?q[0-3]$/, "") + " q" + cfg.q[i]; });
    s.classList.toggle("stamped", !!cfg.stamp); s.classList.toggle("dest-on", !!cfg.dest);
    void last; void far;
  }

  // ---------- 열린 지점 위 띠(조회 화면이 계속 따라옴) ----------
  slides.forEach(function (s) {
    var st = s.querySelector(".strip"); if (!st) return;
    var at = +s.dataset.at - 1, h = "<b class='sp-logo'>기록 배송 조회</b><span class='sp-no'>서윤-2026-001</span><div class='sp-rail'>";
    NODES.forEach(function (n, i) { if (i) h += "<em class='sp-line" + (i <= at ? " done" : "") + "'></em>"; h += "<span class='sp-n" + (i < at ? " done" : i === at ? " cur" : "") + "'><i>" + (i < at ? "✓" : i + 1) + "</i>" + n[0] + "</span>"; });
    h += "</div><span class='sp-where'>" + s.dataset.where + "</span>";
    st.innerHTML = h;
    s.querySelector(".body").style.setProperty("--ox", NX[at] + "px");
  });

  // ---------- 장 넘기기 ----------
  function setStep(s, k) { for (var i = 1; i <= 6; i++) s.classList.toggle("k" + i, i <= k); s.dataset.k = k; }
  function show(i, k) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var changed = i !== cur || !slides[i].classList.contains("on");
    slides.forEach(function (s, j) { if (j !== i) { s.classList.remove("on"); setStep(s, 0); if (LEAVE[j]) LEAVE[j](s); } });
    if (changed) { slides[i].classList.remove("on"); void slides[i].offsetWidth; }
    slides[i].classList.add("on");
    cur = i; step = k || 0; setStep(slides[i], step);
    if (slides[i].dataset.trk) trkSet(slides[i], step, changed);
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
  document.getElementById("viewport").addEventListener("click", function (e) { if (e.target.closest("iframe,button,video")) return; (e.clientX < innerWidth * 0.2 ? prev : next)(); });

  // ---------- 과목 선택: 편제표(실제 2026 선택 묶음) + 국어국문학과 권장 과목 필름 ----------
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

  // ---------- 추가 배송 01: 직업 성운(923개) → 서윤의 별 → 추천 직업 ----------
  var NEB = null, nebRaf = 0;
  fetch("data/nebula2d.json").then(function (r) { return r.json(); }).then(function (d) { NEB = d; }).catch(function () {});
  var PAL = ["#F87171","#60A5FA","#818CF8","#4ADE80","#FACC15","#FB923C","#22D3EE","#C084FC","#2DD4BF","#A3E635","#A78BFA","#F472B6","#38BDF8","#34D399","#E879F9","#BEF264","#FB7185","#FDE047","#93C5FD","#F9A8D4","#86EFAC","#FCA5A5","#CBD5E1"];
  function nebula() {
    cancelAnimationFrame(nebRaf);
    var cv = document.getElementById("neb"), g = cv.getContext("2d"); if (!NEB) return;
    var gi = {}; Object.keys(NEB.groups).forEach(function (k, i) { gi[k] = PAL[i % PAL.length]; });
    var X = function (v) { return 260 + v * 1400; }, Y = function (v) { return 150 + v * 760; };
    var me = [X(NEB.me[0]), Y(NEB.me[1])], tops = NEB.top.map(function (t) { var j = NEB.jobs[t.i]; return { n: t.n, s: t.s, x: X(j[0]), y: Y(j[1]) }; });
    var t0 = performance.now() + 700, from = [960, 760];
    (function frame(now) {
      var t = Math.max(0, (now - t0) / 1000); g.clearRect(0, 0, 1920, 1080);
      NEB.jobs.forEach(function (j, i) { var tw = 0.55 + 0.45 * Math.sin(t * 1.3 + i); g.globalAlpha = 0.25 + 0.45 * tw; g.fillStyle = gi[j[2]] || "#9CA3AF";
        g.beginPath(); g.arc(X(j[0]), Y(j[1]), 3.2, 0, 6.283); g.fill(); });
      g.globalAlpha = 1;
      var u = Math.min(1, t / 1.6), e = 1 - Math.pow(1 - u, 3), px = from[0] + (me[0] - from[0]) * e, py = from[1] + (me[1] - from[1]) * e;
      if (u < 1) { g.font = "52px 'Nanum Pen Script'"; g.fillStyle = "rgba(255,240,190," + (1 - u * 0.8) + ")"; g.textAlign = "center"; g.fillText("친구 글 맞춤법·어색한 문장 고쳐 주기", px, py); }
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
    })(performance.now());
  }
  function star(g, x, y, R, c) { g.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * 0.5 : R; g.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); } g.closePath(); g.fillStyle = c; g.fill(); }

  // ---------- 추가 배송 03: 실제 앱 녹화(소리 있음) ----------
  var vid = document.getElementById("ivVideo"), vbtn = document.getElementById("vplay"), vTimer = 0;
  function vStop() { clearTimeout(vTimer); try { vid.pause(); } catch (e) {} vbtn.classList.remove("on"); }
  function vPlay() {
    vbtn.classList.remove("on"); vid.muted = false;
    var p = vid.play(); if (p && p.catch) p.catch(function () { vbtn.classList.add("on"); });
  }
  vbtn.addEventListener("click", function (e) { e.stopPropagation(); vPlay(); });
  vid.addEventListener("ended", function () { vbtn.classList.add("on"); });

  var STEP = {}, LEAVE = {};
  var BANG = slides.indexOf(document.querySelector(".bang"));
  STEP[BANG] = function (s, k) {
    s.querySelector(".no").textContent = k ? "0" + k : "";
    if (k === 1) nebula(); else cancelAnimationFrame(nebRaf);
    var f = document.getElementById("starFrame");
    if (k === 2) { setTimeout(function () { if (step === 2 && cur === BANG) f.src = f.dataset.src + "&t=" + Date.now(); }, 650); } else if (f.getAttribute("src")) f.removeAttribute("src");
    vStop();
    if (k === 3) { try { vid.currentTime = 0; } catch (e) {} vTimer = setTimeout(vPlay, 750); }
  };
  LEAVE[BANG] = function () { cancelAnimationFrame(nebRaf); vStop(); var f = document.getElementById("starFrame"); if (f.getAttribute("src")) f.removeAttribute("src"); };

  var h = parseInt((location.hash || "").slice(1), 10);
  show(h > 0 ? h - 1 : 0, 0);
})();
