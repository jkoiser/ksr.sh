/* Retro landing page JS (no deps) */
(() => {
  const $ = (id) => document.getElementById(id);

  const els = {
    stars: $("stars"),
  };

  // --- Painted haze + spray glitter canvas (ambient)
  function createPaint(canvas) {
    // Detect Firefox for performance optimizations
    const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    
    const ctx = canvas.getContext("2d", { alpha: true });
    let w = 0;
    let h = 0;
    let p = [];
    let t = 0;
    let raf = 0;
    let frameSkip = 0; // Frame skipping for Firefox
    const fontCache = new Map(); // Cache font strings outside draw loop

    // Matrix characters pool
    const matrixChars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    function resize() {
      // Limit DPR for Firefox to improve performance
      const maxDpr = isFirefox ? 1.5 : 2;
      const dpr = Math.max(1, Math.min(maxDpr, window.devicePixelRatio || 1));
      w = Math.floor(window.innerWidth * dpr);
      h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      // Reduce particle count for Firefox
      const divisor = isFirefox ? 65000 : 52000;
      const count = Math.floor((w * h) / divisor);
      p = new Array(count).fill(0).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.7 + Math.random() * 2.3,
        vx: (-0.2 + Math.random() * 0.4),
        vy: (0.15 + Math.random() * 0.45),
        ph: Math.random() * Math.PI * 2,
        char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
      }));
    }

    function draw() {
      t += 1;
      
      // Frame skipping for Firefox to improve performance
      if (isFirefox) {
        frameSkip++;
        if (frameSkip % 2 === 0) {
          raf = requestAnimationFrame(draw);
          return;
        }
      }
      
      ctx.clearRect(0, 0, w, h);

      // Soft painted wash (Matrix green tint)
      const wob = Math.sin(t / 220);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, `rgba(0, 255, 65, ${0.02 + 0.01 * wob})`);
      grad.addColorStop(0.5, `rgba(0, 204, 51, ${0.015 + 0.01 * (1 - wob)})`);
      grad.addColorStop(1, `rgba(0, 153, 38, ${0.01 + 0.008 * wob})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Occasional "spray smears" (Matrix green) - less frequent in Firefox
      const sprayInterval = isFirefox ? 120 : 90;
      if (t % sprayInterval === 0) {
        const cx = Math.random() * w;
        const cy = Math.random() * h;
        const rx = 120 + Math.random() * 260;
        const ry = 40 + Math.random() * 140;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((-0.4 + Math.random() * 0.8));
        const g = ctx.createRadialGradient(0, 0, 10, 0, 0, rx);
        g.addColorStop(0, "rgba(0,255,65,0.03)");
        g.addColorStop(0.35, "rgba(0,204,51,0.02)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.scale(1, ry / rx);
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Optimize text rendering for Firefox
      // Batch similar operations and cache font
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const s of p) {
        s.x += s.vx;
        s.y += s.vy;
        s.ph += 0.03;
        if (s.y > h + 12) {
          s.y = -12;
          s.x = Math.random() * w;
          // Randomly change character when wrapping
          if (Math.random() < 0.3) {
            s.char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          }
        }
        if (s.x < -12) s.x = w + 12;
        if (s.x > w + 12) s.x = -12;

        const tw = 0.55 + 0.45 * Math.sin(s.ph);
        const a = 0.08 + tw * 0.20;

        // Matrix green color
        const green = Math.floor(65 + 190 * tw); // Vary between 65 and 255
        const r = 0;
        const g = green;
        const b = Math.floor(green * 0.25); // Slight blue tint

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        
        // Cache font string to avoid repeated string operations
        const fontSize = s.r * 2;
        let fontStr = fontCache.get(fontSize);
        if (!fontStr) {
          fontStr = `${fontSize}px "Courier New", monospace`;
          fontCache.set(fontSize, fontStr);
        }
        ctx.font = fontStr;
        ctx.fillText(s.char, s.x, s.y);
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

  // --- Letter slide animation
  function initSlideAnimation() {
    const markR = document.getElementById("markR");
    const markContainer = document.querySelector(".mark");
    const markSubtitle = document.getElementById("markSubtitle");

    if (!markR) {
      console.warn("markR element not found");
      return;
    }
    if (!markContainer) {
      console.warn("markContainer element not found");
      return;
    }
    if (!markSubtitle) {
      console.warn("markSubtitle element not found");
      return;
    }

    let isAnimating = false;

    function animateSlide() {
      if (isAnimating) return;
      isAnimating = true;

      // Get the current position of the container
      const containerRect = markContainer.getBoundingClientRect();
      const containerCenterX = containerRect.left + containerRect.width / 2;
      const viewportWidth = window.innerWidth;

      // Calculate how far to slide right (off screen)
      const slideDistance = viewportWidth - containerCenterX + containerRect.width / 2 + 100;

      // Phase 1: Slide right and out (ksr), left and out (subtitle)
      markContainer.style.transition = "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
      markContainer.style.transform = `translate(calc(-50% + ${slideDistance}px), -50%)`;
      
      markSubtitle.style.transition = "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
      markSubtitle.style.transform = `translate(calc(-50% - ${slideDistance}px), -50%)`;

      // Phase 2: After sliding out, reset position and slide in
      setTimeout(() => {
        // Reset ksr to left side (off screen)
        markContainer.style.transition = "none";
        markContainer.style.transform = `translate(calc(-50% - ${viewportWidth}px), -50%)`;
        
        // Reset subtitle to right side (off screen)
        markSubtitle.style.transition = "none";
        markSubtitle.style.transform = `translate(calc(-50% + ${viewportWidth}px), -50%)`;

        // Force reflow
        markContainer.offsetHeight;
        markSubtitle.offsetHeight;

        // Phase 3: Slide in from opposite sides to center
        markContainer.style.transition = "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
        markContainer.style.transform = "translate(-50%, -50%)";
        
        markSubtitle.style.transition = "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
        markSubtitle.style.transform = "translate(-50%, -50%)";

        // Reset animation state after animation completes
        setTimeout(() => {
          isAnimating = false;
        }, 400);
      }, 400);
    }

    markR.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("r clicked!");
      animateSlide();
    });
  }

  // Initialize - script is at bottom of body so DOM is ready
  initSlideAnimation();
})();


