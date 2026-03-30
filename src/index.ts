import { createLogger } from "./console";

const logger = createLogger({ label: "Video Ends At" });

function addCustomSpans() {
    const timeContents = document.querySelector(".ytp-time-contents");
    if (!timeContents) return;

    // Avoid duplicates
    if (timeContents.querySelector(".vea-bullet")) return;

    const bullet = document.createElement("span");
    bullet.className = "vea-bullet";
    bullet.textContent = " • ";

    const testText = document.createElement("span");
    testText.className = "vea-timestamp";
    testText.textContent = "Ends at --:--:--";

    timeContents.appendChild(bullet);
    timeContents.appendChild(testText);

    logger.debug("Added custom spans to .ytp-time-contents");
}

// Calculate and update "ends at" text based on progress bar
function updateEndsAt() {
    const progressBar = document.querySelector<HTMLElement>(".ytp-progress-bar");
    const testText = document.querySelector(".vea-timestamp") as HTMLElement | null;
    if (!progressBar || !testText) return;

    const now = Number(progressBar.getAttribute("aria-valuenow")) || 0;
    const max = Number(progressBar.getAttribute("aria-valuemax")) || 0;
    if (max === 0) return;

    const timeLeft = max - now;
    const likelyToEndAt = new Date(Date.now() + timeLeft * 1000);

    const hh = likelyToEndAt.getHours().toString().padStart(2, "0");
    const mm = likelyToEndAt.getMinutes().toString().padStart(2, "0");
    const ss = likelyToEndAt.getSeconds().toString().padStart(2, "0");

    testText.textContent = `ends at ${hh}:${mm}:${ss}`;
}

function doTheThing() {
    let url: URL;
    try {
        url = new URL(window.location.href);
    } catch {
        throw new Error("Invalid URL");
    }

    const YT_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;
    const vParam = url.searchParams.get("v");
    const isWatch = url.pathname === "/watch" && vParam && YT_ID_REGEX.test(vParam);

    if (!isWatch) {
        logger.error("Not a YouTube video page");
        return;
    }

    logger.debug("Valid YouTube video page detected");
}

// MutationObserver integration
function setupObservers() {
    const player = document.querySelector(".html5-video-player") || document.body;

    // Observe for control reloads (to re-add spans)
    const uiObserver = new MutationObserver(() => addCustomSpans());
    uiObserver.observe(player, { childList: true, subtree: true });

    // Observe the progress bar for value changes
    function attachProgressObserver() {
        const timeCurrent = document.querySelector(".ytp-time-current");
        if (!timeCurrent) {
            setTimeout(attachProgressObserver, 500);
            return;
        }

        // Observe text changes inside the time element (covers direct text node changes and replacements)
        const progressObserver = new MutationObserver(() => updateEndsAt());
        progressObserver.observe(timeCurrent, {
            childList: true,
            characterData: true,
            subtree: true,
        });

        logger.debug("Attached MutationObserver to .ytp-time-current");
        updateEndsAt(); // initial update
    }

    attachProgressObserver();
    addCustomSpans();
}

// Initialize everything
function init() {
    doTheThing();
    setupObservers();
}

// Handle SPA navigation changes
window.addEventListener("yt-navigate-finish", () => {
    logger.debug("Navigation detected, reinitializing observers...");
    init();
});

// Initial run
init();
