/* ============================================================
   CATALOG PAGE — jQuery Filter & Quick-View Modal
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
     1. FILTER: show / hide .car-item based on data attributes
     ---------------------------------------------------------- */
  var $series = $("#filter-series");
  var $price  = $("#filter-price");
  var $grid   = $("#catalog-grid");
  var $items  = $grid.find(".car-item");
  var $empty  = $("#catalog-empty");

  function applyFilter() {
    var seriesVal = $series.val();
    var priceVal  = $price.val();
    var visible   = 0;

    $items.each(function () {
      var $item = $(this);
      var matchSeries = (seriesVal === "all") || ($item.data("series") === seriesVal);
      var matchPrice  = (priceVal  === "all") || ($item.data("price")  === priceVal);

      if (matchSeries && matchPrice) {
        $item.removeClass("hidden");
        visible++;
      } else {
        $item.addClass("hidden");
      }
    });

    // Show / hide empty-state message
    if (visible === 0) {
      $empty.fadeIn(300);
    } else {
      $empty.fadeOut(200);
    }
  }

  // Bind change events on both selects
  $series.on("change", applyFilter);
  $price.on("change", applyFilter);

  // Reset button
  $("#filter-reset").on("click", function () {
    $series.val("all");
    $price.val("all");
    applyFilter();
  });

  /* ----------------------------------------------------------
     2. QUICK-VIEW MODAL: populate title + copy from data attrs
     ---------------------------------------------------------- */
  $(".quick-view-btn").on("click", function () {
    var $btn = $(this);
    $("#quickViewTitle").text($btn.data("title"));
    $("#quickViewCopy").text($btn.data("copy"));
  });

});
