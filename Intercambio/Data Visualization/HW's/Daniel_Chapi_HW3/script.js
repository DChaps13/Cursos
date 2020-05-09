// Global var for FIFA world cup data
var allWorldCupData;
var projection;


/**
 * Render and update the bar chart based on the selection of the data type in the drop-down box
 *
 * @param selectedDimension a string specifying which dimension to render in the bar chart
 */
function createBarChart(selectedDimension) {

    var svgBounds = d3.select("#barChart").node().getBoundingClientRect();
    var xpad = 100;
    var ypad = 70;

    console.log(svgBounds);

    // ******* TODO: PART I *******

    // Create the x and y scales; make
    // sure to leave room for the axes
    // 
    
    var awcData=[]
    allWorldCupData.forEach(function(d){
        awcData.unshift(d[selectedDimension]);
    });
    console.log(awcData);
    var width= svgBounds.width
    var height= svgBounds.height
    var xscale=d3.scaleLinear()
        .domain([0,awcData.length])
        .range([0,width-ypad])
    var yscale=d3.scaleLinear()
        .domain([0,d3.max(awcData, function(d){
            return d;
        })])
        .range([0,height-ypad])

    // Create colorScale
    var colors=['#4eb0c4','#55c0d6','#3f7c9e','#325ea3','#04275e']
    var colorScale=d3.scaleQuantile()
        .domain([0,d3.max(awcData,function(d){
            return d;
        })])
        .range(colors);

    // Create the axes (hint: use #xAxis and #yAxis)
    var years=[]
    allWorldCupData.forEach(function(d){
        years.unshift(d['YEAR']);
    });

    var xAxis=d3.axisBottom()
        .scale(d3.scaleLinear()
                .domain([0,awcData.length])
                .range([ypad,width]))
        .tickFormat(function(d,i){
            return years[i];
        })
        .ticks(20);
    var yAxis=d3.axisLeft()
        .scale(d3.scaleLinear()
                .domain([0,d3.max(awcData,function(d){
                    return d;
                })])
                .range([height-ypad,0]));

    var svg=d3.select("#barChart");

    svg.select("#xAxis")
        .attr("transform", "translate(0," + (height-ypad) + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 5)
        .attr("x", -20)
        .attr("transform", "rotate(270)");
                
    svg.select("#yAxis")
        .attr("transform", "translate(" + (ypad) + ",0)")
        .transition()
        .duration(1000)
        .call(yAxis);

    // Create the bars (hint: use #bars)
    svg.select('#bars').selectAll('rect').remove();

    var bars=svg.select('#bars')
        .selectAll('rect')
        .data(awcData)
        .enter()
        .append('rect');
    bars.attr('x',function(d,i){
            return xscale(i)+ypad+2;
        })
        .transition()
        .duration(500)
        .attr('y',function(d){
            return height-yscale(d)-ypad;
        })
        .attr('width',xscale(0.90))
        .attr('height',function(d){
            return yscale(d);
        })
        .attr('fill',function(d,i){
            return colorScale(d);
        })



    // ******* TODO: PART II *******

    // Implement how the bars respond to click events
    // Color the selected bar to indicate it has been selected.
    // Make sure only the selected bar has this new color.

    // Call the necessary update functions for when a user clicks on a bar.
    // Note: think about what you want to update when a different bar is selected.

    bars.on("click", function(d,i){
        d3.select('#bars').selectAll('rect')
            .attr('fill',function(d,i){
                return colorScale(d);
            })
        d3.select(this)
            .attr('fill', 'red')
        updateInfo(19-i);
        updateMap(19-i);
    })

}

/**
 *  Check the drop-down box for the currently selected data type and update the bar chart accordingly.
 *
 *  There are 4 attributes that can be selected:
 *  goals, matches, attendance and teams.
 */
function chooseData(v) {

    console.log(v);
    
    // ******* TODO: PART I *******
    // Change the selected data when a user selects a different
    // menu item from the drop down.
    createBarChart(v);

}

/**
 * Update the info panel to show info about the currently selected world cup
 *
 * @param oneWorldCup the currently selected world cup
 */
function updateInfo(oneWorldCup) {

    // ******* TODO: PART III *******

    // Update the text elements in the infoBox to reflect:
    // World Cup Title, host, winner, runner_up, and all participating teams that year

    // Hint: For the list of teams, you can create an list element for each team.
    // Hint: Select the appropriate ids to update the text content.

    d3.select('#edition')
        .text(function(){
            return allWorldCupData[oneWorldCup].EDITION;
        })
    d3.select('#host')
        .text(function(){
            return allWorldCupData[oneWorldCup].host;
        })
    d3.select('#winner')
        .text(function(){
            return allWorldCupData[oneWorldCup].winner;
        })
    d3.select('#silver')
        .text(function(){
            return allWorldCupData[oneWorldCup].runner_up;
        })

    var teams= allWorldCupData[oneWorldCup].teams_names;
    var teamsContainer= document.getElementById('teams')
    teamsContainer.innerHTML="";
    for (var i=0;i<teams.length;i++){
        var item=document.createElement('li');
        item.appendChild(document.createTextNode(teams[i]));
        teamsContainer.appendChild(item);
    }

}

