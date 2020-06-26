$('.nav-item.more').click((ob)=>{
  if ( $('.category').hasClass('show') )
  {
    $('.nav-item.more>a').html('●●●')
    $('.category').removeClass('show')
  }
  else{
    $('.nav-item.more>a').html('XXX')
    $('.category').addClass('show')
    $('.navbar-toggler').click()
  }
})
$('.category').click(()=>$('.nav-item.more').click())

$(document).ready(function(){
  $(".owl-carousel").owlCarousel({
    items: 3,
    loop: true,
    autoplay: false,
    nav: false,
    dots: true,
    autoplayTimeout: 8000,
    autoplayHoverPause: false,
    mouseDrag: true,
    smartSpeed: 1100,
    margin: 30,
    navText: ["<i class='icon icon-arrow-left'></i>", "<i class='icon icon-arrow-right'></i>"],
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 2,
      },
      1000: {
        items: 3,
      }
    }
  })
  if (window.location.hash.substr(1) == 'news'){
    window.scrollTo(0,document.body.scrollHeight);
    console.log('scroll')
  }
});
