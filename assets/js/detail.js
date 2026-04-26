/* ============================================================
   DETAIL — Dynamic Data Population & GSAP Animations
   ============================================================ */

(function () {
  var detailTriggers = [];

  function renderDetail(carId) {
    var car = null;
    for (var i = 0; i < CARS_DATA.length; i++) {
      if (CARS_DATA[i].id === carId) {
        car = CARS_DATA[i];
        break;
      }
    }
    if (!car) {
      car = CARS_DATA[0];
    }

    $("body").attr("data-current-car", car.id);
    document.title = "APEX Motors | " + car.name;

    $(".detail-title").html(
      car.brand + "<br /><em>" + car.name + "</em>"
    );

    $(".detail-desc").text(car.desc);

    var $metaSpans = $(".detail-hero__meta span");
    if ($metaSpans.length >= 3) {
      $metaSpans.eq(0).text(car.priceText);
      $metaSpans.eq(1).text(car.engine);
      $metaSpans.eq(2).text(car.hp);
    }

    var $specTiles = $(".spec-tile");
    if ($specTiles.length >= 4) {
      $specTiles.eq(0).find("h2").text(car.hp);
      $specTiles.eq(1).find("h2").text(car.accel);
      $specTiles.eq(2).find("h2").text(car.speed);
      $specTiles.eq(3).find("h2").text(car.engine);
    }

    var carouselEl = document.getElementById("detailCarousel");
    if (carouselEl) {
      var existing = bootstrap.Carousel.getInstance(carouselEl);
      if (existing) existing.dispose();
      new bootstrap.Carousel(carouselEl, { ride: "carousel", interval: 4000 });
    }
  }

  function initDetailAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      return;
    }

    detailTriggers.forEach(function (st) {
      st.kill();
    });
    detailTriggers = [];

    gsap.from(".detail-hero .section-kicker, .detail-title, .detail-desc, .detail-hero__meta", {
      y: 24,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    });

    gsap.from(".detail-hero__visual", {
      x: 40,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      delay: 0.2
    });

    gsap.utils.toArray(".detail-gallery, .detail-specs, .detail-review, .detail-cta").forEach(function (section) {
      var tween = gsap.from(section, {
        scrollTrigger: {
          trigger: section,
          start: "top 82%"
        },
        y: 48,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      });
      if (tween.scrollTrigger) {
        detailTriggers.push(tween.scrollTrigger);
      }
    });
  }

  window.renderDetail = renderDetail;
  window.initDetailAnimations = initDetailAnimations;
})();