/**
 * Renders and updates the map and the highlights on top of it
 *
 * @param the json data with the shape of all countries
 */
function drawMap(world) {

    //(note that projection is global!
    // updateMap() will need it to add the winner/runner_up markers.)

    projection = d3.geoConicConformal().scale(150).translate([400, 350]);

    // ******* TODO: PART IV *******

    // Draw the background (country outlines; hint: use #map)
    // Make sure and add gridlines to the map

    // Hint: assign an id to each country path to make it easier to select afterwards
    // we suggest you use the variable in the data element's .id field to set the id

    // Make sure and give your paths the appropriate class (see the .css selectors at
    // the top of the provided html file)

    var svg=d3.select('#map');

    var path=d3.geoPath().projection(projection);
    var countries=topojson.feature(world,world.objects.countries).features;
    svg.selectAll(".countries")
        .data(countries)
        .enter()
        .append("path")
        .attr("class","countries")
        .attr("d",path)
        .attr("id",function(d,i){
            return countries[i].id;
        });
    var graticule=d3.geoGraticule();
    
    d3.select("#graticule")
        .append("path")
        .datum(graticule)
        .attr("class","grat")
        .attr("d",path);
}

/**
 * Clears the map
 */
function clearMap() {

    // ******* TODO: PART V*******
    //Clear the map of any colors/markers; You can do this with inline styling or by
    //defining a class style in styles.css

    //Hint: If you followed our suggestion of using classes to style
    //the colors and markers for hosts/teams/winners, you can use
    //d3 selection and .classed to set these classes on and off here.
    d3.select('#points').selectAll("circle")
        .remove();

}


/**
 * Update Map with info for a specific FIFA World Cup
 * @param the data for one specific world cup
 */
function updateMap(worldcupData) {

    //Clear any previous selections;
    clearMap();

    // ******* TODO: PART V *******

    // Add a marker for the winner and runner up to the map.

    //Hint: remember we have a conveniently labeled class called .winner
    // as well as a .silver. These have styling attributes for the two
    //markers.

    var path=d3.geoPath().projection(projection);
    const graticule=d3.geoGraticule();
    winner=allWorldCupData[worldcupData].win_pos;
    silver=allWorldCupData[worldcupData].ru_pos;
    d3.select('#points')
        .append('circle')
        .attr("cx",function(){
            return projection(winner)[0];
        })
        .attr("cy",function(){
            return projection(winner)[1];
        })
        .attr("r",8)
        .attr("class","gold");

    d3.select('#points')
        .append('circle')
        .attr("cx",function(){
            return projection(silver)[0];
        })
        .attr("cy",function(){
            return projection(silver)[1];
        })
        .attr("r",8)
        .attr("class","silver");

    
    //Select the host country and change it's color accordingly.

    //Iterate through all participating teams and change their color as well.

    //We strongly suggest using classes to style the selected countries.
    d3.select('#map').selectAll('path')
        .attr('class',function(d,i){
            var id=d3.select(this).attr('id')
            if(allWorldCupData[worldcupData].teams_iso.includes(id)){
                if(allWorldCupData[worldcupData].host_country_code==id){
                    return "host countries";
                }
                else{
                    return "team countries"
                }    
            }
            else{
                return "countries"
            }
        }
        )


}

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)
//Load in json data to make map

d3.json("data/world.json", function (error, world) {
    if (error) { 
        console.log(error);  //Log the error.
	throw error;
    }

    drawMap(world);
});


// Load CSV file
d3.csv("data/fifa-world-cup.csv", function (error, csv) {
    if (error) { 
        console.log(error);  //Log the error.
	throw error;
    }

    csv.forEach(function (d) {

        // Convert numeric values to 'numbers'
        d.year = +d.YEAR;
        d.teams = +d.TEAMS;
        d.matches = +d.MATCHES;
        d.goals = +d.GOALS;
        d.avg_goals = +d.AVERAGE_GOALS;
        d.attendance = +d.AVERAGE_ATTENDANCE;
        //Lat and Lons of gold and silver medals teams
        d.win_pos = [+d.WIN_LON, +d.WIN_LAT];
        d.ru_pos = [+d.RUP_LON, +d.RUP_LAT];

        //Break up lists into javascript arrays
        d.teams_iso = d3.csvParse(d.TEAM_LIST).columns;
        d.teams_names = d3.csvParse(d.TEAM_NAMES).columns;

    });

    // Store csv data in a global variable
    allWorldCupData = csv;
    // Draw the Bar chart for the first time
    createBarChart('attendance');

    console.log(allWorldCupData);
});
