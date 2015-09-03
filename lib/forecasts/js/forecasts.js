var forecasts = {
  load: function(){
    var sources = [],
    maxpoints = 40,
    totalsites = null,
    infographicbbox = d3.select("#infographic").node().getBoundingClientRect(),
    height = infographicbbox.height,
    width = infographicbbox.width / 2,
    ptr = 4,
    arcdrawduration = 1000,
    arcdrawdelay = 10,
    arcfadedurtaion = 1000,
    pointdrawduration = 1000,
    pointdrawdelay = arcdrawdelay,
    atmosthickness = 30,
    ptswellr = 5,
    ptswellduration = 250,
    earthradius = 220,
    exeter = {"lon": -3.5, "lat": 50.7, "r": ptr*2},
    svg = null, landpath = null, placetransition = null, addpoints = null, growPointTrans = null,
    asmyptoticDelay = null, redraw = null, tooltip = null, projection = null, mousezoom = null, drag = null;
    var bob = {"lon": 151.2, "lat": -33.8, "r": ptr*2, "mugshot": "http://i.dailymail.co.uk/i/pix/2014/09/28/1411864607488_wps_1_Michael_Whitington.jpg", "text": "I'm Bob", "stationID": 1229, "alt": "20", "val": "-0.5", "type": "Weather balloon"};
    var EVENTS = { "totalTime": 0,
                   "queueEvent": function(fn, t){
                      setTimeout(fn, this.totalTime+t);
                      this.totalTime += t;
                   }
    };
    var TEMPLATES = {}

    var leeroyjenkins = function(){
      var parseCSV = function(el, type){
        return {"lat": el['lat@hdr'], "lon": el['lon@hdr'], "type": type}
      }
      queue()
   .defer(d3.xhr, "/lib/forecasts/templates/tooltip.mst")
        .defer(d3.xhr, "/lib/forecasts/templates/mugshottooltip.mst")
        .defer(d3.xhr, "/lib/forecasts/templates/blurb1.html")
        .defer(d3.json, "/lib/forecasts/data/users.json")
          .awaitAll(function(error, responses){
            TEMPLATES.tooltip = responses[0].response;
            TEMPLATES.mugshottooltip = responses[1].response;
            TEMPLATES.blurb1 = responses[2].response;

            init(responses[3]);
          });
    };
    var pointpath = function(d) {
                var pr = landpath.pointRadius(d.r);
                return pr({type: "Point", coordinates: [d.lon, d.lat]});
              }
    var arcpath = function (d) {
        return landpath({type: "LineString", coordinates: [[d.arcstart.lon, d.arcstart.lat],
                                                           [d.arcend.lon, d.arcend.lat]]});
      }
    var λ = d3.scale.linear()
        .domain([0, width])
        .range([-180, 180]);

    var φ = d3.scale.linear()
        .domain([0, height])
        .range([90, -90]);

    var obstypecolor = d3.scale.category20();

    var init = function(data){
      redraw = function(){
          svg.selectAll("path.land").attr("d", landpath);
          svg.selectAll("path.point").attr("d", pointpath);
          svg.selectAll("path.arc").attr("d", function(d) {return arcpath(d)});
          svg.selectAll("#exeter").attr("d", pointpath(exeter));
      }
      asmyptoticDelay = function(i){
        r = (Math.log2(i+1)) * 1.7;
        r = Math.max(0, r-5);
        return r * 1000;
      }

      growPointTrans = function(transition, startr, endr, duration){
        transition.delay(function(d, i){return asmyptoticDelay(i * pointdrawdelay)})
                .duration(duration)
                .attrTween("d", function(d) {
                  rinterp = d3.interpolate(startr, endr);
                  var fn = function(t) {
                    d.r = rinterp(t);
                    return pointpath(d) ? pointpath(d) : "";
                  };
                  return fn;
                })
      }

      placetransition = function(transition, destination, duration){
            transition.duration(duration)
            .tween("rotate", function() {
              var r = d3.interpolate(projection.rotate(), [-destination.lon, -destination.lat]);
              return function(t) {
                projection.rotate(r(t));
                redraw();
              };
            })
          };

      var wrapper = d3.select("#infographic")
                        .append("div")
                        .attr("class", "row")
                        .attr("id", "forecast-wrapper")
                        .style("opacity", "0");

      var svgwrapper = wrapper
                        .append("div")
                        .attr("class", "col-md-5")
                        .attr("id", "svg-wrapper");

      var textwrapper = wrapper.append("div")
                                .attr("class", "col-md-5");

      textwrapper.append("div")
                 .attr("class", "text")
                 .html(Handlebars.compile(TEMPLATES.blurb1))

      var svgwrapperdims = svgwrapper.node().getBoundingClientRect();
      svg = svgwrapper.append("svg")
                      .attr("width", svgwrapperdims.width-svgwrapperdims.left)
                      .attr("height", svgwrapperdims.width-svgwrapperdims.left)
                      .attr("id", "globecontainer");

      var svgdims = svg.node().getBoundingClientRect();
      projection = d3.geo.orthographic()
                      .scale(svgdims.height*0.5*0.9)
                      .translate([svgdims.width*0.5, svgdims.height*0.5]) // a third down the svg container div
                      .clipAngle(90);
      landpath = d3.geo.path().projection(projection);

      drag = d3.behavior.drag()
          .origin(function() { var r = projection.rotate();
                              return {x: λ.invert(r[0]), y: φ.invert(r[1])}; })
          .on("drag", function() {
            projection.rotate([λ(d3.event.x), φ(d3.event.y)]);
            redraw();
          });

      tooltip = svgwrapper.append("div").attr("id", "tooltip");

      var histo = svgwrapper.append("svg").attr("id", "sources-histo");

      d3.json("/lib/obs/data/world-110m.json", function(error, world) {
        if (error) throw error;

        svg.append("path")
            .attr("id", "outline")
            .datum({type: "Sphere"})
            .attr("class", "land")
            .attr("d", landpath);
        svg.append("path")
            .datum(topojson.feature(world, world.objects.land))
            .attr("class", "land")
            .attr("d", landpath);
        svg.append("path")
            .attr("id", "exeter")
            .attr("d", pointpath(exeter))
        main(data);
      });
    }
    var addarcs = function(sites, duration){
      svg.selectAll("path.arc")
        .data(sites)
        .enter()
          .append("path")
            .style("stroke", function(d){return obstypecolor(d.type)})
            .attr("class", "arc")
            .attr("d", function (d) {
                  d.arcstart = {};
                  d.arcstart.lat = exeter.lat;
                  d.arcstart.lon = exeter.lon;
                  d.arcend = {};
                  d.arcend.lat = exeter.lat;
                  d.arcend.lon = exeter.lon;
                  thepath = arcpath(d)

                  return thepath
                })
              .transition()
                .delay(function(d, i){return asmyptoticDelay(i * arcdrawdelay);})
                .duration(duration)
                .attrTween("d", function (d) {
                  return function (t) {
                    var arcinterp = d3.geo.interpolate([d.arcstart.lon, d.arcstart.lat],
                                                       [d.lon, d.lat]);
                    explosion = arcinterp(t);
                    d.arcend.lon = explosion[0];
                    d.arcend.lat = explosion[1];
                    return arcpath(d) ? arcpath(d) : "";
                  }
                })
              .transition()
                .delay(function(d, i){return asmyptoticDelay(i * arcdrawdelay) + duration;})
                .duration(arcfadedurtaion)
                .style("opacity", 0.0)
                .each("end", function(){
                  d3.select(this).remove()
                })
    }
    addpoints = function(sites){
      var site = svg.selectAll("path.point").data(sites);
      site.enter()
            .append("path")
              .style("fill", function(d){return obstypecolor(d.type)})
              .style("stroke", function(d){return obstypecolor(d.type)})
              .attr("class", "point")
              .attr("d", function(d) {d.r=0; return pointpath(d)})
                .transition()
                .call(function(transition){return growPointTrans(transition, 0, ptr, pointdrawduration)})
                .each("end", function(d){
                  updateSources(d);
                  updateSourcesHisto(sources);
                })
      site.on("mouseover", function(d){
                tooltip.html(Handlebars.compile(TEMPLATES.tooltip)({"d": d}))
                        .style("left", (d3.event.pageX) + 7 + "px")
                        .style("top", (d3.event.pageY) + 26 + "px");
                tooltip.classed('show', true)
                        .style("display", "block");
                d3.select(this).classed("active", true);
            })
            .on("mouseout", function(d){
                tooltip.classed('show',false)
                          .style("display", "none");
                d3.select(this).classed("active", false);
            });
    }

    var updateSources = function(datum){
      var types = sources.length > 0 ? sources.map(function(el){return el.type}) : [];
      var ind = types.indexOf(datum.type);
      if (ind === -1){
        sources.push({"type": datum.type, "value": 1});
      }else{
        sources[ind].value++;
      }
    }

    var updateSourcesHisto = function(sources){
      var svg = d3.select("#sources-histo");
      var dims = svg.node().getBoundingClientRect()
      var width = dims.width;
      var height = dims.height;
      var padding = 2;
      var barHeight = (height / sources.length);

      var x = d3.scale.linear()
                    .range([0, width])
                    .domain([0, d3.max(sources, function(d){return d.value})]);

      var bar = svg.selectAll("rect").data(sources);
      var text = svg.selectAll("text").data(sources);

      bar.enter()
           .append("rect")
             .style("fill", function(d){return obstypecolor(d.type)})
             .attr("x", function(d) {x(d.value);})
             .attr("y", function(d, i) {return i * barHeight;})
             .attr("width", function(d) {return x(d.value);})
             .attr("height", barHeight - padding);

      text.enter()
             .append("text")
             .text(function(d) {return d.type;})
             .attr("x", 15)
             .attr("y", function(d, i) {return (i+0.7) * barHeight;})

      bar.transition()
               .attr("x ", function(d) {x(d.value);})
               .attr("y", function(d, i) {return i * barHeight;})
               .attr("width", function(d) {return x(d.value);})
               .attr("height", barHeight - padding);

      text.transition()
            .attr("x", 15)
            .attr("y", function(d, i) {return (i+0.7) * barHeight;})
    };

    var main = function(sites, sources) {
        EVENTS.queueEvent(function(){
          d3.select("#forecast-wrapper")
            .style("opacity", "1");
        }, 0);
        EVENTS.queueEvent(function(){
          svg.call(drag);
          addpoints(sites);
          addarcs(sites, arcdrawduration);
        }, 1000);
        EVENTS.queueEvent(function(){
          d3.timer(function(elapsed) {
            currentrotation = projection.rotate();
            projection.rotate([currentrotation[0] + 0.025, currentrotation[1] + 0.025, currentrotation[2]]);
            redraw()
          })
        }, 3000)
    };
    leeroyjenkins();
  },
  unload: function(){
    d3.select("#forecast-wrapper")
      .style("opacity", "0");
    setTimeout(function(){d3.select("#forecast-wrapper").remove()}, 2000);
  }
}
