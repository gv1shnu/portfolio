/* ==========================================
   CONTACT PAGE EFFECTS
   
   1. TYPEWRITER: Types out .typed-line elements sequentially
      with a blinking cursor, then reveals .reveal-on-typed elements.
   
   2. GLITCH: Adds random glitch distortion on .glitch-hover
      elements when hovered via mouseenter/mouseleave events.
   
   Respects prefers-reduced-motion.
   ========================================== */

(function () {
    'use strict';

    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ─── TYPEWRITER ─────────────────────────────────────────

    const lines = document.querySelectorAll('.typed-line');
    const reveals = document.querySelectorAll('.reveal-on-typed');

    // If reduced motion, show everything immediately
    if (prefersReducedMotion) {
        lines.forEach(el => { el.textContent = el.dataset.type; });
        reveals.forEach(el => { el.style.opacity = '1'; });
        return;
    }

    const CHAR_DELAY = 45;        // ms between characters
    const LINE_PAUSE = 300;       // ms pause between lines
    const CURSOR = '\u2588';      // █ block cursor

    let currentLine = 0;
    let currentChar = 0;
    let cursorVisible = true;
    let cursorInterval;

    function startCursorBlink(element) {
        // Blink the cursor on the active element
        clearInterval(cursorInterval);
        cursorInterval = setInterval(() => {
            cursorVisible = !cursorVisible;
            const text = element.dataset.type.slice(0, currentChar);
            element.textContent = text + (cursorVisible ? CURSOR : ' ');
        }, 400);
    }

    function typeNextChar() {
        if (currentLine >= lines.length) {
            // All lines typed — remove cursor from last line and reveal elements
            const lastEl = lines[lines.length - 1];
            lastEl.textContent = lastEl.dataset.type;
            clearInterval(cursorInterval);
            revealElements();
            return;
        }

        const el = lines[currentLine];
        const fullText = el.dataset.type;

        if (currentChar === 0) {
            startCursorBlink(el);
        }

        if (currentChar <= fullText.length) {
            el.textContent = fullText.slice(0, currentChar) + CURSOR;
            currentChar++;
            setTimeout(typeNextChar, CHAR_DELAY);
        } else {
            // Line complete — remove cursor, pause, move to next
            el.textContent = fullText;
            clearInterval(cursorInterval);
            currentChar = 0;
            currentLine++;
            setTimeout(typeNextChar, LINE_PAUSE);
        }
    }

    function revealElements() {
        reveals.forEach((el, i) => {
            setTimeout(() => {
                el.style.transition = 'opacity 0.5s ease';
                el.style.opacity = '1';
            }, i * 200);
        });
    }

    // Start with a brief delay to let Matrix rain settle in
    setTimeout(typeNextChar, 600);

    // ─── GLITCH HOVER ───────────────────────────────────────

    const glitchTargets = document.querySelectorAll('.glitch-hover');

    glitchTargets.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.classList.add('glitching');
            // Run the glitch animation for a short burst
            setTimeout(() => {
                el.classList.remove('glitching');
            }, 300);
        });
    });

})();
