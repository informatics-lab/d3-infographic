/**
 * Created by tom on 27/08/2015.
 */

var menu = {"show": false};
var currentSlide = 0;
var currentSection = 0;

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

    var infographic = d3.select("#infographic");

    infographic
        .style("background-image","url("+slides[index].image+")");

    if (slides[index].icon) {
        infographic.append("img")
            .attr("src", slides[index].icon)
            .attr("class","slide-icon")
            .transition()
            .duration(1000)
            .style("opacity","1");
    }

    infographic.append("h2")
        .html(slides[index].txt)
        .attr("class","slide-txt")
        .transition()
        .duration(1000)
        .style("opacity","1");

    if(!slides[index].icon){
        infographic.select(".slide-txt")
            .style("padding-top","20%");
    }

    infographic.append("img")
        .attr("src", slides[index].link)
        .attr("class","slide-link")
        .on("click",function () {
            return nextSlide();
        })
        .transition()
        .duration(1000)
        .style("margin-left","0px")
        .style("opacity","1");

    if (index === slides.length-1) {
        toggleMenu();
    }

};

var unloadSlide = function(index) {

    var infographic = d3.select("#infographic");

    if (slides[index].icon) {
        infographic.select(".slide-icon")
            .transition()
            .duration(500)
            .style("opacity","0")
            .remove();
    }

    infographic.select(".slide-txt")
        .transition()
        .duration(500)
        .style("opacity","0")
        .remove();

    infographic.select(".slide-link")
        .transition()
        .duration(500)
        .style("margin-left",window.innerWidth+"px")
        .style("opacity","0")
        .remove();

};

var nextSlide = function() {

    if (currentSlide <= slides.length-2) {
        EVENTS.queueEvent(function(){unloadSlide(currentSlide)},0);
        currentSlide++;
        EVENTS.queueEvent(function(){loadSlide(currentSlide)},500);
    } else {
      console.log("end of slides..");
      currentSection += 1;
      fillLine("#menuLoader" + currentSection);
      if (currentSection >= 3){
        d3.select("#infographic").select(".slide-link")
            .transition()
            .duration(500)
            .style("opacity","0")
            .remove();
      }
    }
};

var fillViewport = function () {
    var fullHeight = window.innerHeight;
    document.getElementById("infographic").style.height = fullHeight + "px";
};

var toggleMenu = function () {
    theMenu = d3.select("#menu");

    if(!menu.show) {
        menu.offset = theMenu.style("bottom");
        theMenu.transition()
            .duration(1000)
            .style("opacity", "0.8")
            .style("bottom", "0px");
        menu.show = true;
    } else {
        theMenu.transition()
            .duration(1000)
            .style("opacity", "0")
            .style("bottom", menu.offset);
        menu.show = false;
    }
};

var fillIcon = function(id) {

};

var fillLine = function(id) {
   d3.select(id).select(".fill")
       .transition()
           .duration(1000)
           .style("width", "100%")
}

var EVENTS = { "totalTime": 0,
    "queueEvent": function(fn, t){
        setTimeout(fn, this.totalTime+t);
        this.totalTime += t;
    }
};

window.onresize = function () {
    fillViewport();
};

window.onload = function () {
    console.log("loaded");
    fillViewport();
    setTimeout(loadSlide(0), 2000);
};
