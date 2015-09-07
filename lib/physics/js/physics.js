var physics = {
  height: null,
  width: null,
  template: null,
  myload: function(){
    console.log("here")
    var world = null, landpath = null, projection = null;
    var stopTimer = false;
    var wrapper = d3.select("#infographic")
        .append("div")
        .attr("class", "row")
        .attr("id", "physics-wrapper")
        .style("width", 100 + "vw")
        .style("height", 100 + "vh")
        .style("opacity", "0")
        .style("z-index", "1");

    wrapper.style("opacity", "1");

    wrapper.append("img")
      .attr("id", "machine")
      .attr("src", "/lib/physics/img/machine.png");
    wrapper.append("div")
      .attr("class", "label")
      .style("top", "8%")
      .style("left", "40%")
      .html("<p>observations in</p>");
    wrapper.append("div")
      .attr("class", "label")
      .style("top", "65%")
      .style("left", "40%")
      .html("<p>forecast data out</p>");

    wrapper.append("div").attr("class", "col-md-9");
    var textwrapper = wrapper.append("div").attr("class", "col-md-3");

    textwrapper.append("div")
                 .attr("class", "text")
                 .html(this.template)

    var info = wrapper.append("div").attr("id", "info");
    info.append("div").attr("id", "infoeqn");
    info.append("div").attr("id", "infotext");

    addEquations();

    function addEquations(){
      queue()
        .defer(d3.json, "/lib/obs/data/world-110m.json")
        .defer(d3.json, "/lib/physics/templates/conservationofmomentum.json")
        .defer(d3.json, "/lib/physics/templates/continuityeqn.json")
        .defer(d3.json, "/lib/physics/templates/geostrophicwind.json")
        .defer(d3.json, "/lib/physics/templates/hydrostaticbalance.json")
        .defer(d3.json, "/lib/physics/templates/pressuregradientforce.json")
        .defer(d3.json, "/lib/physics/templates/thermodynamic.json")
        .awaitAll(constructData)
    }

    function clearHPCScreen() {
      d3.select("#infoeqn")
          .html("")
      d3.select("#infotext")
          .html("")
    }

    function updateHPCScreen(d, i) {
      d3.select("#infoeqn").html(d.eqn);
      d3.select("#infotext").html(d.info);
      MathJax.Hub.Typeset();
    }

    function showAccuracy() {
        wrapper
        .append("div") 
            .attr("class", "info show")
            .attr("id", "accuracy")
            .html("<p>The forecast is done! <br/> Now see how our forecasts measure up</p>")
            .style("left", "10%")          
            .style("top", "50%")
            .style("display", "block")
            .style("z-index", "1000")
            .on("click", function(){
              wrapper.select("#accuracy").remove();
              loadSkillGraph();
            })
            .classed("show", true)
      }

    function isEnd() {
      var eqn = wrapper.selectAll('.eqn');
      if (eqn[0].length === 0) {
        wrapper.append("img")
                .attr("id", "forecast-img")
                .attr("src", "./images/4-forecasts-icon.svg")
                .style("position", "absolute")
                .style("left", "26%")
                .style("top", "63%")
                .style("width", "15%")
                .style("height", "15%")
                .style("opacity", "1")
      // wrapper.transtion()
                // .style("opacity", "1")

        showAccuracy();
      }
    }

    function loadSkillGraph() {
      clearHPCScreen();
      stopTimer = true;
      wrapper.transition().style("opacity", 0.1);
      svg.transition().style("opacity", 0.1);
      loadskill();
    }

    function remove(d, i) {
      var info = d3.select("#info");
      var mythis = d3.select(this);
      var top = parseInt(info.style("top")) + parseInt(info.style("height"))/2 - parseInt(mythis.style("height"))/2 + "px";
      var left = parseInt(info.style("left")) + parseInt(info.style("width"))/2 - parseInt(mythis.style("width"))/2 + "px";
      mythis
        .transition().duration(500)
          .style("top", top)
          .style("left", left)
          .each("start", clearHPCScreen)
        .transition()
          .remove()
          .each("end", function(d, i){
            updateHPCScreen.apply(this, [d, i]);
            isEnd();
          })
        
    }

    function updateEquations(eqns) {
      var eqn = wrapper.selectAll('.eqn').data(eqns);
      var eqnenter = eqn.enter();
      eqnenter.append("div")
                  .attr("class", "eqn wobble")
                  .style("top", function(d){return d.top})
                  .style("left", function(d){return d.left})
                  .html(function(d){return d.eqn})
                  .on("mouseover", remove)
      MathJax.Hub.Typeset();
    }

    function constructData(err, datain) {
      world = datain.splice(0, 1)[0];
      var data = [];
      datain.forEach(function(equation){
        data.push(equation);
      })

      updateEquations(data);
      drawGlobe();

      moveGlobe();
    }

    function showInfo(e) {
      d3.select("#info")
        .style("opacity","0")
        .remove();
      var info = wrapper.append("div")
        .attr("id", "info")
      info.append("p")
        .text("Here's some information.")
    }

    redrawGlobe = function(){
          svg.selectAll("path.land").attr("d", landpath);
      }

    function drawGlobe(){
      projection = d3.geo.orthographic()
                      .scale(40)
                      .translate([40, 40]) // a third down the svg container div
                      .clipAngle(90);
      landpath = d3.geo.path().projection(projection);

      svg = wrapper.append("svg").attr("class", "globe")
      svg.append("path")
            .attr("id", "outline")
            .datum({type: "Sphere"})
            .attr("class", "land")
            .attr("d", landpath);
      svg.append("path")
            .datum(topojson.feature(world, world.objects.land))
            .attr("class", "land")
            .attr("d", landpath);

      d3.timer(function(elapsed) {
        currentrotation = projection.rotate();
        projection.rotate([currentrotation[0] + 0.5, currentrotation[1], currentrotation[2]]);
        redrawGlobe();
        return stopTimer;
      })
    }

    function moveGlobe() {
      svg.transition()
        .delay(1000)
        .duration(2500)
        .style("left", "560px")
        .style("top", "110px")
        .tween("shinkglobe", function(){
          return function(t){
          projection = d3.geo.orthographic()
                      .scale(40 * (1.0-t))
                      .translate([40 * (1.0-t), 40 * (1.0-t)]) // a third down the svg container div
                      .clipAngle(90);
          landpath = d3.geo.path().projection(projection);
        }})
        .each("end", function(d){d3.select(this).remove()})
    }

  },

  
  unload: function(){
    d3.select("#physics-wrapper")
      .style("opacity", "0");
    d3.select("#skill-wrapper")
      .style("opacity", "0");
    svg
      .style("opacity", "0");
    setTimeout(function(){d3.select("#physics-wrapper").remove()}, 2000);
    setTimeout(function(){d3.select("#skill-wrapper").remove()}, 2000);
    setTimeout(function(){svg.remove()}, 2000);
  },
  
  load: function(){
    var r = d3.xhr("lib/physics/templates/blurb.html", function(err, resp){
      physics.template = resp.response;
      physics.myload();
    });
  }
}
