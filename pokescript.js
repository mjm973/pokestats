// JavaScript source code

var typeURL = 'https://pokeapi.co/api/v2/type/';
var pokeStats = {
    cnv: undefined,
    start: true,
    load: false,
    counter: 0,
    dotCount: 0,
    sys: undefined,
    error: false
};

var testData = [
    [
        {
            stats: [
               { base_stat: 100 },
               { base_stat: 120 },
               { base_stat: 60 },
               { base_stat: 50 },
               { base_stat: 78 },
               { base_stat: 67 }
            ],
            height: 46,
            name: 'missingno'
        }
    ],
    [
        {
            stats: [
               { base_stat: 90 },
               { base_stat: 80 },
               { base_stat: 160 },
               { base_stat: 40 },
               { base_stat: 78 },
               { base_stat: 57 }
            ],
            height: 75,
            name: 'missingno2'
        }
    ],
     [
        {
            stats: [
               { base_stat: 120 },
               { base_stat: 20 },
               { base_stat: 40 },
               { base_stat: 50 },
               { base_stat: 103 },
               { base_stat: 23 }
            ],
            height: 146,
            name: 'missingno3'
        }
     ]
];

// Put somewhere in your scripting environment (to use when with an array of promises)
if (jQuery.when.all === undefined) {
    jQuery.when.all = function (deferreds) {
        var deferred = new jQuery.Deferred();
        $.when.apply(jQuery, deferreds).then(
            function () {
                deferred.resolve(Array.prototype.slice.call(arguments));
                console.log('Something resolved');
            },
            function () {
                deferred.reject(Array.prototype.slice.call(arguments));
                console.log('Something failed');
            });

        return deferred;
    };
}

// Function to capitalize strings using regex
String.prototype.capitalize = function (lower) {
    return (lower ? this.toLowerCase() : this).replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); }); //IGNORE
};

// End of borrowed code

function mapStat(string) {
    switch (string) {
        case 'HP':
            return 5;
        case 'Attack':
            return 4;
        case 'Defense':
            return 3;
        case 'Special Attack':
            return 2;
        case 'Special Defense':
            return 1;
        case 'Speed':
            return 0;
    }
}

function rescale() {
    var pokeData = pokeStats.data;
    pokeStats.xStat = mapStat($('#xstat').val());
    pokeStats.yStat = mapStat($('#ystat').val());

    pokeStats.w = $('#graph-area').width();
    pokeStats.h = $('#graph-area').height();

    pokeStats.xPadd = 0.1 * pokeStats.w;
    pokeStats.yPadd = 0.05 * pokeStats.h;

    var xMin = d3.min(pokeData, function (d) { return d[0].stats[pokeStats.xStat].base_stat; }); //IGNORE
    var xMax = d3.max(pokeData, function (d) { return d[0].stats[pokeStats.xStat].base_stat; }); //IGNORE
    pokeStats.xScale = d3.scaleLinear()
                .domain([0, xMax])
                .range([pokeStats.xPadd, pokeStats.w - pokeStats.xPadd]);
    pokeStats.xAxis = d3.axisBottom(pokeStats.xScale);

    var yMin = d3.min(pokeData, function (d) { return d[0].stats[pokeStats.yStat].base_stat; }); //IGNORE
    var yMax = d3.max(pokeData, function (d) { return d[0].stats[pokeStats.yStat].base_stat; }); //IGNORE
    pokeStats.yScale = d3.scaleLinear()
                .domain([yMax, 0])
                .range([pokeStats.yPadd, pokeStats.h - 2 * pokeStats.yPadd]);
    pokeStats.yAxis = d3.axisLeft(pokeStats.yScale);
}

function transitionGraph() {
    if (pokeStats.data === undefined) {
        return;
    }
    if (pokeStats.graph === undefined) {
        updateGraph();
    }

    rescale();

    pokeStats.graph.selectAll('g').remove();

    pokeStats.graph.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (pokeStats.h - 2 * pokeStats.yPadd) + ')')
        .call(pokeStats.xAxis);

    pokeStats.graph.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + pokeStats.xPadd + ', 0)')
        .call(pokeStats.yAxis);

    pokeStats.graph.selectAll('circle')
        .transition()
        .attr('cx', function (d) { return pokeStats.xScale(d[0].stats[pokeStats.xStat].base_stat); }) //IGNORE
        .attr('cy', function (d) { return pokeStats.yScale(d[0].stats[pokeStats.yStat].base_stat); }) //IGNORE
        .duration(2500);
}

