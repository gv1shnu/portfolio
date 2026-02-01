const buttons = document.querySelectorAll(".timeline-nav button");
const items = document.querySelectorAll(".timeline-item");
const years = document.querySelectorAll(".timeline-year");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const filter = button.dataset.filter;

        buttons.forEach(b => b.classList.remove("active"));
        button.classList.add("active");

        items.forEach(item => {
            const show =
                filter === "all" || item.classList.contains(filter);

            item.style.display = show ? "" : "none";
        });

        // Hide years that have no visible items below them
        years.forEach(year => {
            let next = year.nextElementSibling;
            let visible = false;

            while (next && !next.classList.contains("timeline-year")) {
                if (
                    next.classList.contains("timeline-item") &&
                    next.style.display !== "none"
                ) {
                    visible = true;
                    break;
                }
                next = next.nextElementSibling;
            }

            year.style.display = visible ? "" : "none";
        });
    });
});