var physics = {
  height: null,
  width: null,
  load: function(){
    ibbox = d3.select("#infographic").node().getBoundingClientRect();
    this.height = ibbox.height;
    this.width = ibbox.width;

    var wrapper = d3.select("#infographic")
        .append("div")
        .attr("id", "physics-wrapper")
        .style("width", this.width + "px")
        .style("height", this.height + "px")
        .style("opacity", "0")
        .style("z-index", "1")

    d3.select("#physics-wrapper")
          .style("opacity", "0.1");

    wrapper.append("img")
      .attr("id", "machine")
      .attr("src", "/lib/physics/img/machine.png");

    addEquations();

    function addEquations() {
      var eqnwrapper = wrapper.append("div");
      eqnwrapper.attr("class", "eqn")
        .style("top", (this.height / 2) + "px")
        .style("left", (this.width / 2) + "px")
        .style("width", "100px")
        .style("height", "100px")
    }

    loadskill();
  },

  
  unload: function(){
    d3.select("#physics-wrapper")
      .style("opacity", "0");
    setTimeout(function(){d3.select("#physics-wrapper").remove()}, 2000);
    setTimeout(function(){d3.select("#skill-wrapper").remove()}, 0);
  }
}
