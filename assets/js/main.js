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

  $("#bookingSubmit").on("click", function () {
    var form = document.getElementById("bookingForm");
    var status = document.getElementById("bookingStatus");
    if (!form) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      if (status) status.textContent = "Vui lòng điền đủ thông tin.";
      return;
    }

    if (status) status.textContent = "Đã ghi nhận yêu cầu. T.R.Y.P sẽ liên hệ xác nhận lịch.";
    form.reset();
  });

  $("#bookingModal").on("show.bs.modal", function () {
    var status = document.getElementById("bookingStatus");
    if (status) status.textContent = "";
  });
});
