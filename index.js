/* =========================================
   PART 1: LOGGING SYSTEM (Text Reader)
   =========================================
   
   FUNCTIONALITY: Reads logs from logz.txt file, parses them by type
   (CODE, GAME, SYS, WRITE, WARN), and displays them in a terminal-style
   stream in the central log area of the page. Picks random logs at 
   intervals and animates them with fade-in/fade-out effects.
   
   This creates the fictional "hacker terminal" aesthetic by simulating 
   real-time system activity logs.
   
   ========================================= */

let logs = [];                                  // Array to store parsed log objects
const logContainer = document.getElementById('log-stream'); // Reference to log display area

/**
 * PHASE 1: FETCH & PARSE LOG FILE
 * Loads logz.txt and parses each line with format: [TYPE] message
 * Stores structured log objects for random display
 */
fetch('logz.txt')
    .then(response => response.text())
    // Parse text into array of log objects
    .then(text => {
        const lines = text.split('\n');
        lines.forEach(line => {
            line = line.trim();
            if (!line) return; // Skip empty lines

            // Extract type (bracketed) and message using regex
            const match = line.match(/^\[(\w+)\]\s*(.*)/);
            if (match) {
                logs.push({
                    type: match[1].toLowerCase(),  // e.g. "code", "game", "sys"
                    text: match[2]                 // e.g. "git push origin master"
                });
            }
        });

        // Start log display stream once data is loaded
        if (logs.length > 0) spawnLog();
    })
    // Graceful fallback if logz.txt fails to load
    .catch(error => {
        console.log("Error loading logs:", error);
        logs = [{ text: "System: Local Mode (Logs unavailable)", type: "sys" }];
        spawnLog();
    });

/**
 * FUNCTION: spawnLog()
 * 
 * PURPOSE: Display a random log from the logs array at intervals
 * - Creates new DOM element with random log
 * - Triggers animation via CSS class
 * - Maintains max 2 logs visible (removes oldest)
 * - Schedules next log display (600-1800ms delay)
 * - Special behavior: "git push" triggers avatar dabbing
 */
function spawnLog() {
    if (logs.length === 0) return;

    // Pick a random log from the array
    const data = logs[Math.floor(Math.random() * logs.length)];
    const el = document.createElement('div');

    // Apply styling classes based on log type
    el.classList.add('log-entry', `log-${data.type}`);
    el.innerHTML = `> ${data.text}`;

    // Add to top of log stream (prepend)
    logContainer.prepend(el);

    // Keep only 4 logs visible - remove older ones (was 2, now shows more at once)
    if (logContainer.children.length > 9) {
        logContainer.lastElementChild.remove();
    }

    // EASTER EGG: If "git push" appears in log, trigger avatar dabbing animation
    if (data.text.toLowerCase().includes("git push")) {
        triggerDab();
    }

    // Schedule next log display with faster random interval (300-1000ms, was 600-1800ms)
    setTimeout(spawnLog, 300 + Math.random() * 700);
}

/* =========================================
   PART 2: ANIMATION SYSTEM (The Avatar)
   =========================================
   
   FUNCTIONALITY: Renders an animated stick-figure character sitting at a
   desk with a monitor. The character cycles through 4 behavioral states:
   - "coding": Green, hands moving fast (typing motion)
   - "gaming": Cyan, mouse-like twitching, leaning forward
   - "writing": Amber, slow contemplative hand movement
   - "dabbing": Magenta, special state triggered by "git push" logs
   
   Uses HTML5 Canvas for performance. Avatar responds to window resizing
   and maintains aspect ratio via CSS viewport calculations.
   
   ========================================= */

const canvas = document.getElementById('hacker-den'); // Canvas element for drawing
const ctx = canvas.getContext('2d');                  // 2D drawing context

// Canvas sizing variables
let width, height, scale;
let cssWidth, cssHeight;  // CSS pixel dimensions (used for drawing coordinates)

/**
 * FUNCTION: resize()
 * 
 * PURPOSE: Update canvas and scale factor on window resize
 * - Sets canvas resolution to match window dimensions
 * - Calculates scale factor to adapt avatar to viewport
 * 
 * PERFORMANCE NOTE: This is called on every resize event.
 * Consider throttling/debouncing in production for smoother performance.
 */
