window.CollectionCarousel = (function () {
  var COLLECTION_CARS = [
    {
      id: "revuelto",
      model: "assets/model/revuelto_3.0tm.glb",
      brand: "Lamborghini",
      name: "Revuelto",
      sub: "Hybrid V12",
      chips: ["Hybrid", "V12"],
      cameraOrbit: "35deg 72deg 115%",
      cameraTarget: "0m 0.35m 0m",
      fieldOfView: "32deg"
    },
    {
      id: "centenario-roadster",
      model: "assets/model/lamborghini_centenario_roadster_sdc.glb",
      brand: "Lamborghini",
      name: "Centenario Roadster",
      sub: "Limited Edition",
      chips: ["V12", "Roadster"],
      cameraOrbit: "42deg 68deg 110%",
      cameraTarget: "0m 0.3m 0m",
      fieldOfView: "30deg"
    },
    {
      id: "centenario-interior",
      model: "assets/model/lamborghini_centenario_lp-770_interior_sdc.glb",
      brand: "Lamborghini",
      name: "Centenario LP-770",
      sub: "Interior Experience",
      chips: ["V12", "Interior"],
      cameraOrbit: "180deg 85deg 60%",
      cameraTarget: "0m 0.5m 0m",
      fieldOfView: "45deg"
    }
  ];

  var trackEl, counterEl, barFillEl, prevBtn, nextBtn;
  var cards = [];
  var activeIndex = 0;
  var initialized = false;

  return {
    COLLECTION_CARS: COLLECTION_CARS,
    init: init
  };

  function init() {
    if (initialized) return;
    trackEl = document.getElementById("collection-track");
    counterEl = document.getElementById("collection-counter");
    barFillEl = document.getElementById("collection-bar-fill");
    prevBtn = document.querySelector(".collection-3d__arrow--prev");
    nextBtn = document.querySelector(".collection-3d__arrow--next");

    if (!trackEl || !COLLECTION_CARS.length) return;

    buildCards();
    bindEvents();
    updateActiveCard(0);
    initialized = true;
  }

  function buildCards() {
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
        "</div>";

      fragment.appendChild(card);
      cards.push(card);
    });

    trackEl.appendChild(fragment);
  }

  function bindEvents() {
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        scrollToIndex(activeIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        scrollToIndex(activeIndex + 1);
      });
    }

    var scrollTimeout;
    trackEl.addEventListener("scroll", function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(onScrollEnd, 80);
    }, { passive: true });
  }

  function onScrollEnd() {
    var trackRect = trackEl.getBoundingClientRect();
    var trackCenter = trackRect.left + trackRect.width / 2;
    var closest = 0;
    var closestDist = Infinity;

    cards.forEach(function (card, index) {
      var cardRect = card.getBoundingClientRect();
      var cardCenter = cardRect.left + cardRect.width / 2;
      var dist = Math.abs(cardCenter - trackCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = index;
      }
    });

    updateActiveCard(closest);
  }

  function scrollToIndex(index) {
    if (index < 0 || index >= cards.length) return;
    cards[index].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
    updateActiveCard(index);
  }

  function updateActiveCard(index) {
    activeIndex = index;

    cards.forEach(function (card, i) {
      card.classList.toggle("is-active", i === index);
    });

    if (counterEl) {
      counterEl.textContent = (index + 1) + " / " + cards.length;
    }
    if (barFillEl) {
      var pct = cards.length > 1 ? ((index) / (cards.length - 1)) * 100 : 100;
      barFillEl.style.width = pct + "%";
    }

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === cards.length - 1;

    loadViewerForCard(index);
    if (index > 0) loadViewerForCard(index - 1);
    if (index < cards.length - 1) loadViewerForCard(index + 1);
  }

  function loadViewerForCard(index) {
    var card = cards[index];
    if (!card || card.dataset.loaded === "true") return;

    var car = COLLECTION_CARS[index];
    var viewerArea = card.querySelector(".collection-3d-card__viewer");
    var poster = viewerArea.querySelector(".collection-3d-card__poster");
    if (!viewerArea || !car.model) return;

    var mv = document.createElement("model-viewer");
    mv.setAttribute("src", car.model);
    mv.setAttribute("camera-controls", "");
    mv.setAttribute("disable-zoom", "");
    mv.setAttribute("disable-pan", "");
    mv.setAttribute("interaction-prompt", "none");
    mv.setAttribute("auto-rotate", "");
    mv.setAttribute("auto-rotate-delay", "0");
    mv.setAttribute("rotation-per-second", "18deg");
    mv.setAttribute("camera-orbit", car.cameraOrbit || "45deg 75deg 105%");
    mv.setAttribute("camera-target", car.cameraTarget || "0m 0.4m 0m");
    mv.setAttribute("field-of-view", car.fieldOfView || "30deg");
    mv.setAttribute("exposure", "0.8");
    mv.setAttribute("shadow-intensity", "0");
    mv.setAttribute("environment-image", "neutral");
    mv.setAttribute("loading", "lazy");
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
