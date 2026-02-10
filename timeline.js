/* ==========================================
   TIMELINE FILTER FUNCTIONALITY
   
   PURPOSE: Manage filtering of timeline items by category
   
   CATEGORIES (from HTML data-filter attributes):
   - "all": Show all items
   - "edu": Education (degrees, certifications)
   - "work": Work experience / jobs
   - "project": Personal projects
   
   FUNCTIONALITY:
   1. Process button clicks to filter items
   2. Show/hide timeline items based on selected filter
   3. Hide year headers that have no visible items
   4. Update active button styling
   
   PERFORMANCE NOTES:
   - Currently uses jQuery-style DOM traversal
   - Could be optimized with event delegation or data attributes
   - Current approach scales fine for <100 items on timeline
   
   ========================================== */

// === DOM ELEMENT REFERENCES ===
const buttons = document.querySelectorAll(".timeline-nav button");  // Filter buttons
const items = document.querySelectorAll(".timeline-item");          // Timeline entries
const years = document.querySelectorAll(".timeline-year");          // Year headers (2026, 2025, etc)

// === EVENT LISTENERS: Filter Button Clicks ===
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;  // Get filter type from data attribute (e.g. "edu", "work")

        // --- STEP 1: Update button styling ---
        // Remove "active" class from all buttons
        buttons.forEach(b => b.classList.remove("active"));
        // Add "active" class to clicked button
        button.classList.add("active");

        // --- STEP 2: Show/hide timeline items based on filter ---
        items.forEach(item => {
            // Determine if item should be visible:
            // - If filter is "all": show everything
            // - Otherwise: show only if item has the filter class
            // (e.g. if filtering "edu", show items with class "edu")
            const show =
                filter === "all" || item.classList.contains(filter);

            // Show or hide the item
            item.style.display = show ? "" : "none";
        });

        // --- STEP 3: Hide year headers with no visible children ---
        // Year headers (like "2026") should only show if at least one item below them is visible
        years.forEach(year => {
            let next = year.nextElementSibling;      // Start checking next element after year
            let visible = false;                       // Flag: does this year have any visible items?

            // Loop through all siblings until we hit the next year header
            while (next && !next.classList.contains("timeline-year")) {
                // Check if this sibling is a timeline-item AND is currently visible
                if (
                    next.classList.contains("timeline-item") &&
                    next.style.display !== "none"
                ) {
                    visible = true;  // Found at least one visible item
                    break;           // Stop searching
                }
                next = next.nextElementSibling;  // Move to next sibling
            }

            // Show or hide the year header based on whether it has visible items
            year.style.display = visible ? "" : "none";
        });
    });
});