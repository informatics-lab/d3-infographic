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

    function addEquations() {
      var eqnwrapper = wrapper.append("div");
      eqnwrapper.attr("class", "eqn")
                .style('top', '50vh')
                .style('left', '50vw');
      eqnwrapper.append("p")
        .text('$$\frac{D\vec{v}}{Dt}+2\vec{\Omega}\times\vec{v} = - \frac{\nabla p}{\rho} - \nabla \Phi + \nu \nabla^2 \vec{v} \; +(\textrm{friction})$$')
      eqnwrapper
        .on("click", function(){
          showInfo();
        })
      MathJax.Hub.Typeset();
    }

    function showInfo() {
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
