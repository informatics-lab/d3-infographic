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
          .style("opacity", "0.3");

    wrapper.append("img")
      .attr("id", "machine")
      .attr("src", "/lib/physics/img/machine.png");

    loadskill();
  },
  unload: function(){
    d3.select("#physics-wrapper")
      .style("opacity", "0");
    setTimeout(function(){d3.select("#physics-wrapper").remove()}, 2000);
  }
}
