function loadskill() {
  ibbox = d3.select("#infographic").node().getBoundingClientRect();
    this.height = ibbox.height;
    this.width = ibbox.width;
  var wrapper = d3.select("#infographic")
        .append("div")
        .attr("id", "skill-wrapper")
        .style("width", this.width + "px")
        .style("height", this.height + "px")
        .style("opacity", "1")
        .style("z-index", "2")
        .style("position", "absolute")

  var lineDuration = 8000;

  var margin = {top: 20, right: 20, bottom: 30, left: 80},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y%m%d0000").parse;

  // domains for x and y being set after data load
  var x = d3.time.scale()
      .range([0, width])

  var y = d3.scale.linear()
      .range([0, height]);

  var xAxis = d3.svg.axis()
      .scale(x)
      // .ticks(d3.time.year, 1)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .ticks(0)
      .orient("left");

  var lineFunction = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.skill); });

  var svg = d3.select("#skill-wrapper").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var radiobuttons = d3.select("#skill-wrapper").append("form").attr("id", "radiobuttons");

  var monotes = [
    {"date": parseDate("201009010000"), "html": "<p>Improvements to model physics</p>"},
    {"date": parseDate("201109010000"), "html": "<p>Improvement to assimilation of observations</p>"},
    {"date": parseDate("201301010000"), "html": "<p>Improvements to model physics</p>"},
    {"date": parseDate("201409010000"), "html": "<p>Improvement to model and resolution (global model at 17 km)</p>"}
  ];
  var aunotes = [{'date': parseDate('201005010000'), 'html':'<p>Switch to Met Office Unified Model</p>'}]
  var centers = [
      {'center':'Met Office', 'file':'lib/skill/data/Met_Office-Anl_norm.csv', 'notes':monotes, 'colour':"steelblue"},
      {'center':'Australia', 'file':'lib/skill/data/BoM_AU_UM_partner-Anl_norm.csv', 'notes':aunotes, 'colour':"darkred"},
      {'center':'Japan', 'file':"lib/skill/data/JMA_JA-Anl_norm.csv", 'notes':[], 'colour':"green"},
      {'center':'USA', 'file':"lib/skill/data/NCEP_US-Anl_norm.csv", 'notes':[], 'colour':"orange"},
  ];

  var q = queue();
  for (var i=0; i<centers.length; i++){
    q.defer(d3.csv, centers[i].file)
  }
    q.awaitAll(mkSkillObjects);

  function processData(data, index) {
    data.forEach(function(d) {
      d.date = parseDate(d.Datetime);
      d.skill = +d.Value;
      d.center = centers[index].center;
      d.notes = centers[index].notes;
      d.colour = centers[index].colour;
      delete d.Datetime;
      delete d.Value;
    });
  }

  function mkSkillObjects(error, datasets) {
    if (error) throw error;

    for (var i=0; i<datasets.length; i++){
      processData(datasets[i], i);
    }
    
    main(datasets);
  }


  function main(datasets) {
    var combined = [].concat.apply([], datasets);
    
    x.domain(d3.extent(combined, function(d) { return d.date; }));
    y.domain(d3.extent(combined, function(d) { return d.skill; }));
    var ptfromt = d3.time
                    .scale()
                    .range([0, datasets[0].length-1.0])
                    .domain(d3.extent(datasets[0], function(d) { return d.date; }));


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Forcast accuracy");

    function rollingLine(d, i, notes) {
      var tfrompt = d3.time
                    .scale()
                    .range(d3.extent(d, function(d) { return d.date; }))
                    .domain([0, d.length-1.0]);

      var displayedNotes = [];

      return function(t) {
          var index = d.length * t;
          var flooredX = Math.floor(index);
          var weight = index - flooredX;
          var interpolatedLine = d.slice(0, flooredX+1);

          notes.forEach(function(el){
            if (Date.parse(el.date) === Date.parse(interpolatedLine[interpolatedLine.length-1].date)){
              displayedNotes.push(el);
              updateNotes(d, displayedNotes);
            }
          });

          if(flooredX < d.length-1.0) {
              var weightedLineAverage = d[flooredX].skill * (1-weight) + d[flooredX+1].skill * weight;
              interpolatedLine.push({"date": tfrompt(index),
                                     "skill": weightedLineAverage});
          }

          return lineFunction(interpolatedLine);
      }
    }

    var updateTooltips = function(tooltips){
        var tooltip = d3.select("#skill-wrapper").selectAll(".tooltip").data(tooltips);
        tooltip.enter()
            .append("div") 
            .attr("class", "tooltip show")
            .html(function(d){return d.html})
            .style("left", function(d){return d.x + 50 + "px"})          
            .style("top", function(d){return d.y + 50 + "px"})
            .style("display", "block")
        tooltip.style("z-index", "1000")
            .classed("show", true)
        tooltip.exit()
            .classed("show", false)
            .remove()
    };

    var update = function(skillsets, callback){
      if (!callback) {callback = function(){}};
      var combined = [].concat.apply([], skillsets);

      x.domain(d3.extent(combined, function(d) { return d.date; }));
      y.domain(d3.extent(combined, function(d) { return d.skill; }));

      svg.selectAll("path.skill")
        .data(skillsets)
        .transition()
          .attr('d', function(d, i){console.log(i);return lineFunction(d)})
          .each(function(d,i){updateNotes(d, centers[i].notes)})

      svg.selectAll("text.center").data(skillsets)
        .transition()
        .attr("y", function(d){return y(d[0].skill)})

      svg.selectAll("path.skill")
        .data(skillsets)
        .enter().append("path")
        .attr("class", "path skill")
        .attr("id", "skill")
        .attr("d", "")
        .on("mouseover", function(d){
          d3.select(this).style("stroke-width", 2);
          d3.select("#skill-wrapper")
            .append("div") 
            .attr("class", "info show")
            .attr("id", "center")
            .html("<p>"+d[0].center+"</p>")
            .style("left", d3.event.pageX+"px")          
            .style("top", d3.event.pageY+"px")
            .style("display", "block")
            .style("z-index", "1000")
            .style("color", d[0].colour);
        })
        .on("mouseout", function(){
          d3.select(this).style("stroke-width", 1);
          d3.select("#center").remove();
        })
        .style("stroke", function(d,i){return centers[i].colour})
        .transition()
          .duration(lineDuration)
            .ease("linear")
            .attrTween('d', function(d, i){return rollingLine(d, i, centers[i].notes)})
            .each("end", function(){
              tooltips=[];
              updateTooltips(tooltips)
              d3.selectAll(".note")
                .on("mouseover", function(d){
                  tooltips.push({"html": d.html, "x": d3.event.pageX, "y": d3.event.pageY});
                  updateTooltips(tooltips);
                  svg
                  .append("path")
                  .attr('id', "hover")
                  .attr("class", "path hover")
                  .attr('d',
                    lineFunction([
                                    {"date": d.date, "skill": d3.min(combined, function(d){return d.skill})},
                                    {"date": d.date, "skill": d3.max(combined, function(d){return d.skill})}
                                  ])
                  )
                })
                .on("mouseout", function(d){
                  // if (Math.abs(d3.mouse(this)[0] - d3.event.target.cx.baseVal.value) > 0.5){
                  // }
                  tooltips.pop();
                  updateTooltips(tooltips)
                  svg.select("#hover").remove();
                })
                
                .call(callback)
              })
      svg.selectAll("text.center").data(skillsets).enter()
        .append("text")
        .attr("class", "text center")
        .style("fill", function(d){return d[0].colour})
        .attr("x", -80)
        .attr("y", function(d){return y(d[0].skill)})
        .text(function(d){return d[0].center})

      //svg.selectAll("path.skill").data(skillsets).exit().remove()


    };

    var updateNotes = function(skillset, notes){
      note = svg.selectAll(".note").data(notes, function(d){return d.date});
      note.enter()
          .append("circle")
            .attr("class", "note")
            .attr("cx", function(d){return x(d.date)})
            .attr("cy", function(d){return y(skillset[Math.floor(ptfromt(d.date))].skill)})
            .attr("r", 0)
            .style("fill", function(d){return skillset[0].colour})
            .style("stroke", function(d){return skillset[0].colour})
          .transition()
            .attr("r", 5)
            .each(function(d){
              tooltips.push({"html": d.html, "x": x(d.date), "y": y(skillset[Math.floor(ptfromt(d.date))].skill)});
              updateTooltips(tooltips);
            })

      note
        .transition().ease("sin-in-out")
        .attr("cx", function(d){return x(d.date)})
        .attr("cy", function(d){return y(skillset[Math.floor(ptfromt(d.date))].skill)})
        .attr("r", 5)

      //note.exit().remove();
    };

    var tooltips = [];

    var init = function(skillsets){
      var showdiv = function() {
        d3.select("#skill-wrapper")
        .append("div") 
            .attr("class", "info show")
            .attr("id", "continue")
            .html("<p>Click to continue</p>")
            .style("left", "50%")          
            .style("top", "50%")
            .style("display", "block")
            .style("z-index", "1000")
            .on("click", function(){
              d3.select("#skill-wrapper").select("#continue").remove();
              update(skillsets);
            })
            .classed("show", true)
      }

      update([skillsets[0]], showdiv);
    };

    init(datasets);
      
  };
};