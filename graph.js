
function myGraph(el) {
    // Add and remove elements on the graph object
    this.addNode = function (id) {
        nodes.push({"id":id, "x": 0, "y": 0});
        update();
    }

    this.removeNode = function (id) {
        var i = 0;
        var n = findNode(id);
        while (i < links.length) {
            if ((links[i]['source'] === n)||(links[i]['target'] == n)) links.splice(i,1);
            else i++;
        }
        var index = findNodeIndex(id);
        if(index !== undefined) {
            nodes.splice(index, 1);
            update();
        }
    }
    
    this.getNodes = function() {
	return nodes;
    }
    
    this.addLink = function (sourceId, targetId) {
        var sourceNode = findNode(sourceId);
        var targetNode = findNode(targetId);

        if((sourceNode !== undefined) && (targetNode !== undefined)) {
            links.push({"source": sourceNode, "target": targetNode});
            update();
        }
    }

    var findNode = function (id) {
        for (var i=0; i < nodes.length; i++) {
            if (nodes[i].id === id)
                return nodes[i]
        };
    }

    var findNodeIndex = function (id) {
        for (var i=0; i < nodes.length; i++) {
            if (nodes[i].id === id)
                return i
        };
    }

    // set up the D3 visualisation in the specified element
    //var width = $(el).innerWidth(),
    //height = $(el).innerHeight();
    var width = 700;
    var height = 700;

    var vis = this.vis = d3.select(el).append("svg")
        .attr("width", width)
        .attr("height", height);

    var simulation = d3.forceSimulation()
	.force("link", d3.forceLink().id(function(d) { return d.id; }).distance(75))
	.force("charge", d3.forceManyBody().strength(-300))
	//.force("center", d3.forceCenter(width / 2, height / 2));
    	.force("x", d3.forceX(width/2))
    	.force("y", d3.forceY(height/2));

    var nodes = [];
    var links = [];
    
    var update = function () {
	var link = vis.selectAll("line.link")
            .data(links, function(d) { return d.source.id + "-" + d.target.id; });

	var linkEnter = link.enter().append("line").attr("class", "link")
	    .attr("stroke-width", 2);
	    
	link.exit().remove();
	link = linkEnter.merge(link);

        var node = vis.selectAll("g.node")
            .data(nodes, function(d) { return d.id;});
	
        var nodeEnter = node.enter().append("g")
            .attr("class", "node");
	
        nodeEnter.append("circle")
            .attr("class", "circle")
	    .attr("r", "15")
	    .call(d3.drag()
		  .on("start", dragstarted)
		  .on("drag", dragged)
		  .on("end", dragended));

        nodeEnter.append("text")
            .attr("class", "nodetext")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function(d) {return d.id});
	
	node.exit().remove();
	node = nodeEnter.merge(node);
        
        simulation.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; })
	    // Transforming the gstate is the elegant approach.
	    // Unfortunately, there is a problem when dragging.
            //node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	    node.selectAll(".circle").attr("cx", function(d) { return d.x; }).attr("cy", function(d) { return d.y; });
	    node.selectAll(".nodetext").attr("x", function(d) { return d.x+5; }).attr("y", function(d) { return d.y; });
        });

	simulation.nodes(nodes);
	simulation.force("link").links(links);
	simulation.alpha(1).restart();
        // Restart the force layout.
        //force.start();
    }

    var dragstarted = function(d) {
	if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	d.fx = d.x;
	d.fy = d.y;
    }

    var dragged = function(d) {
	d.fx = d3.event.x;
	d.fy = d3.event.y;
    }

    var dragended = function(d) {
	if (!d3.event.active) simulation.alphaTarget(0);
	d.fx = null;
	d.fy = null;
    }

    // Make it all go
    update();
}

graph = new myGraph("div.graph");
//graph.addNode("A");
//graph.addNode("B");
//graph.addLink("A", "B");
//graph.addNode("C");

var network = {};
var currinput = [];
var searchselect;

