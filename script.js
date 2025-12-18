/* Retro landing page JS (no deps) */
(() => {
  const $ = (id) => document.getElementById(id);

  const els = {
    stars: $("stars"),
  };

  // --- Painted haze + spray glitter canvas (ambient)
  function createPaint(canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0;
    let h = 0;
    let p = [];
    let t = 0;
    let raf = 0;

    function resize() {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = Math.floor(window.innerWidth * dpr);
      h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      const count = Math.floor((w * h) / 52000);
      p = new Array(count).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.7 + Math.random() * 2.3,
        vx: (-0.2 + Math.random() * 0.4),
        vy: (0.15 + Math.random() * 0.45),
        ph: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      t += 1;
      ctx.clearRect(0, 0, w, h);

      // Soft painted wash (changes slowly, makes everything feel blended)
      const wob = Math.sin(t / 220);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, `rgba(255, 79, 216, ${0.05 + 0.02 * wob})`);
      grad.addColorStop(0.5, `rgba(125, 255, 234, ${0.04 + 0.02 * (1 - wob)})`);
      grad.addColorStop(1, `rgba(122, 167, 255, ${0.04 + 0.015 * wob})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Occasional “spray smears”
      if (t % 90 === 0) {
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        const rx = 120 + Math.random() * 260;
        const ry = 40 + Math.random() * 140;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((-0.4 + Math.random() * 0.8));
        const g = ctx.createRadialGradient(0, 0, 10, 0, 0, rx);
        g.addColorStop(0, "rgba(255,255,255,0.06)");
        g.addColorStop(0.35, "rgba(255,79,216,0.05)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.scale(1, ry / rx);
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      for (const s of p) {
        s.x += s.vx;
        s.y += s.vy;
        s.ph += 0.03;
        if (s.y > h + 12) {
          s.y = -12;
          s.x = Math.random() * w;
        }
        if (s.x < -12) s.x = w + 12;
        if (s.x > w + 12) s.x = -12;

        const tw = 0.55 + 0.45 * Math.sin(s.ph);
        const a = 0.08 + tw * 0.20;

        // glittery tint
        const r = 220 + Math.floor(35 * tw);
        const g = 210 + Math.floor(55 * (1 - tw));
        const b = 255;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize, { passive: true });
    resize();
    draw();

    return {
      stop: () => cancelAnimationFrame(raf),
    };
  }

  // --- Start (purely visual)
  if (els.stars) createPaint(els.stars);
})();