function resize() {
    const dpr = window.devicePixelRatio || 1;
    cssWidth = window.innerWidth;
    cssHeight = window.innerHeight;
    width = canvas.width = cssWidth * dpr;
    height = canvas.height = cssHeight * dpr;
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
    ctx.scale(dpr, dpr);
    // Scale between 0.6x and 1.2x based on CSS viewport size
    scale = Math.max(0.6, Math.min(Math.min(cssWidth / 500, cssHeight / 500), 1.2));
}
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 150); // Debounce to 150ms
});
resize(); // Initial call on page load

// --- ANIMATION STATE VARIABLES ---
let state = "coding";              // Current behavioral state
let lastStateChange = 0;           // Timestamp of last state transition
let currentColor = '#0f0';         // Glow color (changes per state)
let isDabbing = false;             // Flag to prevent state changes while dabbing

/**
 * FUNCTION: triggerDab()
 * 
 * PURPOSE: Trigger special "dabbing" animation (Easter egg)
 * Called when "git push" appears in logs or can be manually triggered
 * - Sets state to "dabbing" and color to magenta
 * - Locks animation in this state for 2.5 seconds
 * - After timeout, allows state to return to normal cycling
 */
function triggerDab() {
    state = "dabbing";
    isDabbing = true;
    lastStateChange = Date.now(); // Reset timer so he dabs for full duration

    // Automatically exit dabbing state after 2.5 seconds
    setTimeout(() => {
        isDabbing = false;
    }, 2500);
}

/**
 * UTILITY FUNCTION: drawLine(ctx, x1, y1, x2, y2)
 * 
 * PURPOSE: Draw a single line from point 1 to point 2
 * Uses the canvas context's current stroke style and line width
 * Reduces code repetition for countless line draws in avatar
 */
function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

/**
 * FUNCTION: drawChair(ctx, cx, cy, scale)
 * 
 * PURPOSE: Draw an office chair behind the avatar
 * - Creates visual context that avatar is sitting
 * - Drawn FIRST so avatar renders on top
 * 
 * COMPONENTS:
 * - Seat: Horizontal line
 * - Backrest: Vertical lines for chair back
 * - Base: Hydraulic cylinder to floor
 * - Feet: Star-pattern base typical of office chairs
 */
function drawChair(ctx, cx, cy, scale) {
    ctx.strokeStyle = '#333';      // Dark grey (subtle, background element)
    ctx.lineWidth = 2 * scale;

    // Seat: horizontal platform
    drawLine(ctx, cx - 25 * scale, cy + 5 * scale, cx + 25 * scale, cy + 5 * scale);

    // Backrest: vertical support lines
    drawLine(ctx, cx - 20 * scale, cy + 5 * scale, cx - 25 * scale, cy - 50 * scale);

    // Base/Leg: hydraulic cylinder connecting seat to floor
    drawLine(ctx, cx, cy + 5 * scale, cx, cy + 40 * scale);

    // Feet: star-pattern base (typical office chair)
    drawLine(ctx, cx, cy + 40 * scale, cx - 20 * scale, cy + 50 * scale);
    drawLine(ctx, cx, cy + 40 * scale, cx + 20 * scale, cy + 50 * scale);
}

/**
 * FUNCTION: drawAvatar(ctx, cx, cy, frameCount)
 * 
 * PURPOSE: Main rendering function for the entire avatar scene
 * Combines all elements: chair, desk, monitor, avatar body, and state-based animations
 * 
 * PARAMETERS:
 * - ctx: Canvas context for drawing
 * - cx, cy: Center coordinates of avatar position
 * - frameCount: Animation frame number (used for smooth motion calculations)
 * 
 * DRAWING ORDER (back to front to prevent z-index issues):
 * 1. Chair (background)
 * 2. Desk and monitor
 * 3. Avatar body (spine, legs, arms, head)
 */
