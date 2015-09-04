var physics = {
  height: null,
  width: null,
  load: function(){

    var wrapper = d3.select("#infographic")
        .append("div")
        .attr("class", "row")
        .attr("id", "physics-wrapper")
        .style("width", 100 + "vw")
        .style("height", 100 + "vh")
        .style("opacity", "0")
        .style("z-index", "1")

    d3.select("#physics-wrapper")
          .style("opacity", "1");

    wrapper.append("img")
      .attr("id", "machine")
      .attr("src", "/lib/physics/img/machine.png");

    addEquations();

    function addEquations(){
      queue()
        .defer(d3.json, "/lib/physics/templates/conservationofmomentum.json")
        .defer(d3.json, "/lib/physics/templates/continuityeqn.json")
        .defer(d3.json, "/lib/physics/templates/geostrophicwind.json")
        .defer(d3.json, "/lib/physics/templates/hydrostaticbalance.json")
        .defer(d3.json, "/lib/physics/templates/pressuregradientforce.json")
        .defer(d3.json, "/lib/physics/templates/thermodynamic.json")
        .awaitAll(constructData)
    }

    function clearHPCScreen() {
      d3.select("#info")
        .style("opacity","0")
        .remove();
    }

    function updateHPCScreen(d, i) {
      var info = d3.select(this.parentNode)
        .append("div")
        .attr("id", "info")
        .html(d.eqn + "<br/>" + d.info);
      MathJax.Hub.Typeset();
    }

    function remove(d, i) {
      d3.select(this)
      .call(clearHPCScreen)
      .transition()
        .duration(1000)
        .style("top", '40vh')
        .style("left", '50vw')
      .transition()
        .delay(1000)
        .remove()
        .each("end", updateHPCScreen.apply(this, [d, i]))
    }

    function updateEquations(eqns) {
      console.log(eqns);
      var eqn = wrapper.selectAll('.eqn').data(eqns);
      var eqnenter = eqn.enter();
      eqnenter.append("div")
                  .attr("class", "eqn")
                  .style("top", function(d){return d.top})
                  .style("left", function(d){return d.left})
                  .html(function(d){return d.eqn})
                  .on("click", remove)
      MathJax.Hub.Typeset();

      // eqn.exit()
      //   .transition()
      //   .style("top", '80vh')
      //   .style("left", '50vw')
      //   .remove()
        // .each("end", updateHPCScreen)

    }

    function constructData(err, eqns) {
      var data = [];
      eqns.forEach(function(equation){
        data.push(equation);
      })

      updateEquations(data);
      
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

    //loadskill();
  },

  
  unload: function(){
    d3.select("#physics-wrapper")
      .style("opacity", "0");
    setTimeout(function(){d3.select("#physics-wrapper").remove()}, 2000);
    setTimeout(function(){d3.select("#skill-wrapper").remove()}, 0);
  }
}
