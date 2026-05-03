/* ============================================================
   DETAIL — Dynamic Rendering: Sidebar, Hero, Gallery, Specs,
   360° Model Viewer, Compare
   ============================================================ */
$(function () {
  var approvedCars = getApprovedCars();
  var fallbackCar = approvedCars[0] || null;
  var carId = new URLSearchParams(window.location.search).get("car");
  var car = resolveApprovedCar(carId, fallbackCar);

  if (!car) return;

  document.title = "T.R.Y.P | " + car.name;

  renderSidebar(car);
  renderHero(car);
  renderGallery(car);
  renderSpecs(car);
  render360(car);
  renderCompare(car);
  renderBookingOptions();
  initTabs();
  initAnimations();

  function resolveApprovedCar(id, fallback) {
    if (!id) return fallback;

    for (var i = 0; i < approvedCars.length; i++) {
      if (approvedCars[i].id === id) return approvedCars[i];
    }

    return fallback;
  }

  function getRenderSet(selectedCar) {
    var gallery = selectedCar && selectedCar.images && Array.isArray(selectedCar.images.gallery)
      ? selectedCar.images.gallery.slice(0, 4)
      : [];

    if (!gallery.length && selectedCar && selectedCar.images && selectedCar.images.hero) {
      gallery.push(selectedCar.images.hero);
    }

    return gallery;
  }

  /* ---- SIDEBAR ---- */
  function renderSidebar(car) {
    var html =
      '<span class="sidebar__kicker">' + car.brand + '</span>' +
      '<h1 class="sidebar__title">' + car.name + '</h1>' +
      '<div class="sidebar__specs">' +
        'Công suất: <strong>' + car.specs.hp + ' HP</strong><br>' +
        '0-100 km/h: <strong>' + car.specs.acceleration + '</strong><br>' +
        'Tốc độ tối đa: <strong>' + car.specs.topSpeed + '</strong><br>' +
        'Động cơ: <strong>' + car.specs.engine + '</strong>' +
      '</div>' +
      '<div class="sidebar__price">' + car.specs.price + '</div>' +
      '<div class="sidebar__actions">' +
        '<a class="btn-luxury" href="#" data-bs-toggle="modal" data-bs-target="#bookingModal">Đặt Lịch Lái Thử</a>' +
        '<a class="btn-luxury-outline" href="catalog.html">← Quay lại BST</a>' +
      '</div>';
    $("#detail-sidebar").html(html);
  }

  /* ---- HERO ---- */
  function renderHero(car) {
    var renderSet = getRenderSet(car);
    var imgSrc = renderSet[0] || "";
    var html = imgSrc
      ? '<img src="' + imgSrc + '" alt="' + car.name + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<span class="detail-hero__placeholder" style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;">' + car.name + '</span>'
      : '<span class="detail-hero__placeholder">' + car.name + '</span>';
    $("#detail-hero").html(html);
  }

  /* ---- GALLERY ---- */
  function renderGallery(car) {
    var gallery = getRenderSet(car);
    var $section = $("#section-gallery");

    if (gallery.length === 0) {
      $section.html(
        '<p class="section-kicker">Gallery</p>' +
        '<div class="gallery-grid">' +
          '<div class="gallery-main"><span class="gallery-placeholder">Chưa có hình ảnh</span></div>' +
        '</div>'
      );
      return;
    }

    var thumbsHtml = "";
    for (var i = 0; i < gallery.length; i++) {
      var activeClass = i === 0 ? " is-active" : "";
      thumbsHtml +=
        '<div class="gallery-thumb' + activeClass + '" data-index="' + i + '">' +
          '<img src="' + gallery[i] + '" alt="' + car.name + ' ' + (i + 1) + '" onerror="this.style.display=\'none\'">' +
          '<span class="gallery-placeholder" style="display:none;">Ảnh ' + (i + 1) + '</span>' +
        '</div>';
    }

    var html =
      '<p class="section-kicker">Gallery</p>' +
      '<div class="gallery-grid">' +
        '<div class="gallery-main" id="gallery-main">' +
          '<img src="' + gallery[0] + '" alt="' + car.name + '" onerror="this.style.display=\'none\'">' +
          '<span class="gallery-placeholder" style="display:none;">' + car.name + '</span>' +
        '</div>' +
        thumbsHtml +
      '</div>' +
      '<div class="gallery-lightbox" id="gallery-lightbox">' +
        '<img src="" alt="Lightbox">' +
      '</div>';

    $section.html(html);

    $section.on("click", ".gallery-thumb", function () {
      var idx = $(this).data("index");
      var src = gallery[idx];
      $section.find(".gallery-thumb").removeClass("is-active");
      $(this).addClass("is-active");
      $("#gallery-main").find("img").attr("src", src);
    });

    $section.on("click", "#gallery-main", function () {
      var src = $(this).find("img").attr("src");
      if (src) {
        $("#gallery-lightbox").find("img").attr("src", src);
        $("#gallery-lightbox").addClass("is-open");
      }
    });

    $(document).on("click", "#gallery-lightbox", function () {
      $(this).removeClass("is-open");
    });
  }

  /* ---- SPECS ---- */
  function renderSpecs(car) {
    var specs = [
      { value: car.specs.hp + " HP", label: "Công suất cực đại" },
      { value: car.specs.acceleration, label: "0-100 km/h" },
      { value: car.specs.topSpeed, label: "Tốc độ tối đa" },
      { value: car.specs.engine, label: "Động cơ" }
    ];

    var tilesHtml = "";
    for (var i = 0; i < specs.length; i++) {
      tilesHtml +=
        '<div class="spec-tile">' +
          '<div class="spec-tile__value">' + specs[i].value + '</div>' +
          '<div class="spec-tile__label">' + specs[i].label + '</div>' +
        '</div>';
    }

    $("#section-specs").html(
      '<p class="section-kicker">Thông Số Kỹ Thuật</p>' +
      '<div class="specs-grid">' + tilesHtml + '</div>'
    );
  }

  /* ---- 360° VIEW ---- */
  function render360(car) {
    var $section = $("#section-360");

    if (!car.model3d) {
      $section.html(
        '<p class="section-kicker">360° View</p>' +
        '<div class="view360-container">' +
          '<div class="view360-fallback">Mô hình 3D chưa khả dụng cho ' + car.name + '</div>' +
        '</div>'
      );
      return;
    }

    var config = car.modelConfig || {};
    var orbit = config.cameraOrbit || "320deg 72deg 74%";
    var target = config.cameraTarget || "0m 0.45m 0m";
    var fov = config.fieldOfView || "24deg";
    var exposure = config.exposure || "1.35";
    var modelScale = config.modelScale || "1 1 1";

    $section.html(
      '<p class="section-kicker">360° View</p>' +
      '<div class="view360-container">' +
        '<model-viewer ' +
          'src="' + car.model3d + '" ' +
          'scale="' + modelScale + '" ' +
          'camera-controls ' +
          'disable-zoom ' +
          'disable-pan ' +
          'interaction-prompt="none" ' +
          'camera-orbit="' + orbit + '" ' +
          'camera-target="' + target + '" ' +
          'field-of-view="' + fov + '" ' +
          'exposure="' + exposure + '" ' +
          'shadow-intensity="0.2" ' +
          'environment-image="neutral" ' +
          'loading="lazy" ' +
          'style="width:100%;height:100%;background:transparent;">' +
        '</model-viewer>' +
      '</div>'
    );
  }

  /* ---- COMPARE ---- */
  function renderCompare(car) {
    var otherCars = [];
    for (var i = 0; i < approvedCars.length; i++) {
      if (approvedCars[i].id !== car.id) otherCars.push(approvedCars[i]);
    }

    var optionsHtml = '<option value="">Chọn xe để so sánh</option>';
    for (var i = 0; i < otherCars.length; i++) {
      optionsHtml += '<option value="' + otherCars[i].id + '">' + otherCars[i].brand + ' ' + otherCars[i].name + '</option>';
    }

    var html =
      '<p class="section-kicker">So Sánh</p>' +
      '<div class="compare-header">' +
        '<label for="compare-select">So sánh với:</label>' +
        '<select class="form-select catalog-select" id="compare-select" style="max-width:300px;">' + optionsHtml + '</select>' +
      '</div>' +
      '<div id="compare-result">' +
        '<p class="compare-placeholder">Chọn một xe khác để xem bảng so sánh.</p>' +
      '</div>';

    var $section = $("#section-compare");
    $section.html(html);

    $section.on("change", "#compare-select", function () {
      var otherId = $(this).val();
      if (!otherId) {
        $("#compare-result").html('<p class="compare-placeholder">Chọn một xe khác để xem bảng so sánh.</p>');
        return;
      }
      var other = resolveApprovedCar(otherId, null);
      if (!other) return;
      renderCompareTable(car, other);
    });
  }

  function renderCompareTable(car, other) {
    function better(a, b) {
      var numA = parseFloat(String(a).replace(/[^\d.]/g, ""));
      var numB = parseFloat(String(b).replace(/[^\d.]/g, ""));
      if (isNaN(numA) || isNaN(numB)) return [false, false];
      return [numA > numB, numB > numA];
    }

    function betterLower(a, b) {
      var numA = parseFloat(String(a).replace(/[^\d.]/g, ""));
      var numB = parseFloat(String(b).replace(/[^\d.]/g, ""));
      if (isNaN(numA) || isNaN(numB)) return [false, false];
      return [numA < numB, numB < numA];
    }

    var rows = [
      { label: "Công suất", a: car.specs.hp + " HP", b: other.specs.hp + " HP", cmp: better },
      { label: "0-100 km/h", a: car.specs.acceleration, b: other.specs.acceleration, cmp: betterLower },
      { label: "Tốc độ tối đa", a: car.specs.topSpeed, b: other.specs.topSpeed, cmp: better },
      { label: "Động cơ", a: car.specs.engine, b: other.specs.engine, cmp: null },
      { label: "Giá", a: car.specs.price, b: other.specs.price, cmp: null }
    ];

    var imgA = getRenderSet(car)[0] || "";
    var imgB = getRenderSet(other)[0] || "";

    var visualHtml =
      '<div class="compare-cars">' +
        '<div>' +
          '<div class="compare-car-visual">' +
            (imgA ? '<img src="' + imgA + '" alt="' + car.name + '" onerror="this.style.display=\'none\'">' : '') +
            '<span class="gallery-placeholder">' + car.name + '</span>' +
          '</div>' +
          '<div class="compare-car-name">' + car.name + '</div>' +
        '</div>' +
        '<div>' +
          '<div class="compare-car-visual">' +
            (imgB ? '<img src="' + imgB + '" alt="' + other.name + '" onerror="this.style.display=\'none\'">' : '') +
            '<span class="gallery-placeholder">' + other.name + '</span>' +
          '</div>' +
          '<div class="compare-car-name">' + other.name + '</div>' +
        '</div>' +
      '</div>';

    var tableHtml = '<table class="compare-table"><tbody>';
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var classA = "", classB = "";
      if (r.cmp) {
        var result = r.cmp(r.a, r.b);
        if (result[0]) classA = ' class="is-better"';
        if (result[1]) classB = ' class="is-better"';
      }
      tableHtml += '<tr><th>' + r.label + '</th><td' + classA + '>' + r.a + '</td><td' + classB + '>' + r.b + '</td></tr>';
    }
    tableHtml += '</tbody></table>';

    $("#compare-result").html(visualHtml + tableHtml);
  }

  /* ---- BOOKING OPTIONS ---- */
  function renderBookingOptions() {
    var html = '<option value="">Chọn mẫu xe</option>';
    for (var i = 0; i < approvedCars.length; i++) {
      var selected = approvedCars[i].id === car.id ? " selected" : "";
      html += '<option value="' + approvedCars[i].id + '"' + selected + '>' + approvedCars[i].brand + ' ' + approvedCars[i].name + '</option>';
    }
    $("#bookingCar").html(html);
  }

  /* ---- TABS ---- */
  function initTabs() {
    var $tabs = $(".detail-tab");
    var $sections = $(".detail-section");

    $tabs.on("click", function () {
      var targetId = $(this).data("target");
      $tabs.removeClass("is-active");
      $(this).addClass("is-active");

      var el = document.getElementById(targetId);
      if (el) {
        var offset = $(".detail-tabs").outerHeight() + 70;
        var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });

    if (typeof ScrollTrigger !== "undefined") {
      $sections.each(function () {
        var sectionId = this.id;
        ScrollTrigger.create({
          trigger: this,
          start: "top 40%",
          end: "bottom 40%",
          onEnter: function () { activateTab(sectionId); },
          onEnterBack: function () { activateTab(sectionId); }
        });
      });
    }

    function activateTab(sectionId) {
      $tabs.removeClass("is-active");
      $tabs.filter('[data-target="' + sectionId + '"]').addClass("is-active");
    }
  }

  /* ---- ANIMATIONS ---- */
  function initAnimations() {
    if (typeof gsap === "undefined") return;

    gsap.from(".detail-sidebar", {
      x: -30, opacity: 0, duration: 0.8, ease: "power2.out"
    });

    gsap.from(".detail-hero", {
      opacity: 0, duration: 1, ease: "power2.out", delay: 0.2
    });

    if (typeof ScrollTrigger !== "undefined") {
      gsap.utils.toArray(".detail-section").forEach(function (section) {
        gsap.from(section, {
          scrollTrigger: { trigger: section, start: "top 85%" },
          y: 40, opacity: 0, duration: 0.8, ease: "power2.out"
        });
      });

      gsap.utils.toArray(".spec-tile").forEach(function (tile, i) {
        gsap.from(tile, {
          scrollTrigger: { trigger: tile, start: "top 90%" },
          y: 30, opacity: 0, duration: 0.6, delay: i * 0.1, ease: "power2.out"
        });
      });
    }
  }
});
