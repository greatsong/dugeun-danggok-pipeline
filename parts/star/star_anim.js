"use strict";
// 꿈의 별자리 연결 애니메이션(2026-11-23 PD): 오른쪽 위 꿈의 직업 큰 별이 '딱' 뜨고,
// 왼쪽으로 별이 차례로 이어진 뒤 마지막에 '오늘의 나'가 '띵'. 덱 안에서 그 판이 보일 때마다 다시 재생.
(function () {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  let running = [];
  function stopAll() { running.forEach((a) => { try { a.cancel(); } catch (e) {} }); running = []; document.querySelectorAll(".ding").forEach((e) => e.remove()); }
  function anim(el, kf, o) { const a = el.animate(kf, Object.assign({ fill: "both", easing: "cubic-bezier(.2,.8,.25,1)" }, o)); running.push(a); return a; }
  function pop(g, delay, big) {
    g.style.transformBox = "fill-box"; g.style.transformOrigin = "center";
    anim(g, big
      ? [{ opacity: 0, transform: "scale(.2)" }, { opacity: 1, transform: "scale(1.22)", offset: .6 }, { opacity: 1, transform: "scale(1)" }]
      : [{ opacity: 0, transform: "scale(.4)" }, { opacity: 1, transform: "scale(1.08)", offset: .7 }, { opacity: 1, transform: "scale(1)" }],
      { duration: big ? 700 : 380, delay });
  }
  function ring(x, y, r0, r1, color, delay, dur) {
    const svg = document.getElementById("sky");
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("class", "ding"); c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("fill", "none");
    c.setAttribute("stroke", color); c.setAttribute("stroke-width", 4); c.setAttribute("r", r1); c.style.opacity = 0;
    c.setAttribute("vector-effect", "non-scaling-stroke"); c.style.transformBox = "fill-box"; c.style.transformOrigin = "center";
    (svg.querySelector("g") || svg).appendChild(c);
    const k = (r0 / r1).toFixed(3);
    anim(c, [{ transform: `scale(${k})`, opacity: 0 }, { transform: `scale(${k})`, opacity: .95, offset: .01 }, { transform: "scale(1)", opacity: 0 }], { duration: dur, delay, easing: "cubic-bezier(.1,.7,.3,1)" });
  }
  function drawLine(e, delay, dur) {
    const len = e.getTotalLength ? e.getTotalLength() : 0; if (!len) return;
    const keepDash = e.getAttribute("stroke-dasharray");
    e.style.strokeDasharray = len + " " + len;
    const a = anim(e, [{ strokeDashoffset: -len }, { strokeDashoffset: 0 }], { duration: dur, delay, easing: "cubic-bezier(.4,0,.2,1)" });
    a.finished.then(() => { e.style.strokeDasharray = keepDash || ""; }).catch(() => {});
  }
  function fadeIn(e, delay, dur) { anim(e, [{ opacity: 0 }, { opacity: 1 }], { duration: dur, delay }); }

  window.starAnim = function () {
    const S = window.__star; if (!S || RM) return;
    stopAll();
    const { gDream, gMe, nodes, nodeG, lines, N, G, d, LEN } = S;
    const tOf = (xy) => ((xy[0] - N[0]) * d[0] + (xy[1] - N[1]) * d[1]) / LEN;
    // 꿈의 직업: 딱
    pop(gDream, 250, true);
    ring(G[0], G[1] - 6, 40, 190, "#FFD76A", 250, 900);
    // 꿈에서 왼쪽 아래로: 가까운 별부터 착착착
    const order = nodes.slice().sort((a, b) => tOf(b.xy) - tOf(a.xy));
    const start = 950, span = 2900, step = Math.min(220, span / Math.max(1, order.length));
    order.forEach((n, i) => {
      const t = start + i * step;
      (lines[n.id] || []).forEach((e) => drawLine(e, t - 60, 420));
      if (nodeG[n.id]) pop(nodeG[n.id], t + 180, false);
    });
    // 오늘의 나: 띵
    const tMe = start + order.length * step + 450;
    order.filter((n) => lines[n.id + "me"]).forEach((n) => lines[n.id + "me"].forEach((e) => fadeIn(e, tMe - 150, 500)));
    pop(gMe, tMe, true);
    ring(N[0], N[1] - 8, 22, 130, "#FFF3A6", tMe, 800);
    ring(N[0], N[1] - 8, 22, 200, "#FFD76A", tMe + 160, 1000);
  };
  addEventListener("message", (e) => { if (e.data && e.data.starAnim) window.starAnim(); });
})();
