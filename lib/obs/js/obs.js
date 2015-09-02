var obs = {
  load: function(){
    var sites = [],
    sources = [],
    maxpoints = 400,
    totalsites = null,
    infographicbbox = d3.select("#infographic").node().getBoundingClientRect(),
    height = infographicbbox.height,
    width = infographicbbox.width / 2,
    // width = 960,
    // height = 600,
    ptr = 3,
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
    var bob = {"lon": 151.2, "lat": -33.8, "r": ptr*2, "mugshot": "http://i.dailymail.co.uk/i/pix/2014/09/28/1411864607488_wps_1_Michael_Whitington.jpg", "text": "I'm Bob", "stationID": 12293, "alt": "20", "val": "-0.5", "type": "Synop state"};
    var EVENTS = { "totalTime": 0,
                   "queueEvent": function(fn, t){
                      setTimeout(fn, this.totalTime+t);
                      this.totalTime += t;
                   }
    };
    var TEMPLATES = {}
    d3.xhr("/lib/obs/templates/tooltip.mst", function(e, d){TEMPLATES.tooltip = d.response});
    d3.xhr("/lib/obs/templates/mugshottooltip.mst", function(e, d){TEMPLATES.mugshottooltip = d.response});
    var leeroyjenkins = function(){
      d3.text("/lib/obs/data/IdfStats_lnd_PL.txt", function(error, text) {
        var rows = d3.tsv.parseRows(text)
        rows.forEach(function(row){
            var els = row[0].split(/\s+/);
            sites.push({"stationID": parseInt(els[2]),
                        "lat": parseFloat(els[4].substring(0, els[4].length - 1)),
                        "lon": parseFloat(els[5].substring(0, els[5].length - 1)),
                        "alt": parseFloat(els[6]),
                        "val": parseFloat(els[12]),
                        "type": ((parseInt(els[2])/3)%1) == 0 ? "Synop state" : "Balloon"
                      });
        })
        totalsites = sites.length;

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
    var init = function(data){
      projection = d3.geo.orthographic()
          .scale(earthradius)
          .translate([width / 2, height / 2])
          .clipAngle(90);
      landpath = d3.geo.path().projection(projection);
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
      drag = d3.behavior.drag()
          .origin(function() { var r = projection.rotate();
                              return {x: λ.invert(r[0]), y: φ.invert(r[1])}; })
          .on("drag", function() {
            projection.rotate([λ(d3.event.x), φ(d3.event.y)]);
            redraw();
          });
      mousezoom = d3.behavior.zoom()
        .scale(projection.scale())
        .scaleExtent([height/3, 8 * height])
        .on("zoom", function() {
            var s = d3.event.scale;
            projection.scale(s);
            redraw();
            d3.select("#atmosphere")
                .style("width", s*2+"px")
                .style("height", s*2+"px")
                .style("top", (height*0.5 - s)+"px")
                .style("left", (width*0.5 - s)+"px");
      });
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
          .attr("id", "obs-wrapper")
          .style("width", width + "px")
          .style("height", height + "px")
          .style("opacity", "0")
      // wrapper.append("div")
      //     .attr("id", "atmosphere")
      //     .style("width", earthradius*2+"px")
      //     .style("height", earthradius*2+"px")
      //     .style("top", (height*0.5 - earthradius)+"px")
      //     .style("left", (width*0.5 - earthradius)+"px")
      var histo = d3.select("#obs-wrapper")
                      .append("svg")
                      .attr("id", "sources-histo")
      tooltip = d3.select("#obs-wrapper")
                      .append("div")
                      .attr("id", "tooltip");
      svg = wrapper.append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .attr("id", "globecontainer");
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
            .attr("class", "arc")
            .attr("d", function (d) {
                  d.arcend = {};
                  d.arcend.lat=d.lat;
                  d.arcend.lon=d.lon;
                  return arcpath(d, d)})
              .transition()
                .delay(function(d, i){return asmyptoticDelay(i * arcdrawdelay);})
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
      console.log("update")
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
          d3.select("#obs-wrapper")
            .style("opacity", "1");
        }, 0);

        EVENTS.queueEvent(function(){svg.transition().call(function(transition){return placetransition(transition, bob, 2000)})}, 2000);
        EVENTS.queueEvent(function(){
          addpoints([bob]);
          var pos = projection([bob.lon, bob.lat]);
          d3.select("#tooltip")
              .classed('show', true)
              .html(Handlebars.compile(TEMPLATES.mugshottooltip)({"d": bob}))
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
          addarcs([bob], 4000)
          svg.transition().call(function(transition){return placetransition(transition, exeter, 3500)})
        }, 50);
        EVENTS.queueEvent(function(){svg.select("path.point").remove()}, 4000)
        EVENTS.queueEvent(function(){
          svg
          //.call(mousezoom)
          .call(drag);
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
