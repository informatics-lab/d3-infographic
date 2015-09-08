/**
 * Created by tom on 27/08/2015.
 */

var menu = {
    "show": false,
    "menuLoader1": false,
    "menuLoader2": false,
    "menuLoader3": false
};
var currentSlide = 0;
var currentSection = null;
var pageLoadDelay = 2000;

var slides = [
    {
        txt:"The Met Office makes weather forecasts possible",
        image:"images/slides/backg-1.jpg",
        link:"images/find-out-why-cloud.svg"
    },
    {
        icon:"images/1-obs-icon.svg",
        txt:"Every day we collect more than 17 million observations",
        image:"images/slides/backg-2.jpg",
        link:"images/next-cloud.svg"
    },
    {
        icon:"images/2-physics-icon.svg",
        txt:"We run these through seven million lines<br/>of code, using the laws of physics to predict the future",
        image:"images/slides/backg-3.jpg",
        link:"images/next-cloud.svg"
    },
    {
        icon:"images/3-analyse-icon.svg",
        txt:"We display and interpret the resulting data to create<br/>useful forecasts using over 160 years of experience",
        image:"images/slides/backg-4.jpg",
        link:"images/next-cloud.svg"
    },
    {
        icon:"images/4-forecasts-icon.svg",
        txt:"Over 100 million people use our forecasts<br/>every day and more than ten countries<br/>around the world use Met Office systems",
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
    } else {

        infographic.append("p")
            .attr("class", "slide-progress");

        for (var i = 0; i < slides.length; i++) {

            d3.select(".slide-progress")
                .append("span")
                .attr("id", "slide-progress-" + i)
                .text("•");

            if (i <= index) {
                d3.select("#slide-progress-" + i)
                    .attr("class", "seen");
            }
        }

        infographic.select(".slide-progress")
            .transition()
            .duration(1000)
            .style("opacity", "1");
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

    infographic.select(".slide-progress")
        .transition()
        .duration(500)
        .style("opacity","0");

    infographic.select(".slide-progress")
        .html("")
        .remove();
};

var unloadAllSlides = function () {
  if (currentSlide != -1){
    unloadSlide(currentSlide);
    currentSlide = -1;
  }
    d3.select("#menuItem1")
        .style("color",null);
    d3.select("#menuItem2")
        .style("color",null);
    d3.select("#menuItem3")
        .style("color",null);
    d3.select("#menuItem4")
        .style("color",null);
};

var unloadAll = function () {
  unloadAllSlides();
  if (currentSection != null){
    switch(currentSection) {
      case "obs":
          obs.unload();
          break;
      case "physics":
          physics.unload();
          break;
      case "analyse":
          analyse.unload();
          break;
      case "forecasts":
          forecasts.unload();
          break;
    }
    currentSection = null;
  }
}

var nextSlide = function() {
    if (currentSlide <= slides.length-2) {
        var queue = new Queue();
        queue.queueEvent(function(){unloadSlide(currentSlide)},0);
        currentSlide++;
        queue.queueEvent(function(){loadSlide(currentSlide)}, 500);
    } else {
      console.log("end of slides..");
      loadObs();
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

var fillLine = function(id, duration) {
   d3.select(id).select(".progress-bar")
       .transition()
           .duration(duration)
           .style("width", "100%");
    menu[id.id] = true;
};

var emptyLine = function(id, duration) {
   d3.select(id).select(".progress-bar")
       .transition()
           .duration(duration)
           .style("width", "0%");
    menu[id.id] = false;
};

var loadObs = function(id) {
  unloadAll();

    d3.select("#menuItem1")
        .style("color","rgb(202,208,25)");

    currentSection = "obs";
  d3.select("#infographic")
      .style("background-image","url(images/globe_washed.jpeg)");
  setTimeout(function(){obs.load()}, pageLoadDelay);
}

var loadPhysics = function(id) {
  unloadAll();

    d3.select("#menuItem2")
        .style("color","rgb(202,208,25)");

  currentSection = "physics";
  d3.select("#infographic")
      .style("background-image","url(images/globe_washed.jpeg)");
  setTimeout(function(){physics.load()}, pageLoadDelay);
}

var loadAnalyse = function(id) {
  unloadAll();

    d3.select("#menuItem3")
        .style("color","rgb(202,208,25)");

    currentSection = "analyse";
    d3.select("#infographic")
        .style("background-image","url(images/globe_washed.jpeg)");
  setTimeout(function(){analyse.load()}, pageLoadDelay);
}

var loadForecasts = function(id) {
  unloadAll();

    d3.select("#menuItem4")
        .style("color","rgb(202,208,25)");

    currentSection = "forecasts";
    d3.select("#infographic")
        .style("background-image","url(images/globe_washed.jpeg)");
  setTimeout(function(){forecasts.load()}, pageLoadDelay);
}

d3.select("#menuItem1")
  .on("click",function () {
        if(currentSection!="obs") {
            var events = [];
            menu.menuLoader3 ? events.push(function (duration) {
                emptyLine(menuLoader3, duration);
            }) : null;
            menu.menuLoader2 ? events.push(function (duration) {
                emptyLine(menuLoader2, duration);
            }) : null;
            menu.menuLoader1 ? events.push(function (duration) {
                emptyLine(menuLoader1, duration);
            }) : null;
            executeMenuLoaders(events, loadObs, 0);
        }
  });

d3.select("#menuItem2")
  .on("click",function () {
        if(currentSection!="physics") {
            var events = [];
            !menu.menuLoader1 ? events.push(function (duration) {
                fillLine(menuLoader1, duration);
            }) : null;
            menu.menuLoader3 ? events.push(function (duration) {
                emptyLine(menuLoader3, duration);
            }) : null;
            menu.menuLoader2 ? events.push(function (duration) {
                emptyLine(menuLoader2, duration);
            }) : null;
            executeMenuLoaders(events, loadPhysics, 0);
        }
  });

d3.select("#menuItem3")
  .on("click",function () {
        if(currentSection!="analyse") {

            var events = [];
            !menu.menuLoader1 ? events.push(function (duration) {
                fillLine(menuLoader1, duration);
            }) : null;
            !menu.menuLoader2 ? events.push(function (duration) {
                fillLine(menuLoader2, duration);
            }) : null;
            menu.menuLoader3 ? events.push(function (duration) {
                emptyLine(menuLoader3, duration);
            }) : null;
            executeMenuLoaders(events, loadAnalyse, 0);
        }
  });

d3.select("#menuItem4")
  .on("click",function () {
        if(currentSection!="forecasts") {
            var events = [];
            !menu.menuLoader1 ? events.push(function (duration) {
                fillLine(menuLoader1, duration);
            }) : null;
            !menu.menuLoader2 ? events.push(function (duration) {
                fillLine(menuLoader2, duration);
            }) : null;
            !menu.menuLoader3 ? events.push(function (duration) {
                fillLine(menuLoader3, duration);
            }) : null;
            executeMenuLoaders(events, loadForecasts, 0);
        }
  });

var executeMenuLoaders = function(events, loadFn, duration) {
    var eventDuration = duration/events.length;
    var queue = new Queue();
    var totalTime = 0;
    events.forEach(function(fn){
        queue.queueEvent(function() {fn(eventDuration)}, totalTime);
        totalTime += eventDuration;
    });
    queue.queueEvent(loadFn,duration);
};

var Queue = function() {
    var totalTime = 0;
    return {
        queueEvent : function(fn, t) {
            setTimeout(fn, totalTime+t);
            totalTime += t;
        }
    };
};

window.onresize = function () {
    fillViewport();
};

window.onload = function () {
    fillViewport();
    setTimeout(loadSlide(0), 2000);
};
