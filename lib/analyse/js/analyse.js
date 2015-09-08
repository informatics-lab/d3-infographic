var analyse = {
  load: function(){
    var wrapper = d3.select("#infographic")
        .append("div")
        .attr("id", "analyse-wrapper")
        .style("width", this.width + "px")
        .style("height", this.height + "px")
        .style("opacity", "0");

    d3.select("#analyse-wrapper")
          .style("opacity", "1");

    var video = wrapper.append("video")
      .attr("autoplay", "")
      .attr("loop", "");

    video.append("source")
        .attr("src", "https://s3-eu-west-1.amazonaws.com/informatics-webimages/talking-head.mp4")
        .attr("type", "video/mp4");
  },
  unload: function(){
    d3.select("#analyse-wrapper")
      .style("opacity", "0");
    setTimeout(function(){d3.select("#analyse-wrapper").remove()}, 2000);
  }
}
