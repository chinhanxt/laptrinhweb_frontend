/* ============================================================
   CATALOG — jQuery Filter & Quick-View Modal
   ============================================================ */
$(function () {

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

    if (visible === 0) {
      $empty.fadeIn(300);
    } else {
      $empty.fadeOut(200);
    }
  }

  $series.on("change", applyFilter);
  $price.on("change", applyFilter);

  $("#filter-reset").on("click", function () {
    $series.val("all");
    $price.val("all");
    applyFilter();
  });

  $(document).on("click", ".quick-view-btn", function () {
    var $btn = $(this);
    var title = $btn.data("title");
    $("#quickViewTitle").text(title);
    $("#quickViewCopy").text($btn.data("copy"));

    var car = null;
    for (var i = 0; i < CARS_DATA.length; i++) {
      if (CARS_DATA[i].name === title) {
        car = CARS_DATA[i];
        break;
      }
    }
    if (car) {
      var basePath = window.location.pathname.indexOf("/assets/html/") !== -1 ? "" : "assets/html/";
      $("#quickViewDetailLink").attr("href", basePath + "detail.html?car=" + car.id);
    }
  });

});
