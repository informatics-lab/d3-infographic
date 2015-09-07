var obs = {
  load: function() {
    var sources = [],
    maxpoints = 1500,
    totalsites = null,
    infographicbbox = d3.select("#infographic").node().getBoundingClientRect(),
    height = infographicbbox.height,
    width = infographicbbox.width / 2,
    ptr = 1,
    arcdrawduration = 1000,
    arcdrawdelay = 70,
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
    var laura = {"lon": 26.5, "lat": -75.5, "r": ptr*2, "mugshot": "lib/obs/img/laura.png", "text": "Laura worked on Antartica taking weather observations such as air pressure and temperature. She sent these back to the Met Office in Exeter where they were used in the weather forecast.",
                  "type": "Weather balloon", "temp":  -40, "press": 681.3};
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
        .defer(d3.xhr, "lib/obs/templates/tooltip.mst")
        .defer(d3.xhr, "lib/obs/templates/mugshottooltip.mst")
        .defer(d3.xhr, "lib/obs/templates/blurb1.html")
        .defer(d3.csv, "lib/obs/data/obs/aircraft.csv", function(el){return parseCSV(el, "Aircraft")})
        .defer(d3.csv, "lib/obs/data/obs/sonde.csv", function(el){return parseCSV(el, "Weather balloon")})
        .defer(d3.csv, "lib/obs/data/obs/surface.csv", function(el){return parseCSV(el, "Land/ships/buoys")})
        .defer(d3.csv, "lib/obs/data/obs/gpsro.csv", function(el){return parseCSV(el, "Satellite")})
        .defer(d3.csv, "lib/obs/data/obs/mtsatclear.csv", function(el){return parseCSV(el, "Satellite")})
        .defer(d3.csv, "lib/obs/data/obs/scatwind.csv", function(el){return parseCSV(el, "Satellite")})
        .defer(d3.csv, "lib/obs/data/obs/atovs.csv", function(el){return parseCSV(el, "Satellite")})
        .defer(d3.csv, "lib/obs/data/obs/goesclear.csv", function(el){return parseCSV(el, "Satellite")})
          .awaitAll(function(error, responses){ 
            TEMPLATES.tooltip = responses[0].response;
            TEMPLATES.mugshottooltip = responses[1].response;
            TEMPLATES.blurb1 = responses[2].response;

            var sites = d3.merge([responses[3], responses[4],
                                  responses[5], responses[6],
                                  responses[7], responses[8],
                                  responses[9], responses[10]]);
            init(d3.shuffle(sites).slice(0, maxpoints));
          });
    };
    var pointpath = function(d) {
                var pr = landpath.pointRadius(d.r);
                return pr({type: "Point", coordinates: [d.lon, d.lat]});
              }
    var arcpath = function (d) {
        return landpath({type: "LineString", coordinates: [[d.lon, d.lat],
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
          svg.selectAll("path.arc").attr("d", function(d) {return arcpath(d, exeter)});
          svg.selectAll("#exeter").attr("d", pointpath(exeter));
      }
      asmyptoticDelay = function(i){
        r = (Math.log2(i+1)) * 1.7;
        r = Math.max(0, r-5);
        return r * 1000;
      }
      drawDelay = function(i){
        var r;
        if (i < 20){
          r = asmyptoticDelay(i*pointdrawdelay/10);
        }else{
          r = i*pointdrawdelay;
        }
        return r;
      }

      growPointTrans = function(transition, startr, endr, duration){
        transition.delay(function(d, i){return drawDelay(i) })
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
                        .attr("id", "obs-wrapper")
                        .style("opacity", "0");

      var svgwrapper = wrapper
                        .append("div")
                        .attr("class", "col-md-6")
                        .attr("id", "svg-wrapper");

      var textwrapper = wrapper.append("div")
                                .attr("class", "col-md-6");

      textwrapper.append("div")
                 .attr("class", "text")
                 .html(Handlebars.compile(TEMPLATES.blurb1))

      var svgwrapperdims = svgwrapper.node().getBoundingClientRect();
      svg = svgwrapper.append("svg")
                      .attr("width", svgwrapperdims.width*(2/3))
                      .attr("height", svgwrapperdims.width*(2/3))
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

      d3.json("lib/obs/data/world-110m.json", function(error, world) {
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
                  d.arcend = {};
                  d.arcend.lat=d.lat;
                  d.arcend.lon=d.lon;
                  return arcpath(d, d)})
              .transition()
                .delay(function(d, i){return drawDelay(i);})
                .duration(duration)
                .attrTween("d", function (d) {
                  return function (t) {
                    var arcinterp = d3.geo.interpolate([d.lon, d.lat],
                                                       [exeter.lon, exeter.lat]);
                    explosion = arcinterp(t);
                    d.arcend.lon = explosion[0];
                    d.arcend.lat = explosion[1];
                    return arcpath(d) ? arcpath(d) : "";
                  }
                })
              .transition()
                .delay(function(d, i){return drawDelay(i) + duration;})
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
        try {
            var svg = d3.select("#sources-histo");
            var dims = svg.node().getBoundingClientRect();
            var width = dims.width;
            var height = dims.height;
            var padding = 2;
            var barHeight = (height / sources.length);

            var x = d3.scale.linear()
                .range([0, width])
                .domain([0, d3.max(sources, function (d) {
                    return d.value
                })]);

            var bar = svg.selectAll("rect").data(sources);
            var text = svg.selectAll("text").data(sources);

            bar.enter()
                .append("rect")
                .style("fill", function (d) {
                    return obstypecolor(d.type)
                })
                .attr("x", function (d) {
                    x(d.value);
                })
                .attr("y", function (d, i) {
                    return i * barHeight;
                })
                .attr("width", function (d) {
                    return x(d.value);
                })
                .attr("height", barHeight - padding);

            text.enter()
                .append("text")
                .text(function (d) {
                    return d.type;
                })
                .attr("x", 15)
                .attr("y", function (d, i) {
                    return (i + 0.7) * barHeight;
                });

            bar.transition()
                .attr("x ", function (d) {
                    x(d.value);
                })
                .attr("y", function (d, i) {
                    return i * barHeight;
                })
                .attr("width", function (d) {
                    return x(d.value);
                })
                .attr("height", barHeight - padding);

            text.transition()
                .attr("x", 15)
                .attr("y", function (d, i) {
                    return (i + 0.7) * barHeight;
                })
        } catch (e) {
            //do nothing
        }
    };

    var main = function(sites, sources) {
        EVENTS.queueEvent(function(){
          d3.select("#obs-wrapper")
            .style("opacity", "1");
        }, 0);

        EVENTS.queueEvent(function(){svg.transition().call(function(transition){return placetransition(transition, laura, 2000)})}, 2000);
        EVENTS.queueEvent(function(){
          addpoints([laura]);
          var pos = projection([laura.lon, laura.lat]);
          d3.select("#tooltip")
              .attr("class", "mugshottooltip")
              .classed('show', true)
              .html(Handlebars.compile(TEMPLATES.mugshottooltip)({"d": laura}))
              .style("left", pos[0] + 50 + "px")
              .style("top", pos[1] + 70 + "px");
        }, 2000);
        for (i=0; i<8; i++){
          var activate = i%2===0;
          if (activate === true) {
            EVENTS.queueEvent(function(){d3.selectAll("path.point").classed("active", true)}, 250);
          } else {
            EVENTS.queueEvent(function(){d3.selectAll("path.point").classed("active", false)}, 250);
          }
        }
        EVENTS.queueEvent(function(){
          d3.select("#tooltip").classed('show', false).style("display", "none");
          addarcs([laura], 4000)
          svg.transition().call(function(transition){return placetransition(transition, {"lat":exeter.lat-20, "lon":exeter.lon-20}, 3500)})
        }, 5000);
        EVENTS.queueEvent(function(){svg.select("path.point").remove()}, 4000)
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
    d3.select("#obs-wrapper")
      .style("opacity", "0");
    setTimeout(function(){d3.select("#obs-wrapper").remove()}, 2000);
  }
}