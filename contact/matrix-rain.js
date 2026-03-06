/* ==========================================
   MATRIX DIGITAL RAIN BACKGROUND
   
   PURPOSE: Animated canvas-based Matrix-style cascading character
   rain for the contact page. Green katakana and latin characters
   falling in columns at varying speeds.
   
   PERFORMANCE:
   - Uses requestAnimationFrame
   - Respects prefers-reduced-motion (shows static characters)
   - Canvas auto-resizes on window resize (debounced)
   
   ========================================== */

(function () {
    'use strict';

    const canvas = document.getElementById('matrix-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── CHARACTER SET ──────────────────────────────────────
    // Mix of katakana, latin, digits, and symbols for authentic Matrix feel
    const CHARS =
        'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
        '0123456789' +
        '@#$%^&*()_+-=[]{}|;:<>?';

    // ─── CONFIGURATION ──────────────────────────────────────
    const FONT_SIZE = 16;
    const FADE_ALPHA = 0.05;           // Trail fade speed (lower = longer trails)
    const DROP_SPEED_MIN = 0.3;
    const DROP_SPEED_MAX = 1.2;
    const HEAD_COLOR = '#fff';         // Bright white leading character
    const TRAIL_COLOR = '#0f0';        // Classic Matrix green
    const DIM_COLOR = '#004400';       // Faded trailing characters

    let columns, drops, speeds, width, height;

    // ─── INITIALIZATION ─────────────────────────────────────
    function init() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        columns = Math.floor(width / FONT_SIZE);
        drops = [];
        speeds = [];

        for (let i = 0; i < columns; i++) {
            // Stagger initial positions so not all columns start at top
            drops[i] = Math.random() * -100;
            speeds[i] = DROP_SPEED_MIN + Math.random() * (DROP_SPEED_MAX - DROP_SPEED_MIN);
        }

        // Fill background initially
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, width, height);
    }

    // ─── RENDERING ──────────────────────────────────────────
    function render() {
        // Semi-transparent black overlay creates the fade/trail effect
        ctx.fillStyle = `rgba(0, 0, 0, ${FADE_ALPHA})`;
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${FONT_SIZE}px monospace`;

        for (let i = 0; i < columns; i++) {
            const char = CHARS[Math.floor(Math.random() * CHARS.length)];
            const x = i * FONT_SIZE;
            const y = drops[i] * FONT_SIZE;

            // Leading character (bright white/green head)
            ctx.fillStyle = HEAD_COLOR;
            ctx.fillText(char, x, y);

            // Character just behind the head (bright green)
            if (drops[i] > 1) {
                const prevChar = CHARS[Math.floor(Math.random() * CHARS.length)];
                ctx.fillStyle = TRAIL_COLOR;
                ctx.shadowColor = TRAIL_COLOR;
                ctx.shadowBlur = 8;
                ctx.fillText(prevChar, x, y - FONT_SIZE);
                ctx.shadowBlur = 0;
            }

            // Move drop down
            if (!prefersReducedMotion) {
                drops[i] += speeds[i];
            }

            // Reset drop to top when it goes off screen (with some randomness)
            if (drops[i] * FONT_SIZE > height && Math.random() > 0.975) {
                drops[i] = 0;
                speeds[i] = DROP_SPEED_MIN + Math.random() * (DROP_SPEED_MAX - DROP_SPEED_MIN);
            }
        }

        requestAnimationFrame(render);
    }

    // ─── RESIZE HANDLING ────────────────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 200);
    });

    // ─── START ───────────────────────────────────────────────
    init();
    requestAnimationFrame(render);

})();
