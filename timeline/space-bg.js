/* ==========================================
   REAL-TIME SPACE BACKGROUND

   PURPOSE: Animated canvas-based space backdrop for the timeline page.
   Renders a starfield with twinkling, drifting nebula clouds,
   and occasional shooting stars behind page content.

   PERFORMANCE:
   - Uses requestAnimationFrame for smooth 60fps rendering
   - Respects prefers-reduced-motion (disables animations)
   - Canvas auto-resizes on window resize (debounced)
   - HiDPI / Retina aware (uses devicePixelRatio)

   ========================================== */

(function () {
    'use strict';

    // ─── CONFIGURATION ─────────────────────────────────────
    const CONFIG = {
        // Star counts scale with viewport area — high density for rich starfield
        STAR_DENSITY: 0.0006,          // stars per CSS pixel (thick starfield)
        STAR_MIN_SIZE: 0.4,
        STAR_MAX_SIZE: 2.8,
        STAR_TWINKLE_SPEED: 0.006,     // radians per frame (fast, noticeable twinkle)

        // Nebula clouds — vivid and obvious
        NEBULA_COUNT: 7,
        NEBULA_MIN_RADIUS: 220,
        NEBULA_MAX_RADIUS: 500,
        NEBULA_DRIFT_SPEED: 0.15,      // CSS pixels per frame
        NEBULA_OPACITY: 0.09,

        // Shooting stars — frequent and impressive
        SHOOTING_STAR_CHANCE: 0.012,   // chance per frame (~once every 1.5s)
        SHOOTING_STAR_SPEED: 16,
        SHOOTING_STAR_LENGTH: 160,
        SHOOTING_STAR_LIFE: 50,        // frames

        // Parallax
        PARALLAX_STRENGTH: 0.08,
    };

    // ─── CANVAS SETUP ───────────────────────────────────────
    const canvas = document.getElementById('space-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Check reduced motion preference
    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Logical (CSS) dimensions — used for all coordinate math
    let W, H;
    let stars, nebulae, shootingStars, currentScrollY;

    // ─── UTILITY ────────────────────────────────────────────
    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function hsla(h, s, l, a) {
        return `hsla(${h}, ${s}%, ${l}%, ${a})`;
    }

    // ─── STAR CREATION ──────────────────────────────────────
    function createStar() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            size: rand(CONFIG.STAR_MIN_SIZE, CONFIG.STAR_MAX_SIZE),
            baseAlpha: rand(0.3, 1),
            alpha: 0,
            twinkleOffset: Math.random() * Math.PI * 2,
            twinkleSpeed: rand(0.001, CONFIG.STAR_TWINKLE_SPEED),
            hue: rand(200, 240),
            saturation: rand(0, 30),
            lightness: rand(85, 100),
            depth: Math.random(),
        };
    }

    // ─── NEBULA CREATION ────────────────────────────────────
    function createNebula() {
        const palette = [
            { h: 240, s: 60, l: 40 },   // deep blue
            { h: 270, s: 50, l: 35 },   // purple
            { h: 320, s: 40, l: 30 },   // magenta
            { h: 200, s: 70, l: 30 },   // teal-blue
            { h: 350, s: 50, l: 30 },   // warm rose
        ];
        const color = palette[Math.floor(Math.random() * palette.length)];
        return {
            x: rand(-200, W + 200),
            y: rand(-200, H + 200),
            radius: rand(CONFIG.NEBULA_MIN_RADIUS, CONFIG.NEBULA_MAX_RADIUS),
            color,
            driftX: rand(-CONFIG.NEBULA_DRIFT_SPEED, CONFIG.NEBULA_DRIFT_SPEED),
            driftY: rand(-CONFIG.NEBULA_DRIFT_SPEED, CONFIG.NEBULA_DRIFT_SPEED),
            pulseOffset: Math.random() * Math.PI * 2,
            pulseSpeed: rand(0.003, 0.008),
        };
    }

    // ─── SHOOTING STAR CREATION ─────────────────────────────
    function createShootingStar() {
        const angle = rand(Math.PI * 0.15, Math.PI * 0.4);
        const side = Math.random() > 0.5;
        return {
            x: side ? rand(0, W) : rand(W * 0.3, W),
            y: rand(-50, H * 0.3),
            vx: Math.cos(angle) * CONFIG.SHOOTING_STAR_SPEED * (side ? 1 : -1),
            vy: Math.sin(angle) * CONFIG.SHOOTING_STAR_SPEED,
            life: CONFIG.SHOOTING_STAR_LIFE,
            maxLife: CONFIG.SHOOTING_STAR_LIFE,
            length: rand(80, CONFIG.SHOOTING_STAR_LENGTH),
        };
    }

    // ─── INITIALIZATION ─────────────────────────────────────
    function init() {
        const dpr = window.devicePixelRatio || 1;

        // Logical (CSS) size = viewport
        W = window.innerWidth;
        H = window.innerHeight;

        // Canvas backing store at native device resolution
        canvas.width = W * dpr;
        canvas.height = H * dpr;

        // CSS display size stays at viewport
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';

        // Scale context so we draw in CSS-pixel coordinates
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        currentScrollY = window.scrollY || 0;

        // Generate stars — density based on CSS pixels
        const starCount = Math.floor(W * H * CONFIG.STAR_DENSITY);
        stars = Array.from({ length: starCount }, createStar);

        // Generate nebulae
        nebulae = Array.from({ length: CONFIG.NEBULA_COUNT }, createNebula);

        // No initial shooting stars
        shootingStars = [];
    }

    // ─── RENDERING ──────────────────────────────────────────

    let frameCount = 0;

    function render() {
        frameCount++;

        // Clear canvas (CSS coordinates since context is scaled)
        ctx.clearRect(0, 0, W, H);

        // ── Draw nebulae (behind stars) ──
        nebulae.forEach(n => {
            if (!prefersReducedMotion) {
                n.x += n.driftX;
                n.y += n.driftY;

                // Wrap around edges with buffer
                if (n.x < -n.radius * 2) n.x = W + n.radius;
                if (n.x > W + n.radius * 2) n.x = -n.radius;
                if (n.y < -n.radius * 2) n.y = H + n.radius;
                if (n.y > H + n.radius * 2) n.y = -n.radius;
            }

            const pulse = prefersReducedMotion
                ? 1
                : 0.7 + 0.3 * Math.sin(frameCount * n.pulseSpeed + n.pulseOffset);
            const alpha = CONFIG.NEBULA_OPACITY * pulse;

            const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
            grad.addColorStop(0, hsla(n.color.h, n.color.s, n.color.l, alpha));
            grad.addColorStop(0.5, hsla(n.color.h, n.color.s, n.color.l, alpha * 0.4));
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2);
        });

        // ── Draw stars ──
        // Parallax: offset stars slightly based on scroll to simulate depth
        const scrollOffset = currentScrollY * CONFIG.PARALLAX_STRENGTH;

        stars.forEach(star => {
            // Twinkle
            if (prefersReducedMotion) {
                star.alpha = star.baseAlpha;
            } else {
                star.alpha =
                    star.baseAlpha *
                    (0.5 + 0.5 * Math.sin(frameCount * star.twinkleSpeed + star.twinkleOffset));
            }

            // Parallax: shift y based on depth and scroll, then wrap within viewport
            let py = star.y - scrollOffset * star.depth;
            // Modulo wrap so stars cycle through the viewport
            py = ((py % H) + H) % H;

            ctx.beginPath();
            ctx.arc(star.x, py, star.size, 0, Math.PI * 2);
            ctx.fillStyle = hsla(star.hue, star.saturation, star.lightness, star.alpha);
            ctx.fill();

            // Add subtle glow to larger stars
            if (star.size > 1.5) {
                ctx.beginPath();
                ctx.arc(star.x, py, star.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = hsla(star.hue, star.saturation, star.lightness, star.alpha * 0.1);
                ctx.fill();
            }
        });

        // ── Shooting stars ──
        if (!prefersReducedMotion) {
            // Maybe spawn a new one
            if (Math.random() < CONFIG.SHOOTING_STAR_CHANCE) {
                shootingStars.push(createShootingStar());
            }

            shootingStars.forEach(ss => {
                ss.x += ss.vx;
                ss.y += ss.vy;
                ss.life--;

                const progress = ss.life / ss.maxLife;
                const alpha = progress * 0.9;

                // Trail
                const tailX = ss.x - (ss.vx / CONFIG.SHOOTING_STAR_SPEED) * ss.length;
                const tailY = ss.y - (ss.vy / CONFIG.SHOOTING_STAR_SPEED) * ss.length;

                const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
                grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
                grad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

                ctx.beginPath();
                ctx.moveTo(tailX, tailY);
                ctx.lineTo(ss.x, ss.y);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Bright head
                ctx.beginPath();
                ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
            });

            // Remove dead shooting stars
            shootingStars = shootingStars.filter(ss => ss.life > 0);
        }

        requestAnimationFrame(render);
    }

    // ─── RESIZE HANDLING (debounced) ────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(init, 200);
    });

    // ─── SCROLL TRACKING ────────────────────────────────────
    window.addEventListener('scroll', () => {
        currentScrollY = window.scrollY || 0;
    }, { passive: true });

    // ─── START ───────────────────────────────────────────────
    init();
    requestAnimationFrame(render);

})();
