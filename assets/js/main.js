/* ============================================================
   MAIN — Tab Switching, Hash Navigation, Header Scroll State
   ============================================================ */
$(function () {
  $("body").addClass("app-ready");

  /* ----------------------------------------------------------
     1. HEADER SCROLL STATE
     ---------------------------------------------------------- */
  var $header = $(".site-header");

  function syncHeaderState() {
    $header.toggleClass("scrolled", $(window).scrollTop() > 24);
  }

  $(window).on("scroll", syncHeaderState);
  syncHeaderState();

  /* ----------------------------------------------------------
     2. VIEW SWITCHING
     ---------------------------------------------------------- */
  var $views = $(".view");
  var $navLinks = $(".site-header .nav-link");

  function showView(viewName) {
    $views.removeClass("active");
    $("#view-" + viewName).addClass("active");

    $navLinks.removeClass("active");
    $navLinks.filter("[data-view='" + viewName + "']").addClass("active");

    window.scrollTo({ top: 0, behavior: "instant" });

    if (viewName === "home" && typeof window.initHomeAnimations === "function") {
      setTimeout(function () {
        window.initHomeAnimations();
      }, 50);
    }

    if (viewName === "detail" && typeof window.initDetailAnimations === "function") {
      setTimeout(function () {
        window.initDetailAnimations();
      }, 50);
    }

    if (typeof ScrollTrigger !== "undefined") {
      setTimeout(function () {
        ScrollTrigger.refresh();
      }, 100);
    }
  }

  function showDetail(carId) {
    if (typeof window.renderDetail === "function") {
      window.renderDetail(carId);
    }
    showView("detail");
    window.location.hash = "detail/" + carId;
  }

  /* ----------------------------------------------------------
     3. EVENT DELEGATION
     ---------------------------------------------------------- */
  $(document).on("click", "[data-view]", function (e) {
    e.preventDefault();
    var viewName = $(this).data("view");
    var carId = $(this).data("car");

    // Close mobile nav if open
    var $collapse = $(".navbar-collapse");
    if ($collapse.hasClass("show")) {
      $collapse.collapse("hide");
    }

    // Close any open modal
    var openModal = document.querySelector(".modal.show");
    if (openModal) {
      var bsModal = bootstrap.Modal.getInstance(openModal);
      if (bsModal) bsModal.hide();
    }

    if (viewName === "detail" && carId) {
      showDetail(carId);
    } else {
      showView(viewName);
      window.location.hash = viewName === "home" ? "" : viewName;
    }
  });

  /* ----------------------------------------------------------
     4. HASH NAVIGATION
     ---------------------------------------------------------- */
  function handleHash() {
    var hash = window.location.hash.replace("#", "");

    if (!hash || hash === "home") {
      showView("home");
    } else if (hash === "catalog") {
      showView("catalog");
    } else if (hash.indexOf("detail/") === 0) {
      var carId = hash.replace("detail/", "");
      if (typeof window.renderDetail === "function") {
        window.renderDetail(carId);
      }
      showView("detail");
    } else if (hash === "detail") {
      showView("detail");
    } else {
      showView("home");
    }
  }

  $(window).on("hashchange", handleHash);

  if (window.location.hash) {
    handleHash();
  }

  /* ----------------------------------------------------------
     5. EXPOSE GLOBALLY
     ---------------------------------------------------------- */
  window.showView = showView;
  window.showDetail = showDetail;
});