function networkchunk(line, parser) {
    console.log(line.errors);
    // if (line.errors.length > 0) {
    // 	console.log(line.errors);
    // }
    // else {
    // 	var v = line.data;
    // 	if (network[v.source] != null) {
    // 	    network[v.source].push(v.target);
    // 	}
    // 	else {
    // 	    network[v.source] = [v.target];
    // 	}
    // 	if (network[v.target] != null) {
    // 	    network[v.target].push(v.source);
    // 	}
    // 	else {
    // 	    network[v.target] = [v.source];
    // 	}
    // }
}

function networkcomplete(results) {
    if (results.errors.length > 0) {
	console.log(results.errors);
    }
    else {
	var data = results.data;
	for (var i = 0; i < data.length; i++) {
	    var v = data[i];
	    if (network[v.source] != null) {
		network[v.source].push(v.target);
	    }
	    else {
		network[v.source] = [v.target];
	    }
	    if (network[v.target] != null) {
		network[v.target].push(v.source);
	    }
	    else {
		network[v.target] = [v.source];
	    }
	}
	var genes = Object.keys(network);
	var options = [];
	for (var i = 0; i < genes.length; i++) {
	    options.push({"id": i, "title": genes[i]});
	}
	searchselect = $('#select-box').selectize({
	    maxItems: null,
	    maxOptions: 10,
	    valueField: 'id',
	    labelField: 'title',
	    searchField: 'title',
	    sortField: 'title',
	    options: options,
	    create: false,
	    onChange: function(id) {
		currinput = [];
		for (var i = 0; i < id.length; i++) {
		    currinput.push(this.options[id[i]].title);
		}
	    }});
	d3.select("#loader-txt").remove();
    }
}
 
function readnetwork(filename) {
    //d3.tsv(filename, function(data) {
    Papa.parse(filename, {
	download: true,
	delimiter: "\t",
	worker: false,
	header: true,
	complete: networkcomplete
    });
}

jQuery(document).ready(function($){
    readnetwork("data/string_nolit_lowconfidence_network.tsv");
    //readnetwork("data/little_network.tsv");
});


function getedgesfromnetwork(network, genes) {
    var v = [];
    var vv = [];
    for (var i = 0; i < genes.length; i++) {
	var g = genes[i];
	v.push({"id": g});
	var e = network[g];
	for (var j = 0; j < e.length; j++) {
	    if (genes.includes(e[j])) {
		vv.push({"source": g, "target": e[j]});
	    }
	}
    }
    return {"nodes": v, "edges": vv};
}


// var letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV';
// var options = [];
// for (var i = 0; i < 25000; i++) {
//     var title = [];
//     for (var j = 0; j < 8; j++) {
//         title.push(letters.charAt(Math.round((letters.length - 1) * Math.random())));
//     }
//     options.push({
//         id: i,
//         title: title.join('')
//     });
// }

var geneListBox = d3.select(".results-list");
//updateGeneListBox();

function updateGeneListBox() {
    // Update list
    var boxItems = geneListBox.selectAll("option").data(graph.getNodes(), function(d) { return d.id; });
    var boxItemsEnter = boxItems.enter().append("option").text(function(d) { return d.id; });
    boxItems.exit().remove();
    boxItemsEnter.merge(boxItems);
}

function addButtonClicked() {
    var currnodes = graph.getNodes().slice();
    for (var i = 0; i < currinput.length; i++) {
	var me = currinput[i];
	graph.addNode(me);
	var partners = network[me];
	for (var j = 0; j < partners.length; j++) {
	    var n = partners[j];
	    for (var k = 0; k < currnodes.length; k++) {
	 	if (n == currnodes[k].id) {
	 	    graph.addLink(me, n);
	 	}
	    }
	}
	currnodes.push({"id": me});
    }
    searchselect[0].selectize.clear();
    updateGeneListBox();
}

function removeButtonClicked() {
    var rl = $(".results-list option");
    for (var i = 0; i < rl.length; i++) {
	var v = rl[i]
	if (v.selected) {
	    graph.removeNode(v.text);
	}
    }
    updateGeneListBox();
}
