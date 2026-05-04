window.CollectionCarousel = (function () {
  var COLLECTION_CARS = [
    {
      id: "revuelto",
      model: "assets/model/revuelto_3.0tm.glb",
      brand: "Lamborghini",
      name: "Revuelto",
      sub: "Hybrid V12",
      chips: ["Hybrid", "V12"],
      cameraOrbit: "325deg 78deg 105%",
      cameraTarget: "0m 0.3m 0m",
      fieldOfView: "28deg"
    },
    {
      id: "centenario-roadster",
      model: "assets/model/lamborghini_centenario_roadster_sdc.glb",
      brand: "Lamborghini",
      name: "Centenario Roadster",
      sub: "Limited Edition",
      chips: ["V12", "Roadster"],
      cameraOrbit: "325deg 78deg 105%",
      cameraTarget: "0m 0.3m 0m",
      fieldOfView: "28deg"
    },
    {
      id: "centenario-lp770",
      model: "assets/model/lamborghini_centenario_lp-770_interior_sdc.glb",
      brand: "Lamborghini",
      name: "Centenario LP-770",
      sub: "Super Trofeo",
      chips: ["V12", "Track"],
      cameraOrbit: "325deg 75deg 120%",
      cameraTarget: "0m 0.45m 0m",
      fieldOfView: "30deg"
    }
  ];

  var sectionEl, trackEl, counterEl, barFillEl, prevBtn, nextBtn;
  var cards = [];
  var activeIndex = 0;
  var isExpanded = false;
  var initialized = false;

  return {
    COLLECTION_CARS: COLLECTION_CARS,
    init: init
  };

  function init() {
    if (initialized) return;
    sectionEl = document.getElementById("collection-3d");
    trackEl = document.getElementById("collection-track");
    counterEl = document.getElementById("collection-counter");
    barFillEl = document.getElementById("collection-bar-fill");
    prevBtn = document.querySelector(".collection-3d__arrow--prev");
    nextBtn = document.querySelector(".collection-3d__arrow--next");

    if (!trackEl || !COLLECTION_CARS.length) return;

    buildAllCards();
    bindEvents();
    showCards(0);
    initialized = true;
  }

  function buildAllCards() {
    var fragment = document.createDocumentFragment();

    COLLECTION_CARS.forEach(function (car, index) {
      var card = document.createElement("div");
      card.className = "collection-3d-card";
      card.dataset.index = index;

      var chipsHtml = "";
      if (car.chips && car.chips.length) {
        chipsHtml = '<div class="collection-3d-card__chips">' +
          car.chips.map(function (chip) {
            return '<span class="collection-3d-card__chip">' + chip + "</span>";
          }).join("") +
          "</div>";
      }

      card.innerHTML =
        '<button type="button" class="collection-3d-card__close" aria-label="Close">\u00D7</button>' +
        '<div class="collection-3d-card__viewer">' +
          '<div class="collection-3d-card__poster">' + car.brand + "</div>" +
          '<div class="collection-3d-card__glow"></div>' +
        "</div>" +
        '<div class="collection-3d-card__body">' +
          '<div class="collection-3d-card__meta">' +
            '<p class="collection-3d-card__brand">' + car.brand + "</p>" +
            '<h3 class="collection-3d-card__name">' + car.name + "</h3>" +
            '<p class="collection-3d-card__sub">' + car.sub + "</p>" +
          "</div>" +
          chipsHtml +
          '<div class="collection-3d-card__actions">' +
            '<a href="assets/html/detail.html?car=' + car.id + '" class="collection-3d-card__cta">Xem chi ti\u1EBFt</a>' +
          "</div>" +
        "</div>" +
        '<div class="collection-3d-card__expand-hint">Nh\u1EA5p \u0111\u1EC3 t\u01B0\u01A1ng t\u00E1c 3D</div>';

      fragment.appendChild(card);
      cards.push(card);
    });

    trackEl.appendChild(fragment);
  }

  function bindEvents() {
    if (prevBtn) {
      prevBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (isExpanded) return;
        navigate(-1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (isExpanded) return;
        navigate(1);
      });
    }

    cards.forEach(function (card, index) {
      card.addEventListener("click", function (e) {
        if (e.target.closest(".collection-3d-card__close")) {
          e.stopPropagation();
          collapseCard();
          return;
        }
        if (e.target.closest(".collection-3d-card__cta")) {
          return;
        }
        if (card.classList.contains("is-active") && !isExpanded && !isCollapsing) {
          expandCard(index);
        }
      });

      var closeBtn = card.querySelector(".collection-3d-card__close");
      if (closeBtn) {
        closeBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          collapseCard();
        });
      }
    });

    document.addEventListener("keydown", function (e) {
      if (isExpanded && e.key === "Escape") {
        collapseCard();
        return;
      }
      if (!isExpanded) {
        if (e.key === "ArrowLeft") navigate(-1);
        if (e.key === "ArrowRight") navigate(1);
      }
    });

    document.addEventListener("click", function (e) {
      if (!isExpanded) return;
      var activeCard = cards[activeIndex];
      var inCard = activeCard && activeCard.contains(e.target);
      var inStage = floatStage && floatStage.contains(e.target);
      if (!inCard && !inStage) {
        collapseCard();
      }
    });
  }

  function navigate(direction) {
    var nextIndex = activeIndex + direction;
    if (nextIndex < 0 || nextIndex >= COLLECTION_CARS.length) return;
    showCards(nextIndex);
  }

  function showCards(newIndex) {
    activeIndex = newIndex;

    cards.forEach(function (card, i) {
      card.classList.remove("is-active", "is-prev", "is-next", "is-expanded");

      if (i === newIndex) {
        card.classList.add("is-active");
      } else if (i === newIndex - 1) {
        card.classList.add("is-prev");
      } else if (i === newIndex + 1) {
        card.classList.add("is-next");
      }
    });

    if (counterEl) {
      counterEl.textContent = (newIndex + 1) + " / " + COLLECTION_CARS.length;
    }
    if (barFillEl) {
      var pct = COLLECTION_CARS.length > 1
        ? (newIndex / (COLLECTION_CARS.length - 1)) * 100
        : 100;
      barFillEl.style.width = pct + "%";
    }

    if (prevBtn) prevBtn.disabled = newIndex === 0;
    if (nextBtn) nextBtn.disabled = newIndex === COLLECTION_CARS.length - 1;

    loadModelForCard(newIndex);
  }

  var overlayEl = null;
  var floatStage = null;
  var expandedMvOrigin = null;

  function ensureOverlayAndStage() {
    if (!overlayEl) {
      overlayEl = document.createElement("div");
      overlayEl.className = "collection-3d__overlay";
      document.body.appendChild(overlayEl);
      overlayEl.addEventListener("click", function () {
        collapseCard();
      });
    }
    if (!floatStage) {
      floatStage = document.createElement("div");
      floatStage.className = "collection-3d__float-stage";
      document.body.appendChild(floatStage);
    }
  }

  function expandCard(index) {
    isExpanded = true;
    ensureOverlayAndStage();

    var card = cards[index];
    var mv = card.querySelector("model-viewer");
    var viewerArea = card.querySelector(".collection-3d-card__viewer");

    card.classList.add("is-expanded");
    if (sectionEl) sectionEl.classList.add("has-expanded");

    expandedMvOrigin = viewerArea;

    var cardRect = card.getBoundingClientRect();
    var viewerRect = viewerArea.getBoundingClientRect();

    var stageWidth = viewerRect.width * 1.6;
    var stageHeight = viewerRect.height * 1.8;
    var stageLeft = cardRect.left + cardRect.width / 2 - stageWidth / 2;
    var stageTop = viewerRect.top - (stageHeight - viewerRect.height) * 0.6;

    floatStage.style.left = stageLeft + "px";
    floatStage.style.top = stageTop + "px";
    floatStage.style.width = stageWidth + "px";
    floatStage.style.height = stageHeight + "px";

    floatStage.appendChild(mv);
    overlayEl.classList.add("is-visible");
    floatStage.classList.add("is-visible");

    mv.setAttribute("camera-controls", "");
    mv.removeAttribute("disable-zoom");
    mv.setAttribute("auto-rotate", "");
    mv.setAttribute("auto-rotate-delay", "0");
    mv.setAttribute("rotation-per-second", "18deg");
    mv.setAttribute("exposure", "2.0");
    mv.setAttribute("shadow-intensity", "0.3");
    mv.setAttribute("environment-image", "legacy");
  }

  var isCollapsing = false;

  function finishCollapse(mv) {
    mv.removeAttribute("camera-controls");
    mv.setAttribute("disable-zoom", "");
    mv.setAttribute("exposure", "1.0");
    mv.setAttribute("shadow-intensity", "0");
    mv.setAttribute("environment-image", "neutral");

    if (expandedMvOrigin) {
      var poster = expandedMvOrigin.querySelector(".collection-3d-card__poster");
      if (poster) {
        expandedMvOrigin.insertBefore(mv, poster);
      } else {
        expandedMvOrigin.appendChild(mv);
      }
      expandedMvOrigin = null;
    }

    if (overlayEl) overlayEl.classList.remove("is-visible");
    if (floatStage) floatStage.classList.remove("is-visible");

    isExpanded = false;
    isCollapsing = false;

    cards.forEach(function (card) {
      card.classList.remove("is-expanded");
    });
    if (sectionEl) sectionEl.classList.remove("has-expanded");
  }

  function collapseCard() {
    if (!isExpanded || isCollapsing) return;
    isCollapsing = true;

    var mv = floatStage ? floatStage.querySelector("model-viewer") : null;
    var car = COLLECTION_CARS[activeIndex];

    if (mv) {
      mv.removeAttribute("auto-rotate");

      var targetOrbit = car.cameraOrbit || "45deg 75deg 105%";
      var targetTarget = car.cameraTarget || "0m 0.4m 0m";
      var targetFov = car.fieldOfView || "30deg";

      mv.setAttribute("interpolation-decay", "80");
      mv.setAttribute("camera-orbit", targetOrbit);
      mv.setAttribute("camera-target", targetTarget);
      mv.setAttribute("field-of-view", targetFov);

      var settled = false;
      var safetyTimer = setTimeout(function () {
        if (!settled) {
          settled = true;
          mv.removeAttribute("interpolation-decay");
          finishCollapse(mv);
        }
      }, 1200);

      mv.addEventListener("camera-change", function onCamChange(e) {
        if (settled) {
          mv.removeEventListener("camera-change", onCamChange);
          return;
        }
        if (e.detail && e.detail.source === "none") {
          settled = true;
          clearTimeout(safetyTimer);
          mv.removeEventListener("camera-change", onCamChange);
          mv.removeAttribute("interpolation-decay");
          setTimeout(function () {
            finishCollapse(mv);
          }, 50);
        }
      });
    } else {
      isExpanded = false;
      isCollapsing = false;
      if (overlayEl) overlayEl.classList.remove("is-visible");
      if (floatStage) floatStage.classList.remove("is-visible");
      cards.forEach(function (card) {
        card.classList.remove("is-expanded");
      });
      if (sectionEl) sectionEl.classList.remove("has-expanded");
    }
  }

  function loadModelForCard(index) {
    var card = cards[index];
    if (!card || card.dataset.loaded === "true") return;

    var car = COLLECTION_CARS[index];
    var viewerArea = card.querySelector(".collection-3d-card__viewer");
    var poster = viewerArea.querySelector(".collection-3d-card__poster");
    if (!viewerArea || !car.model) return;

    var mv = document.createElement("model-viewer");
    mv.setAttribute("src", car.model);
    mv.setAttribute("disable-zoom", "");
    mv.setAttribute("disable-pan", "");
    mv.setAttribute("disable-tap", "");
    mv.setAttribute("interaction-prompt", "none");
    mv.setAttribute("camera-orbit", car.cameraOrbit || "45deg 75deg 105%");
    mv.setAttribute("camera-target", car.cameraTarget || "0m 0.4m 0m");
    mv.setAttribute("field-of-view", car.fieldOfView || "30deg");
    mv.setAttribute("exposure", "1.0");
    mv.setAttribute("shadow-intensity", "0");
    mv.setAttribute("environment-image", "neutral");
    mv.setAttribute("loading", "lazy");
    mv.setAttribute("reveal", "auto");
    mv.setAttribute("power-preference", "high-performance");
    mv.setAttribute("minimum-render-scale", "1");
    mv.setAttribute("touch-action", "none");
    mv.style.cssText = "width:100%;height:100%;background:transparent;";

    var progressSlot = document.createElement("div");
    progressSlot.setAttribute("slot", "progress-bar");
    mv.appendChild(progressSlot);

    mv.addEventListener("load", function () {
      if (poster) poster.style.display = "none";
    });

    viewerArea.insertBefore(mv, poster);
    card.dataset.loaded = "true";
  }
})();