function drawAvatar(ctx, cx, cy, frameCount) {
    // LAYER 1: Draw Chair First (Behind avatar for proper depth)
    drawChair(ctx, cx, cy, scale);

    ctx.strokeStyle = '#e0e0e0';   // Light grey for body lines
    ctx.lineWidth = 2.5 * scale;
    ctx.lineCap = 'round';         // Rounded line caps for smoother look
    ctx.shadowBlur = 0;            // No shadow on body

    // --- BODY STRUCTURE INITIALIZATION ---
    // These are anchor points that define the skeleton
    let headY = cy - 70 * scale;           // Y position of head (upper body reference)
    let headX = cx;                        // X position of head (center by default)
    let torsoLean = 0;                     // Lean angle in pixels (positive = lean right)

    // Default arm positions (resting)
    let handL = { x: cx - 20 * scale, y: cy - 10 * scale };  // Left palm
    let handR = { x: cx + 20 * scale, y: cy - 10 * scale };  // Right palm
    let elbowL = { x: cx - 25 * scale, y: cy - 35 * scale }; // Left elbow
    let elbowR = { x: cx + 25 * scale, y: cy - 35 * scale }; // Right elbow

    // Animation speed multiplier based on frame count
    const speed = frameCount * 0.15;

    // --- BEHAVIOR LOGIC: State-specific animations ---
    // Each state modifies body position and limb movement

    if (state === "coding") {
        // Coding: Focused, typing-like hand motion
        currentColor = '#0f0'; // Green glow
        torsoLean = 10 * scale;
        // Hands moving fast in opposite directions (typing simulation)
        handL.y += Math.sin(speed) * 3 * scale;
        handR.y += Math.cos(speed) * 3 * scale;
    }
    else if (state === "gaming") {
        // Gaming: Engaged, leaning forward, mouse movement
        currentColor = '#0ff'; // Cyan glow
        torsoLean = 25 * scale;  // Lean forward more
        headY += 5 * scale;       // Neck forward slightly
        handR.x += (Math.sin(speed * 4)) * 2 * scale; // Mouse twitching (fast)
    }
    else if (state === "writing") {
        // Writing: Contemplative, slow hand movement
        currentColor = '#ffb000'; // Amber glow
        torsoLean = -5 * scale;   // Slight lean back
        // One hand moves very slowly (writing motion)
        handL.y += Math.sin(speed * 0.5) * 2 * scale;
    }
    // --- THE DAB STATE ---
    else if (state === "dabbing") {
        // Dabbing: Celebration move (special animation)
        currentColor = '#ff00ff'; // Magenta party mode!
        torsoLean = 30 * scale;   // Dramatic lean right
        headY += 15 * scale;      // Drop head down "into" elbow
        headX += 15 * scale;      // Shift head right

        // Left Arm (The "Block"): Bent across face/head
        elbowL = { x: cx + 10 * scale, y: cy - 60 * scale }; // Elbow positioned high
        handL = { x: cx - 20 * scale, y: cy - 80 * scale };  // Hand blocked back

        // Right Arm (The "Point"): Straight out and up to the sky
        elbowR = { x: cx + 50 * scale, y: cy - 50 * scale };
        handR = { x: cx + 90 * scale, y: cy - 80 * scale };  // Triumphantly pointing
    }

    // === RENDERING LAYER 1: DESK & MONITOR ===
    ctx.shadowBlur = 10;
    ctx.shadowColor = currentColor;       // Glow effect matches state color
    ctx.strokeStyle = currentColor;

    // Desk surface: horizontal line representing desk
    drawLine(ctx, cx - 150 * scale, cy, cx + 150 * scale, cy);

    // Monitor: rectangle on desk
    if (state !== 'dabbing') {
        // Normal state: regular monitor
        ctx.strokeRect(cx - 50 * scale, cy - 100 * scale, 100 * scale, 60 * scale);
    } else {
        // Dabbing state: screen flashes brighter
        ctx.shadowBlur = 20;
        ctx.strokeRect(cx - 50 * scale, cy - 100 * scale, 100 * scale, 60 * scale);
    }

    // === RENDERING LAYER 2: AVATAR BODY ===
    ctx.shadowBlur = 0;            // Remove shadow for body
    ctx.strokeStyle = '#e0e0e0';   // Return to light grey

    // Spine: vertical line from torso to neck
    drawLine(ctx, cx, cy, cx + torsoLean, headY + 30 * scale);

    // Legs (sitting position): two segments per leg
    // Left leg
    drawLine(ctx, cx, cy, cx - 20 * scale, cy + 40 * scale);          // Thigh
    drawLine(ctx, cx - 20 * scale, cy + 40 * scale, cx - 25 * scale, cy + 80 * scale); // Calf/foot

    // Right leg
    drawLine(ctx, cx, cy, cx + 20 * scale, cy + 40 * scale);          // Thigh
    drawLine(ctx, cx + 20 * scale, cy + 40 * scale, cx + 25 * scale, cy + 80 * scale); // Calf/foot

    // Arms: Shoulder → Elbow → Hand (3-part chain per arm)
    const shX = cx + (torsoLean * 0.8);  // Shoulder X follows torso lean
    const shY = headY + 35 * scale;       // Shoulder Y (below head)

    // Left Arm: 2 segments
    drawLine(ctx, shX, shY, elbowL.x, elbowL.y);      // Shoulder to elbow
    drawLine(ctx, elbowL.x, elbowL.y, handL.x, handL.y); // Elbow to hand

    // Right Arm: 2 segments
    drawLine(ctx, shX, shY, elbowR.x, elbowR.y);      // Shoulder to elbow
    drawLine(ctx, elbowR.x, elbowR.y, handR.x, handR.y); // Elbow to hand

    // Head: simple circle
    ctx.beginPath();
    ctx.arc(headX, headY, 10 * scale, 0, Math.PI * 2); // Draw circle
    ctx.fillStyle = '#111';  // Very dark fill (barely visible against background)
    ctx.fill();              // Fill circle
    ctx.stroke();            // Outline circle
}

