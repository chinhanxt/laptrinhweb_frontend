/* ============================================================
   CATALOG — Dynamic Card Rendering, Brand Tabs, Drag Scroll
   ============================================================ */
$(function () {
  var $tabs = $("#catalog-tabs");
  var $strip = $("#catalog-strip");
  var $empty = $("#catalog-empty");
  var $bookingCar = $("#bookingCar");
  var activeBrand = "all";
  var catalogCars = getCatalogCars();

  function init() {
    renderTabs();
    renderCards(catalogCars);
    filterCards();
    renderBookingOptions(catalogCars);
    initDragScroll();
  }

  function renderTabs() {
    var brands = getCatalogBrands();
    var html = '<button class="catalog-tab is-active" data-brand="all">Tất cả</button>';
    for (var i = 0; i < brands.length; i++) {
      html += '<button class="catalog-tab" data-brand="' + brands[i] + '">' + brands[i] + '</button>';
    }
    $tabs.html(html);

    $tabs.on("click", ".catalog-tab", function () {
      var $btn = $(this);
      activeBrand = $btn.data("brand");
      $tabs.find(".catalog-tab").removeClass("is-active");
      $btn.addClass("is-active");
      filterCards();
    });
  }

  function renderCards(cars) {
    var html = "";
    for (var i = 0; i < cars.length; i++) {
      var car = cars[i];
      var imgHtml = car.images && car.images.hero
        ? '<img src="' + car.images.hero + '" alt="' + car.name + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<span class="catalog-card__media-placeholder" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;">' + car.name + '</span>'
        : '<span class="catalog-card__media-placeholder">' + car.name + '</span>';

      html +=
        '<div class="catalog-card" data-brand="' + car.brand + '">' +
          '<div class="catalog-card__media">' +
            imgHtml +
            '<span class="catalog-card__badge">' + car.brand + '</span>' +
          '</div>' +
          '<div class="catalog-card__body">' +
            '<h3 class="catalog-card__name">' + car.name + '</h3>' +
            '<div class="catalog-card__specs">' +
              '<span>' + car.specs.hp + ' HP</span>' +
              '<span>' + car.specs.engine + '</span>' +
              '<span>' + car.specs.price + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="catalog-card__footer">' +
            '<a href="detail.html?car=' + car.id + '" class="btn-luxury-outline btn-luxury--arrow">Xem chi tiết</a>' +
          '</div>' +
        '</div>';
    }
    $strip.html(html);
  }

  function filterCards() {
    var $cards = $strip.find(".catalog-card");
    var visible = 0;

    $cards.each(function () {
      var $card = $(this);
      var match = activeBrand === "all" || $card.data("brand") === activeBrand;
      if (match) {
        $card.css({ display: "flex", opacity: 1 });
        visible++;
      } else {
        $card.css({ display: "none", opacity: 0 });
      }
    });

    if (visible === 0) {
      $empty.css("display", "block");
    } else {
      $empty.css("display", "none");
    }

    $strip[0].scrollLeft = 0;
  }

  function renderBookingOptions(cars) {
    var html = '<option value="">Chọn mẫu xe</option>';
    for (var i = 0; i < cars.length; i++) {
      html += '<option value="' + cars[i].id + '">' + cars[i].brand + ' ' + cars[i].name + '</option>';
    }
    $bookingCar.html(html);
  }

  function getCatalogCars() {
    return typeof getApprovedCars === "function" ? getApprovedCars() : [];
  }

  function getCatalogBrands() {
    var seen = {};
    var brands = [];

    for (var i = 0; i < catalogCars.length; i++) {
      var brand = catalogCars[i].brand;
      if (!seen[brand]) {
        seen[brand] = true;
        brands.push(brand);
      }
    }

    return brands;
  }

  function initDragScroll() {
    var el = $strip[0];
    var isDown = false;
    var startX, scrollLeft;

    el.addEventListener("mousedown", function (e) {
      if (e.target.closest("a, button")) return;
      isDown = true;
      el.style.cursor = "grabbing";
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    });
    el.addEventListener("mouseleave", function () {
      isDown = false;
      el.style.cursor = "grab";
    });
    el.addEventListener("mouseup", function () {
      isDown = false;
      el.style.cursor = "grab";
    });
    el.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - el.offsetLeft;
      var walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    });
  }

  init();
});
