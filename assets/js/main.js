/* ============================================================
   MAIN — Header Scroll State (shared across all pages)
   ============================================================ */
$(function () {
  $("body").addClass("app-ready");

  var $header = $(".site-header");

  function syncHeaderState() {
    $header.toggleClass("scrolled", $(window).scrollTop() > 24);
  }

  $(window).on("scroll", syncHeaderState);
  syncHeaderState();
});
