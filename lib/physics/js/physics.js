var physics = {
  height: null,
  width: null,
  load: function(){
    ibbox = d3.select("#infographic").node().getBoundingClientRect();
    console.log(ibbox);
    this.height = ibbox.height;
    this.width = ibbox.width;

    var wrapper = d3.select("#infographic")
        .append("div")
        .attr("id", "physics-wrapper")
        .style("width", this.ibbox.width + "px")
        .style("height", this.ibbox.height + "px")
        .style("opacity", "0")

    d3.select("#physics-wrapper")
          .style("opacity", "1");

    wrapper.append("img")
      .attr("id", "machine")
      .attr("src", "/lib/physics/img/machine.png");
  },
  unload: function(){
    d3.select("#physics-wrapper")
      .style("opacity", "0");
    setTimeout(function(){d3.select("#physics-wrapper").remove()}, 2000);
  }
}
