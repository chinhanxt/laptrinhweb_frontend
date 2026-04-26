/* ============================================================
   DETAIL PAGE — Dynamic Data Population & GSAP Animations
   ============================================================ */
var CARS_DATA = [
  {
    id: "aventador-lp670",
    name: "Aventador LP 670",
    brand: "Lamborghini",
    series: "v12",
    price: "high",
    priceText: "26 ty VND",
    hp: "789 hp",
    engine: "V12",
    speed: "355 km/h",
    accel: "3.2s",
    desc: "Flagship V12 coupe voi chat co khi thuan tuy va san khau thi giac manh.",
    quickCopy: "Flagship coupe, cau hinh theater-spec danh cho hero va private track session."
  },
  {
    id: "huracan-sto",
    name: "Huracan STO",
    brand: "Lamborghini",
    series: "track",
    price: "high",
    priceText: "21 ty VND",
    hp: "640 hp",
    engine: "V10",
    speed: "310 km/h",
    accel: "3.0s",
    desc: "Track-focused silhouette cho nguoi can phan hoi lai sac va giau cam xuc.",
    quickCopy: "Thiet ke track-biased voi cabin toi gian va khi dong hoc manh."
  },
  {
    id: "revuelto",
    name: "Revuelto",
    brand: "Lamborghini",
    series: "hybrid",
    price: "mid",
    priceText: "19 ty VND",
    hp: "1001 hp",
    engine: "Hybrid",
    speed: "350 km/h",
    accel: "2.5s",
    desc: "Hybrid supercar dai dien cho buoc chuyen sang hieu nang dien hoa cao cap.",
    quickCopy: "Powertrain hybrid hieu nang cao, phu hop narrative cong nghe tuong lai."
  }
];

$(function () {
  /* ----------------------------------------------------------
     1. READ ?id= AND FIND MATCHING CAR
     ---------------------------------------------------------- */
  var params = new URLSearchParams(window.location.search);
  var currentId = params.get("id") || "aventador-lp670";

  var car = null;
  for (var i = 0; i < CARS_DATA.length; i++) {
    if (CARS_DATA[i].id === currentId) {
      car = CARS_DATA[i];
      break;
    }
  }
  if (!car) {
    car = CARS_DATA[0]; // fallback to Aventador
  }

  $("body").attr("data-current-car", car.id);

  /* ----------------------------------------------------------
     2. UPDATE PAGE CONTENT WITH CAR DATA
     ---------------------------------------------------------- */
  // Page title
  document.title = "APEX Motors | " + car.name;

  // Hero section
  $(".detail-hero .section-title").html(
    car.brand + "<br /><em>" + car.name + "</em>"
  );
  $(".detail-hero .section-kicker").text("Flagship Detail");

  // Description paragraph (the muted text below the title)
  $(".detail-hero .col-lg-6").first().find("p").filter(function () {
    return $(this).css("color") || $(this).attr("style");
  }).first().text(car.desc);

  // Hero meta tags (price, engine, hp)
  var $metaSpans = $(".detail-hero__meta span");
  if ($metaSpans.length >= 3) {
    $metaSpans.eq(0).text(car.priceText);
    $metaSpans.eq(1).text(car.engine);
    $metaSpans.eq(2).text(car.hp);
  }

  // Spec tiles
  var $specTiles = $(".spec-tile");
  if ($specTiles.length >= 4) {
    $specTiles.eq(0).find("h2").text(car.hp);
    $specTiles.eq(1).find("h2").text(car.accel);
    $specTiles.eq(2).find("h2").text(car.speed);
    $specTiles.eq(3).find("h2").text(car.engine);
  }

  /* ----------------------------------------------------------
     3. GSAP ANIMATIONS
     ---------------------------------------------------------- */
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.from(".detail-hero .section-kicker, .detail-hero .section-title, .detail-hero__desc, .detail-hero__meta", {
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
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: "top 82%"
      },
      y: 48,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    });
  });
});
