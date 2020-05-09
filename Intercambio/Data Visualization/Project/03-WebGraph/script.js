//loading nodes
var edgesData;
var nodesData;
var topics;
var colors=['green','blue','red','yellow','cyan','orange','purple','fuchsia','black']
var colNT="#cccccc"

var selectedBar=-1;
var selectedNode="-1";
function createGraph(){
  
  var div = d3.select("body").append("div") 
    .attr("class", "tooltipN")       
    .style("opacity", 0);
  var divFixed = d3.select("body").append("div") 
    .attr("class", "tooltipN")       
    .style("opacity", 0);
  var margin= {top: 10, right: 10, bottom: 10, left: 10},
    width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Initialize the links
  var link = svg
    .selectAll("line")
    .data(edgesData)
    .enter()
    .append("line")
      .style("stroke", "#aaa")
  // Initialize the nodes
  var node = svg
    .selectAll("circle")
    .data(nodesData)
    .enter()
    .append("circle")
      .attr("r", function(d){
        return 4+d.topics.length;
      })
      .style("fill", colNT)
      .style("stroke","transparent")
      .style("stroke-width","5px")
      .on("mouseover", function(d) {
          if(d.id==selectedNode) return;
          arr=d.topics.split("")
          newTopics=arr[0]
          arr.slice(1).forEach(function (x) {
            newTopics+=', '
            newTopics+= x;
          });
          if (arr.length==0) newTopics="Not defined"

          div.transition()    
              .duration(200)    
              .style("opacity", .9);    
          div.html(d.id+ "<br/> Topics: "  +newTopics)  
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY - 20) + "px");  
          })          
      .on("mouseout", function(d) {   
          div.transition()    
              .duration(500)    
              .style("opacity", 0); 
      })
      .on("click",function(d){
          selectedNode=d.id;
          d3.select('#my_dataviz').selectAll("circle")
            .style("fill", function(x){
              if ((x.topics).includes(selectedBar)){
                return colors[+selectedBar];
              }
              return colNT;
            })
            .style("stroke","transparent");;
          d3.select(this)
            .transition()
            .duration(50)
            .style("stroke","tan");
          divFixed.transition()    
              .duration(200)    
              .style("opacity", .9);    
          divFixed.html(d.id+ "<br/> Topics: "  +newTopics)  
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY - 20) + "px");    
          });

  // Let's list the force we wanna apply on the network
  var simulation = d3.forceSimulation(nodesData)                 // Force algorithm is applied to data.nodes
      .force("link", d3.forceLink()                               // This force provides links between nodes
            .id(function(d) { return d.id; })                     // This provide  the id of a node
            .links(edgesData)                                    // and this the list of links
      )
      .force("charge", d3.forceManyBody().strength(-0.4))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
      .on("end", ticked);

  // This function is run at each iteration of the force algorithm, updating the nodes position.
  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
         .attr("cx", function (d) { return d.x+3; })
         .attr("cy", function(d) { return d.y-3; });
  }


}

function createBars(topics){

  var svgBounds = d3.select("#barChart").node().getBoundingClientRect();
  var xpad = 20;
  var ypad = 70;
  var div = d3.select("body").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);
  
  console.log(topics.length);
  var width= svgBounds.width
  var height= svgBounds.height
  var yscale=d3.scaleLinear()
      .domain([0,topics.length])
      .range([0,height-xpad])
  maxTopic=d3.max(topics, function(d){
          return d.nodes;
      })
  console.log(maxTopic)
  var xscale=d3.scaleLinear()
      .domain([0,maxTopic])
      .range([0,width-ypad])


  // Create the axes (hint: use #xAxis and #yAxis)
  var topicsNumber=[]
  topics.forEach(function(d){
      topicsNumber.push(d['topics']);
  });
  topicsNumber.push("");
  var yAxis=d3.axisLeft()
      .scale(d3.scaleLinear()
              .domain([0,topics.length])
              .range([0,height-xpad]))
      .tickFormat(function(d,i){
          if (topicsNumber[i]=="") return "";
          return "Topic " + topicsNumber[i];
      });
  var xAxis=d3.axisBottom()
      .scale(d3.scaleLinear()
              .domain([0,maxTopic])
              .range([ypad,width]));

  var svg=d3.select("#barChart");

  svg.select("#yAxis")
      .attr("transform", "translate(" + (ypad) + "," + (xpad) + ")")
      .call(yAxis)
      .selectAll("text")
      .attr("y", 0)
      .attr("x", -10);
              
  svg.select("#xAxis")
      .attr("transform", "translate(0," + (height-xpad) + ")")
      .transition()
      .duration(1000)
      .call(xAxis);

  // Create the bars (hint: use #bars)
  svg.select('#bars').selectAll('rect').remove();

  var bars=svg.select('#bars')
      .selectAll('rect')
      .data(topics)
      .enter()
      .append('rect');

  bars.attr('y',function(d,i){
          return yscale(i)+15;
      })
      .transition()
      .duration(500)
      .attr('x',function(d){
          return ypad;
      })
      .attr('height',yscale(0.30))
      .attr('width',function(d){
          return xscale(d.nodes);
      })
      .attr('fill',colNT);
  //For selecting the topic to highlight
  bars.on("click", function(d,i){
    selectedBar=d.topics;
    d3.select('#bars').selectAll('rect')
        .attr('fill',colNT)
    d3.select(this)
        .attr('fill', colors[i])

    d3.select('#my_dataviz').selectAll("circle")
      .style("fill", function(x){
            if ((x.topics).includes(selectedBar)){
              return colors[+selectedBar];
            }
            return "#aaa"
        });
    d3.select('#my_dataviz').selectAll("line")
      .style("stroke", function(x){
            if ((x.topicEdge).includes(selectedBar)){
              return colors[+selectedBar];
            }
            return colNT
        });
  });
  bars.on("mouseover", function(d,i){
        d3.select('#bars').selectAll('rect')
            .transition()
            .duration(200)
            .attr('fill',function(d,i){
              if (d.topics==selectedBar) return colors[i];
              return colNT
            });
        d3.select(this)
            .transition()
            .duration(200)
            .attr('fill', colors[i]);
        div.transition()    
              .duration(200)    
              .style("opacity", .9);    
        div.html(d.nodes)
            .style("left", (d3.event.pageX) + "px")   
            .style("top", (d3.event.pageY - 20) + "px");  
        })  
  bars.on("mouseout", function(d) {  
        d3.select('#bars').selectAll('rect')
            .transition()
            .duration(500)
            .attr('fill',function(x,i){
              if (x.topics==selectedBar) return colors[i];
              return colNT
            }); 
        div.transition()    
            .duration(500)    
            .style("opacity", 0); 
        });



}




//LOADING CSV's
d3.csv("nodesV2.csv", function (error, csv) {
    if (error) { 
      console.log(error);  //Log the error.
	    throw error;
    }
    // Store csv data in a global variable
    nodesData = csv;
    // Draw the Bar chart for the first time
    console.log(nodesData);
  //loading edges
  d3.csv("edgesV2.csv", function (error, csv2) {
    if (error) { 
      console.log(error);  //Log the error.
      throw error;
    }
    // Store csv data in a global variable
    edgesData = csv2;
    d3.csv("topics.csv", function (error, csv3) {
    if (error) { 
      console.log(error);  //Log the error.
      throw error;
    }
    csv3.forEach(function (d) {
        // Convert numeric values to 'numbers'
        d.nodes = +d.nodes;
    });
    topics = csv3;
    createBars(topics);
    createGraph();
    });
  });
});



