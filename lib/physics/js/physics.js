var physics = {
  height: null,
  width: null,
  load: function(){
    var world = null, landpath = null, projection = null;
    var stopTimer = false;
    var wrapper = d3.select("#infographic")
        .append("div")
        .attr("class", "row")
        .attr("id", "physics-wrapper")
        .style("width", 100 + "vw")
        .style("height", 100 + "vh")
        .style("opacity", "0")
        .style("z-index", "1")

    wrapper.style("opacity", "1");

    wrapper.append("img")
      .attr("id", "machine")
      .attr("src", "/lib/physics/img/machine_labelled.png");

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
        .duration(1000)
        .style("left", "460px")
        .style("top", "50px")
        .tween("shinkglobe", function(){
          return function(t){
          projection = d3.geo.orthographic()
                      .scale(Math.max(40 * (1.0-t), 10))
                      .translate([Math.max(40 * (1.0-t), 10), Math.max(40 * (1.0-t), 10)]) // a third down the svg container div
                      .clipAngle(90);
          landpath = d3.geo.path().projection(projection);
        }})
    }

    function getBox(startPos, endPos){
      var left, top, width, height;
      left = Math.min(startPos.x, endPos.x);
      top = Math.min(startPos.y, endPos.y);
      width = Math.abs(startPos.x - endPos.x);
      height = Math.abs(startPos.y - endPos.y);

      return {"left": left, "top": top, "width": width, "height": height};
    }

    function drawLines(startPos, endPos){
      console.log("in here");
      dims = getBox(startPos, endPos);
      console.log(dims);
      // d3.timer(function(elapsed){
        var svg = wrapper.append("svg")
                      .style("position", "absolute")
                      .style(dims)
                      .attr("class", "arcsvg");
        svg.append("line")          // attach a line
              .attr("x1", startPos.x)     // x position of the first end of the line
              .attr("y1", startPos.y)      // y position of the first end of the line
              .attr("x2", startPos.x)     // x position of the second end of the line
              .attr("y2", startPos.y)
            .transition()
              .duration(1000)
              .attr("x1", startPos.x)     // x position of the first end of the line
              .attr("y1", startPos.y)      // y position of the first end of the line
              .attr("x2", endPos.x)     // x position of the second end of the line
              .attr("y2", endPos.y)
            .transition()
              .delay(4000)
              .style("opacity", 1.0)
              .each("end", function(){
                  // d3.select(this.parentNode).remove();
              })
      // }, 1000)
    }
    //loadskill();
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
  }
}
