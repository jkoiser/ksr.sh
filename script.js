/* Retro landing page JS (no deps) */
(() => {
  const $ = (id) => document.getElementById(id);

  const els = {
    stars: $("stars"),
    counter: $("counter"),
    clock: $("clock"),
    conn: $("conn"),
    mood: $("mood"),
    quote: $("quote"),
    meterFill: $("meterFill"),
    marquee: $("marquee"),
  };

  // --- Fake visitor counter (localStorage, feels authentic)
  const COUNTER_KEY = "ksr_visitor_counter_v1";
  function formatCounter(n) {
    return String(n).padStart(6, "0");
  }
  function bumpCounter() {
    const prev = Number(localStorage.getItem(COUNTER_KEY) || "0");
    const next = Math.max(prev + 1, 1337 + (prev % 17)); // keep it fun
    localStorage.setItem(COUNTER_KEY, String(next));
    if (els.counter) els.counter.textContent = formatCounter(next);
  }

  // --- Clock
  function tickClock() {
    if (!els.clock) return;
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    els.clock.textContent = `${hh}:${mm}:${ss}`;
  }

  // --- Quotes (minimal text, non-PC vibe)
  const QUOTES = [
    '"be kind"',
    '"rewind"',
    '"after dark"',
    '"mix tape"',
    '"roller rink"',
    '"late-night tv"',
    '"glitter & neon"',
    '"summer forever"',
    '"meet me at the mall"',
  ];
  function setRandomQuote() {
    if (!els.quote) return;
    const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    els.quote.textContent = q;
  }

  // conn element exists for aesthetics; keep it static (set in HTML)

  // --- Meter animation
  let meterTarget = 0;
  let meterValue = 0;
  function setMeterTarget(p) {
    meterTarget = Math.max(0, Math.min(100, p));
  }
  function animateMeter() {
    if (!els.meterFill) return;
    meterValue += (meterTarget - meterValue) * 0.06;
    els.meterFill.style.width = `${meterValue.toFixed(2)}%`;
    requestAnimationFrame(animateMeter);
  }

  // --- Sparkle drift canvas (ambient)
  function createSparkles(canvas) {
    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0;
    let h = 0;
    let p = [];
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
      ctx.clearRect(0, 0, w, h);
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
  // mood element exists for aesthetics; keep it static (set in HTML)

  // --- Marquee: restart to avoid sometimes “stuck at 0” on load
  function nudgeMarquee() {
    if (!els.marquee) return;
    els.marquee.style.animation = "none";
    // force reflow
    void els.marquee.offsetHeight;
    els.marquee.style.animation = "";
  }

  // --- Wire up (minimal / ambient only)
  const sparkles = els.stars ? createSparkles(els.stars) : null;

  // No click/keyboard handlers: keep it passive.

  // Init sequence
  bumpCounter();
  tickClock();
  setInterval(tickClock, 1000);
  setRandomQuote();
  setMeterTarget(65);
  animateMeter();
  nudgeMarquee();

  // Gentle ambient updates
  setTimeout(() => setMeterTarget(86), 900);
  setInterval(() => {
    setRandomQuote();
    setMeterTarget(70 + Math.random() * 30);
  }, 12000);
})();