function updateGraph() {
    $('#graph-area').html('');

    rescale();

    var pokeData = pokeStats.data;

    var rMin = d3.min(pokeData, function (d) { return d[0].height; });
    var rMax = d3.max(pokeData, function (d) { return d[0].height; });
    var rScale = d3.scaleLinear()
                .domain([rMin, rMax])
                .range([5, 20]);

    var graph = d3.select('#graph-area')
                .append('svg')
                .attr('width', pokeStats.w)
                .attr('height', pokeStats.h);

    graph.selectAll("circle")
        .data(pokeData)
        .enter()
        .append("circle")
        .attr('cx', pokeStats.xPadd) //IGNORE
        .attr('cy', pokeStats.h - 2 * pokeStats.yPadd) //IGNORE
        .attr('r', function (d) { return rScale(d[0].height); })
        .attr('class', 'datapoint ' + pokeStats.type)
        .on('mouseover', function (d) {
            console.log('mouseee');
            var info = d[0];
            var el = d3.select(this);
            var x = parseInt(el.attr('cx'));
            var y = parseInt(el.attr('cy'));
            var r = parseInt(el.attr('r'));
            var xStat = $('#xstat').val();
            var yStat = $('#ystat').val();
            console.log(x, y, xStat, yStat);

            var group = graph.append('g')
                .attr('class', 'selection');
            group.append('text')
                .attr('class', 'selection')
                .attr('x', x)
                .attr('y', y + r + 25)
                .text(info.name.capitalize());
            group.append('text')
                .attr('class', 'selection')
                .attr('x', x)
                .attr('y', y + r + 45)
                .text(xStat + ': ' + info.stats[mapStat(xStat)].base_stat);
            group.append('text')
                .attr('class', 'selection')
                .attr('x', x)
                .attr('y', y + r + 65)
                .text(yStat + ': ' + info.stats[mapStat(yStat)].base_stat); //IGNORE
        })
        .on('mouseout', function (d) {
            graph.selectAll('.selection')
                .remove();
        })
        .transition()
        .attr('cx', function (d) { return pokeStats.xScale(d[0].stats[pokeStats.xStat].base_stat); }) //IGNORE
        .attr('cy', function (d) { return pokeStats.yScale(d[0].stats[pokeStats.yStat].base_stat); }) //IGNORE
        .duration(2500)
        .delay(500)
    ;

    graph.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (pokeStats.h - 2 * pokeStats.yPadd) + ')')
        .call(pokeStats.xAxis)
        .append('text');

    graph.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(' + pokeStats.xPadd + ', 0)')
        .call(pokeStats.yAxis);

    pokeStats.graph = graph;
}

function searchPoke(pokes) {
    if (pokes.length === undefined) {
        console.log('ERROR');
        return;
    }

    var promises = [];
    for (var q = 0; q < pokes.length; ++q) {
        var promise = $.ajax({
            url: pokes[q].pokemon.url,
            type: 'GET',
            dataType: 'json'
        });

        promises.push(promise);
    }

    console.log('Promises ready');

    $.when.all(promises).then(function (results) {
        console.log('We are here');
        pokeStats.data = results;
        console.log(pokeStats.data);
        //hideCanvas();
        pokeStats.start = true;
        pokeStats.load = false;
        updateGraph();
    }, function (err) {
        console.log('Something is not working :c');
        console.log(err);
        pokeStats.error = true;
    })

}

function searchType(ptype) {
    if (ptype === 'test') {
        pokeStats.type = 'normal';
        pokeStats.data = testData;
        updateGraph();
    } else {
        pokeStats.type = ptype.toLowerCase();
        var req = typeURL + pokeStats.type + '/';
        $.ajax({
            url: req,
            type: 'GET',
            dataType: 'json',
            error: function (err) {
                console.log('Oh crap!');
                console.log(err);
                pokeStats.error = true;
            },
            success: function (data) {
                console.log('YAAY');
                console.log(data);
                var pokelist = data.pokemon;

                searchPoke(pokelist);
            }
        });
    }
}

