/*globals alert, document, d3, console*/
// These keep JSHint quiet if you're using it

function staircase() {
    // ****** TODO: PART II ******
    var rects= document.getElementById("stairs").getElementsByTagName("rect");
    var sorted=false;
    while(sorted==false){
        sorted=true;
        for(i=1;i<rects.length; i++){
            w2=parseInt(rects[i].getAttribute("width"));
            w1=parseInt(rects[i-1].getAttribute("width"));
            if(w2<w1){
                rects[i].setAttribute("width",w1);
                rects[i-1].setAttribute("width",w2);
                sorted=false;
            }
        }
        
    }
    document.getElementById("transStair").setAttribute("transform", "translate(0, 200)scale(1,-10)");
    for(i=0;i<rects.length;i++){
        size=parseInt(rects[i].getAttribute("width"));
        rects[i].setAttribute("width",15);
        rects[i].setAttribute("height",size);
        rects[i].setAttribute("x",rects[i].getAttribute("y"));
        rects[i].setAttribute("y",0);
    }
}

function update(data) {
    // D3 loads all CSV data as strings;
    // while Javascript is pretty smart
    // about interpreting strings as
    // numbers when you do things like
    // multiplication, it will still
    // treat them as strings where it makes
    // sense (e.g. adding strings will
    // concatenate them, not add the values
    // together, or comparing strings
    // will do string comparison, not
    // numeric comparison).

    // We need to explicitly convert values
    // to numbers so that comparisons work
    // when we call d3.max()
    data.forEach(function (d) {
        d.a = parseInt(d.a);
        d.b = parseFloat(d.b);
    });

    // Set up the scales
    var aScale = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.a;
        })])
        .range([0, 150]);
    var bScale = d3.scale.linear()
        .domain([0, d3.max(data, function (d) {
            return d.b;
        })])
        .range([0, 150]);
    var iScale = d3.scale.linear()
        .domain([0, data.length])
        .range([0, 110]);

    // ****** TODO: PART III (you will also edit in PART V) ******

    // TODO: Select and update the 'a' bar chart bars

    // TODO: Select and update the 'b' bar chart bars

    // TODO: Select and update the 'a' line chart path using this line generator
    var aLineGenerator = d3.svg.line()
        .x(function (d, i) {
            return iScale(i);
        })
        .y(function (d) {
            return aScale(d.a);
        });

    // TODO: Select and update the 'b' line chart path (create your own generator)

    // TODO: Select and update the 'a' area chart path using this line generator
    var aAreaGenerator = d3.svg.area()
        .x(function (d, i) {
            return iScale(i);
        })
        .y0(0)
        .y1(function (d) {
            return aScale(d.a);
        });

    // TODO: Select and update the 'b' area chart path (create your own generator)

    // TODO: Select and update the scatterplot points

    // ****** TODO: PART IV ******
}

function changeData() {
    // // Load the file indicated by the select menu
    
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        randomSubset();
    }
    else{
        var route= 'data/'+dataFile+'.csv';
        d3.csv(route,update);
    }
}

function randomSubset() {
    // Load the file indicated by the select menu,
    // and then slice out a random chunk before
    // passing the data to update()
    var dataFile = document.getElementById('dataset').value;
    if (document.getElementById('random').checked) {
        d3.csv('data/' + dataFile + '.csv', function (data) {
            var subset = [];
            //console.log(data);
            data.forEach(function (d) {
                if (Math.random() > 0.5) {
                    subset.push(d);
                }
            });
            update(subset);
        });
    }
    else{
        changeData();
    }
}