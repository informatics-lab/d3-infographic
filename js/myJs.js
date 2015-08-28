/**
 * Created by tom on 27/08/2015.
 */

var menu = false;
var currentSlide = 1;

var slides = [
    {
        txt:"You can't have a weather forecast<br/>without what the Met Office does",
        image:"images/slides/backg-1.jpg",
        link:"images/find-out-why-cloud.svg"
    },
    {
        icon:"images/1-obs-icon.svg",
        txt:"Every day, we gather<br/>17 million observations<br/>from around the globe",
        image:"images/slides/backg-2.jpg",
        link:"images/next-cloud.svg"
    },
    {
        icon:"images/2-physics-icon.svg",
        txt:"We run these through 7 million lines<br/>of code, using the laws of physics to<br/>create a weather forecast",
        image:"images/slides/backg-3.jpg",
        link:"images/next-cloud.svg"
    },
    {
        icon:"images/3-analyse-icon.svg",
        txt:"We interpret, analyse<br/>and improve these using<br/>over 160 years experience",
        image:"images/slides/backg-4.jpg",
        link:"images/next-cloud.svg"
    },
    {
        icon:"images/4-forecasts-icon.svg",
        txt:"100 million people use<br/>these forecats every day",
        image:"images/slides/backg-5.jpg",
        link:"images/find-out-more-cloud.svg"
    }
];

var loadSlide = function(index) {

    $("#infographic").css('background-image', 'url(' + slides[index-1].image + ')');

    $("#infographic").append("<h2>" + slides[index-1].txt + "</h2>");

};

var unloadSlide = function(index) {

};

function positionText() {
    $('#slides').css('left','0')
    var slideWidth = $('#slides').width();
    var windowWidth = $(window).width();
    var slideX = (windowWidth - slideWidth)/2;
    var slideY = slideYPos - 15;

    $('#slides').css({top: slideY + 'px', left: slideX + 'px'})
}

var nextSlide = function() {
    if (!currentSlide > slides.length) {
        unloadSlide(currentSlide);
        loadSlide(currentSlide + 1);
        currentSlide++;
    } else {
      console.log("end of slides..");
    }
}

var fillViewport = function () {
    var fullHeight = window.innerHeight;
    document.getElementById("infographic").style.height = fullHeight + "px";
};

var toggleMenu = function () {
    if(!menu) {
        d3.select("#menu")
            .transition()
            .duration(2000)
            .style("opacity", "1")
            .style("bottom", "0px");
        menu = true;
    } else {
        d3.select("#menu")
            .transition()
            .duration(2000)
            .style("opacity", "0")
            .style("bottom", "-20px");
        menu = false;
    }
};

var fillIcon = function(id) {

};

var fillLine = function(id) {
    d3.select(id)
        .transition()

}

window.onresize = function () {
    fillViewport();
};

window.onload = function () {
    fillViewport();
    setTimeout(loadSlide(1), 2000);
};