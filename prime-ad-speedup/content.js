console.log("[Prime Ad Speedup] loaded");

// let dummy = [...document.querySelectorAll("video")].find(v => !v.paused && v.currentTime > 0).playbackRate=1.4;
let adPlaying = false;
let originalPlaybackRate = 1.4;
let speedEnforceTimer = null;

function getVideo() {
    return [...document.querySelectorAll("video")].find(v => !v.paused && v.currentTime > 0) || null;
}

function startAdSpeedup() {

    const v = getVideo();
    if (!v) {
        return;
    }
    if (adPlaying) {
        return;
    }

    originalPlaybackRate = v.playbackRate;
    console.log(`[Prime Ad Speedup] Ad detected. ${originalPlaybackRate}x -> 16x`);

    speedEnforceTimer = setInterval(() => {
        console.log("enforce speed, current", getVideo()?.playbackRate);
        const v = getVideo();

        if (!v) {
            return;
        }
        if (v.playbackRate !== 16) {
            v.playbackRate = 16;
        }
    }, 100);
    adPlaying = true;
}

function stopAdSpeedup() {
    const v = getVideo();

    if (!adPlaying) {
        return;
    }
    console.log("stopAdSpeedup called");

    if (speedEnforceTimer) {
        clearInterval(speedEnforceTimer);
        speedEnforceTimer = null;
    }
    if (v) {
        v.playbackRate = originalPlaybackRate;
        console.log(`[Prime Ad Speedup] Ad finished. restore -> ${originalPlaybackRate}x`);
    }
    adPlaying = false;
}

setInterval(() => {
    if (document.querySelector(".atvwebplayersdk-ad-timer-remaining-time") !== null) {
        startAdSpeedup();
    } else {
        stopAdSpeedup();
    }
}, 400);
