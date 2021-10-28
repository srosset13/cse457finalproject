
// Will be used to the save the loaded JSON data
var allData = [];
var wordData = [];

// Set ordinal color scale
var colorScale = d3.scaleOrdinal();

// Start application by loading the data
loadData();

function loadData() {
    d3.json("data/three-bears-data.json").then(function(jsonData){
        allData = jsonData;

        var wee = []
        var middle = []
        var great = []
        var woman = []

        // Count the number of "wee", "middle", "great", and "woman" in our data 
        allData.sentences.forEach(function(s) {
            var sent = s.sentence.toLowerCase();

            var weeCount = (sent.match(/wee/g) || []).length;
            if (weeCount > 0) {
                wee.push(1)
            } else {
                wee.push(0)
            }

            var middleCount = (sent.match(/middle/g) || []).length;
            if (middleCount > 0) {
                middle.push(1)
            } else {
                middle.push(0)
            }
            
            var greatCount = (sent.match(/great/g) || []).length;
            if (greatCount > 0) {
                great.push(1)
            } else {
                great.push(0)
            }

            var womanCount = (sent.match(/woman/g) || []).length;
            if (womanCount > 0) {
                woman.push(1)
            } else {
                woman.push(0)
            }

        });

        wordData.push(wee);
        wordData.push(middle);
        wordData.push(great);
        wordData.push(woman);

        // Update color scale
        // Will use the color scale later for the stacked area chart
        let data_keys = Object.keys(wordData).filter(function(d){ return d });
        colorScale.domain(data_keys).range(d3.schemeSet3);

        createVis();
    });
}

function createVis() {
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 960 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // Define the div for the tooltip
    var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

    // Create svg (scales as the device/viewport size changes)
    var svg = d3.select("div#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1000 1000") //, width, height)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")
    .classed("svg-content", true);

    // Stack the data: each group will be represented on 
    // top of each other in the stacked area chart
    var stackedData = []
    var wee = []
    for (var i = 0; i < wordData[0].length; i++) {
        var temp = []
        temp.push(0)
        temp.push(wordData[0][i])
        wee.push(temp)
    }
    var middle = []
    for (var i = 0; i < wordData[1].length; i++) {
        var temp = []
        temp.push(wordData[0][i])
        temp.push(wordData[0][i] + wordData[1][i])
        middle.push(temp)
    }
    var great = []
    for (var i = 0; i < wordData[2].length; i++) {
        var temp = []
        temp.push(wordData[0][i] + wordData[1][i])
        temp.push(wordData[0][i] + wordData[1][i] + wordData[2][i])
        great.push(temp)
    }
    var woman = []
    for (var i = 0; i < wordData[3].length; i++) {
        var temp = []
        temp.push(wordData[0][i] + wordData[1][i] + wordData[2][i])
        temp.push(wordData[0][i] + wordData[1][i] + wordData[2][i] + wordData[3][i])
        woman.push(temp)
    }
    stackedData.push(wee)
    stackedData.push(middle)
    stackedData.push(great)
    stackedData.push(woman)

    // The following inspired by https://www.d3-graph-gallery.com/graph/stackedarea_basic.html, accessed on 10/17/21:

    // X axis
    var x = d3.scaleLinear()
    .domain(d3.extent(wordData, function(d, index) { return index; }))
    .range([0, width]);
    svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    //.ticks(9)

    // text label for the X axis
    svg.append("text")     
    .attr("transform",
        "translate(" + (0) + " ," + 
                       (height + margin.top + 15) + ")")
    .text("Beginning");
    svg.append("text")             
    .attr("transform",
        "translate(" + ((width/2) - 25) + " ," + 
                       (height + margin.top + 15) + ")")
    .text("Middle");
    svg.append("text")             
    .attr("transform",
        "translate(" + (width-25) + " ," + 
                       (height + margin.top + 15) + ")")
    .text("End");

    // Y axis
    var y = d3.scaleLinear()
    .domain([0, d3.max(wordData, function(d) { return + d; })*1.2])
    .range([height, 0]);
    svg.append("g")
    .call(d3.axisLeft(y));

    // text label for the y axis
    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Mentions");  

    var mygroups = ["Wee", "Middle", "Great", "Woman"]

    var color = d3.scaleOrdinal()
    .domain(mygroups)
    .range(['#D8BFD8','#FF00FF','#9370DB','#800080','#4B0082'])


    // Draw graph areas
    svg
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
    .style("fill", function(d, index) { 
        var name = mygroups[index-1];  
        return color(name); 
    })
    .attr("d", d3.area()
      .x(function(d, index) { return (index)*14; })
      .y0(function(d) { return height-(d[0])*80; })
      .y1(function(d) { return height-(d[1])*80; })
    )
    // tooltip below inspired by: https://bl.ocks.org/d3noob/a22c42db65eb00d4e369, accessed on 10/17/21:
    .on("mouseover", function(d,i) {
        console.log("mouse over")
        console.log(d)

        var str = "";
        if (i[1][0] == 3 && i[1][1] == 3) {
            str = "Old Woman"
        }
        else if (i[1][1] == 1) {
            str = "Little, Small Wee Bear"
        } else if (i[1][1] == 2) {
            str = "Middle-sized Bear"
        }
        else if (i[1][1] == 3) {
            str = "Great, Huge Bear"
        }
        div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div	.html(str)	
                .style("left", (d.clientX) + 20 + "px")		
                .style("top", (d.clientY - 20) + "px");	
        return d3.select(this).style("opacity", 0.6)
    })
    .on("mouseout", function(d,i) {
        div.transition()		
            .duration(500)		
            .style("opacity", 0);	
        return d3.select(this).style("opacity", 1)
    })

}


