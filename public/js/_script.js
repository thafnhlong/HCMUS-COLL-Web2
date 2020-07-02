!function(t) {
    "use strict";
    t("#sidebarToggle, #sidebarToggleTop").on("click", function(o) {
        t("body").toggleClass("sidebar-toggled"),
        t(".sidebar").toggleClass("toggled"),
        t(".sidebar").hasClass("toggled") && t(".sidebar .collapse").collapse("hide")
    }),
    t(window).resize(function() {
        t(window).width() < 768 && t(".sidebar .collapse").collapse("hide")
    }),
    t("body.fixed-nav .sidebar").on("mousewheel DOMMouseScroll wheel", function(o) {
        if (768 < t(window).width()) {
            var e = o.originalEvent
              , l = e.wheelDelta || -e.detail;
            this.scrollTop += 30 * (l < 0 ? 1 : -1),
            o.preventDefault()
        }
    }),
    t(document).on("scroll", function() {
        100 < t(this).scrollTop() ? t(".scroll-to-top").fadeIn() : t(".scroll-to-top").fadeOut()
    }),
    t(document).on("click", "a.scroll-to-top", function(o) {
        var e = t(this);
        t("html, body").stop().animate({
            scrollTop: t(e.attr("href")).offset().top
        }, 1e3, "easeInOutExpo"),
        o.preventDefault()
    })
    if (window.location.hash.substr(1).startsWith('error:')){
      alert(decodeURIComponent(window.location.hash.substr(7)))
    }
    $(".custom-file-input").on("change", function() {
      var fileName = $(this).val().split("\\").pop();
      $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
    });
}(jQuery);

function deleteFormSubmit(type,id){
  let result = confirm(`Bạn có muốn xóa ${type} có id: ${id} không?`)
  if (result){
    const frm = document.getElementById('frmSend')
    frm.children[0].value = id
    frm.submit()
  }
}