// ========================================
// PART 3: ANIMATION LOOP (Continuous Render)
// ========================================
// 
// FUNCTIONALITY: Main animation frame loop that:
// 1. Clears canvas each frame
// 2. Updates avatar state every 4 seconds (if not dabbing)
// 3. Draws avatar with new frame count
// 4. Continuously requests next frame (60 FPS on most devices)
//
// This creates smooth motion by redrawing the entire scene
// each frame with slightly different parameters.
//
// ========================================

let frame = 0; // Frame counter for smooth motion calculations
const MAX_FRAME = 10000; // Reset periodically to prevent overflow

/**
 * FUNCTION: animate()
 * 
 * PURPOSE: Main animation loop - called ~60 times per second
 * 
 * PROCESS:
 * 1. Clear entire canvas (remove previous drawings)
 * 2. If NOT dabbing and 4+ seconds since last state change:
 *    → Randomly pick new state (coding, gaming, or writing)
 *    → Reset state change timer
 * 3. Draw avatar with current frame count
 * 4. Increment frame counter (used for smooth animations)
 * 5. Request next frame from browser (requestAnimationFrame)
 * 
 * PERFORMANCE NOTE: This runs on every frame (~16.6ms per frame at 60 FPS).
 * Consider frame skipping or requestAnimationFrame rate limiting if performance
 * drops on lower-end devices.
 */
const FPS_TARGET = 30; // or 24 for lower-end
let lastFrameTime = 0;

function animate() {
    const now = performance.now();
    const timeSinceLastFrame = now - lastFrameTime;
    const frameInterval = 1000 / FPS_TARGET;

    // Only draw if enough time has passed since last frame
    if (timeSinceLastFrame >= frameInterval) {
        ctx.clearRect(0, 0, cssWidth, cssHeight); // Clear entire canvas (CSS coords, ctx.scale handles DPR)

        // STATE MACHINE: Randomly cycle states every 4 seconds (unless dabbing)
        if (!isDabbing && Date.now() - lastStateChange > 4000) {
            // Pick a random state from the three main options
            state = ["coding", "gaming", "writing"][Math.floor(Math.random() * 3)];
            lastStateChange = Date.now(); // Update timer
        }

        // Render the avatar with current frame number (for motion calculations)
        frame = (frame + 1) % MAX_FRAME; // Increment frame, reset if it gets too high to prevent overflow
        drawAvatar(ctx, cssWidth / 2, cssHeight - (cssHeight * 0.15), frame); // Position avatar near bottom center

        lastFrameTime = now;
    }

    // Always request next frame from browser's render cycle
    requestAnimationFrame(animate);
}

// START ANIMATION LOOP
animate();