function hideCanvas(again = true) {
    clear();
    pokeStats.cnv.style('z-index', '-1');
    noLoop();

    if (pokeStats.sys.trail !== undefined) {
        pokeStats.sys.trail = [];
    }

    if (again) {
        hideCanvas(false);
    }
}

    function showCanvas() {
        pokeStats.cnv.style('z-index', '1');
        loop();
    }

    function Trail(_x, _y, _s, _l) {
        this.x = _x;
        this.y = _y;
        this.scale = _s;
        this.life = _l;
        this.inLife = _l;

        this.draw = function() {
            stroke(0, map(this.life, this.inLife, 0, 255, 0));
            this.scale = map(this.life, this.inLife, 0, 0.4, 0.2);
            pokeball(this.x, this.y, this.scale, 0);
            --this.life;
        }
    }

    function TrailSys() {
        this.trail = [];

        this.draw = function() {
            if (frameCount%2 === 0) {
                this.trail.push(new Trail(pmouseX, pmouseY, 0.4, 30));
            }

            for (var q = this.trail.length-1; q >= 0; --q) {
                var t = this.trail[q];
                t.draw();

                if (t.life <= 0) {
                    this.trail.splice(q, 1);
                }
            }
        }     
        
    }

    function pokeball(_x, _y, _s, _a) {
        push();
        translate(_x, _y);
        rotate(_a/10);
        scale(_s);

        noFill();
        strokeWeight(5);

        ellipse(0, 0, 100, 100);
        ellipse(0, 0, 50, 50);
        line(-50, 0, -25, 0);
        line(25, 0, 50, 0);
        pop();

        strokeWeight(1);
    }

    function loadScreen() {
        clear();
        noStroke();
        fill(255, 155);
        rect(0, 0, width, height);

        if (frameCount%30 === 0) {
            pokeStats.dotCount = (pokeStats.dotCount+1)%4;
        }

        fill(0);
        textSize(42);
        textAlign(CENTER, CENTER);
        var txt;
        switch (pokeStats.dotCount) {
            case 0:
                txt = '   ';
                break;
            case 1:
                txt = '.  ';
                break;
            case 2:
                txt = '.. ';
                break;
            case 3:
                txt = '...';
                break;
        }
        text('Loading' + txt + ' \nPlease wait', width / 2, height / 2);

        stroke(0);
        pokeball(width/2, height/2 - 120, 1, pokeStats.counter);

        pokeball(mouseX, mouseY, 0.4, 0);

        pokeStats.sys.draw();
    }

    function errorScreen() {
        clear();
        noStroke();
        fill(255, 155);
        rect(0, 0, width, height);

        
        fill(0);
        textSize(42);
        textAlign(CENTER, CENTER);

        text("Oops! Something's not right... \nPlease refresh and try agin. :c", width / 2, height / 2);

        stroke(0);
        pokeball(mouseX, mouseY, 0.4, 0);
        pokeStats.sys.draw();
    }

    function setup() {
        pokeStats.cnv = createCanvas(windowWidth, windowHeight);
        pokeStats.cnv.position(0, 0);
        pokeStats.cnv.style("position: absolute;")

        pokeStats.sys = new TrailSys();

        clear();
        noLoop();
    }

    function draw() {
        if (pokeStats.start) {
            hideCanvas();
            pokeStats.start = false;
        } else {
            if (!pokeStats.error) {
                loadScreen();
            } else {
                errorScreen();
            }
        }
        ++pokeStats.counter;
    }

    function windowResized() {
        resizeCanvas(windowWidth, windowHeight);
    }

    $(document).ready(function () {
        //searchType('test');

        $('.axis-val').change(function () {
            console.log('change');
            transitionGraph();
        });

        $('#poketype').change(function () {
            var search = $('#poketype').val();
            if (search !== 'Choose...') {
                showCanvas();
                pokeStats.load = true;
                searchType(search);
            }
        });

        $(window).resize(function () {
            transitionGraph();
            //pokeStats.start = !pokeStats.load;
        });
    });


