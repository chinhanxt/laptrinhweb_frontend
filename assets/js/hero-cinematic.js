window.APEXCinematicHero = (function () {
  var videoEl;
  var fallbackEl;

  function showFallback() {
    if (fallbackEl) {
      fallbackEl.classList.remove("is-hidden");
    }
    if (videoEl) {
      videoEl.classList.add("is-hidden");
    }
  }

  function attemptPlay() {
    if (!videoEl) return;

    var playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        showFallback();
      });
    }
  }

  function handleVisibilityChange() {
    if (!videoEl) return;
    if (!document.hidden && videoEl.paused) {
      attemptPlay();
    }
  }

  function bindVideoEvents() {
    if (!videoEl) return;

    videoEl.addEventListener("error", showFallback);
    videoEl.addEventListener("stalled", showFallback);
    videoEl.addEventListener("suspend", function () {
      if (!videoEl.currentTime) {
        showFallback();
      }
    });
  }

  function init() {
    videoEl = document.getElementById("hero-cinematic-video");
    fallbackEl = document.getElementById("hero-cinematic-fallback");

    if (!videoEl) return false;

    bindVideoEvents();
    attemptPlay();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return true;
  }

  return {
    init: init,
    showFallback: showFallback
  };
})();
