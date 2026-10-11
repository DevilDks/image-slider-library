
(() => {
    "use strict";

    const slider = document.querySelector(".slider");

    if (!slider) return;

    const viewport = slider.querySelector(".slider__viewport");
    const track = slider.querySelector(".slider__track");
    const previousButton = slider.querySelector(
        ".slider__arrow--previous"
    );
    const nextButton = slider.querySelector(
        ".slider__arrow--next"
    );
    const dotsContainer = slider.querySelector(".slider__dots");
    const counter = slider.querySelector(".slider__counter");

    const originalSlides = Array.from(track.children);
    const totalSlides = originalSlides.length;
    const duration = 550;

    if (totalSlides === 0) return;

    let currentIndex = 0;
    let trackPosition = 1;
    let isAnimating = false;
    let animationTimer;

    const dots = [];

    // Handle the special case of a single slide.
    if (totalSlides === 1) {
        previousButton.hidden = true;
        nextButton.hidden = true;
        dotsContainer.hidden = true;
        counter.textContent = "01 / 01";
        return;
    }

    // Clone the first and last slides for infinite looping.
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[totalSlides - 1].cloneNode(true);

    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");

    firstClone.querySelector("img")?.setAttribute("alt", "");
    lastClone.querySelector("img")?.setAttribute("alt", "");

    track.insertBefore(lastClone, originalSlides[0]);
    track.appendChild(firstClone);

    // Move the track horizontally.
    function moveTrack(animate = true) {
        track.style.transition = animate
            ? `transform ${duration}ms ease-in-out`
            : "none";

        track.style.transform =
            `translateX(-${trackPosition * 100}%)`;
    }

    // Update the active dot and slide counter.
    function updateIndicators() {
        dots.forEach((dot, index) => {
            dot.setAttribute(
                "aria-current",
                String(index === currentIndex)
            );
        });

        counter.textContent =
            `${String(currentIndex + 1).padStart(2, "0")} / ` +
            `${String(totalSlides).padStart(2, "0")}`;
    }

    // Finish the animation and jump past a clone if needed.
    function finishAnimation() {
        clearTimeout(animationTimer);
        isAnimating = false;

        if (trackPosition === 0) {
            trackPosition = totalSlides;
            moveTrack(false);
        } else if (trackPosition === totalSlides + 1) {
            trackPosition = 1;
            moveTrack(false);
        }
    }

    // Navigate to a requested slide.
    function goTo(index, direction = null) {
        if (isAnimating || index === currentIndex) return;

        isAnimating = true;

        if (direction === "next") {
            trackPosition++;
        } else if (direction === "previous") {
            trackPosition--;
        } else {
            trackPosition = index + 1;
        }

        currentIndex =
            (index + totalSlides) % totalSlides;

        updateIndicators();
        moveTrack(true);

        // Fallback in case transitionend does not fire.
        animationTimer = setTimeout(
            finishAnimation,
            duration + 80
        );
    }

    function goNext() {
        if (isAnimating) return;

        goTo(
            (currentIndex + 1) % totalSlides,
            "next"
        );
    }

    function goPrevious() {
        if (isAnimating) return;

        goTo(
            (currentIndex - 1 + totalSlides) % totalSlides,
            "previous"
        );
    }

    // Create one clickable dot per original slide.
    originalSlides.forEach((slide, index) => {
        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = "slider__dot";
        dot.setAttribute("aria-label", `Go to image ${index + 1}`);
        dot.setAttribute(
            "aria-current",
            String(index === currentIndex)
        );

        dot.addEventListener("click", () => {
            goTo(index);
        });

        dotsContainer.appendChild(dot);
        dots.push(dot);
    });

    // Attach the navigation event listeners.
    previousButton.addEventListener("click", goPrevious);
    nextButton.addEventListener("click", goNext);

    // Support keyboard navigation.
    slider.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            goPrevious();
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            goNext();
        }
    });

    // Complete transitions as soon as CSS reports they have ended.
    track.addEventListener("transitionend", (event) => {
        if (
            event.target === track &&
            event.propertyName === "transform"
        ) {
            finishAnimation();
        }
    });

    // Keep the slider correctly positioned when resized.
    const resizeObserver = new ResizeObserver(() => {
        moveTrack(false);
    });

    resizeObserver.observe(viewport);

    // Initialize the slider at the first real slide.
    moveTrack(false);
    updateIndicators();
})();