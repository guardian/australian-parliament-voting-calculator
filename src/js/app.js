// javascript goes here

import * as d3 from "d3"
import Stickyfill from 'stickyfilljs'

function init(data,type) {

	var forCol = d3.select("#forCol")
	var againstCol = d3.select("#againstCol")
	var undecidedCol = d3.select("#undecidedCol")
	
	var elements = document.querySelectorAll('.sticky');
	Stickyfill.add(elements);

	// Set up variable statuses from the defaults

	data.forEach(function(d) {
		d.status = d.default
		d.votes = +d.votes
		d.id = cleanName(d.bloc)
	})

	var isMobile

	var windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

	if (windowWidth < 610) {
			isMobile = true;
	}	

	if (windowWidth >= 610){
			isMobile = false;
	}

	var width = document.querySelector("#votingChart").getBoundingClientRect().width
	var height = 300
	var leftMar = 150
	if (width  < 500) {
		height = 200
		leftMar = 100
	}

	var margin = {top: 20, right: 0, bottom: 20, left:leftMar};	
	width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;
    
    d3.select("#votingChart svg").remove()

    var svg = d3.select("#votingChart").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.attr("id", "svg")
				.attr("overflow", "hidden");					

	var features = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	
	var voteTypes = ["Undecided","Against","For"]
	var nullData = [
		{key: "Undecided", value:0},
		{key: "Against", value:0},
		{key: "For", value:0}
	]
	var x = d3.scaleLinear().range([0, width]);
	var y = d3.scaleBand().range([height, 0]);
	y.domain(voteTypes).padding(0.1);

	var max
	var majority

	if (type == 'house') {
		max = 90
		majority = 76
	}

	else {
		max = 40
		majority = 39
	}

	x.domain([0, max]);

	// features.append("g")
 //        .attr("class", "x axis")
 //       	.attr("transform", "translate(0," + height + ")")
 //      	.call(d3.axisBottom(x));

    features.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    features.selectAll(".bar")
        .data(nullData, function(d) { return d.key })
      .enter().append("rect")
        .attr("class", function(d) { return "bar " + d.key })
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("y", function(d) { return y(d.key); })
        .attr("width", function(d) { return x(d.value); })

    features.append("line")
    	.attr("id", "majorityLine")
    	.attr("x1", x(majority))
    	.attr("x2", x(majority))
    	.attr("y1", 0)
    	.attr("y2", height)
    	.attr("width",2)
    	.attr("stroke", "black")
    	.attr("stroke-dasharray", 4)

    features.append("text")
    	.attr("id", "majorityText")
    	.attr("class", "label")
    	.attr("x", x(majority))
    	.attr("y", -10)
    	.attr("text-anchor", "middle")
    	.text("76 votes for majority")

	function updateChart(chartData, houseType) {

		var grouped = d3.nest()
			.key(function(d) { return d.status; })
			.rollup(function(v) { return d3.sum(v, function(d) {return d.votes;}); })
			.entries(chartData)

		console.log(grouped)	

		var getMax = d3.max(grouped, function(d) { return d.value; })

		console.log(getMax);
		if (houseType == 'house') {
			max = 90
		}

		else {
			max = 40
		}

		if (getMax > max) {
			max = getMax
		}

		x.domain([0, max])
		
		grouped.sort(function (a, b) {
			return voteTypes.indexOf(a.key) - voteTypes.indexOf(b.key)
		})

		var updateBars = features.selectAll(".bar").data(grouped, function(d) { return d.key; })

		updateBars.transition().attr("width", function(d) { return x(d.value); })
		
		d3.select("#majorityLine")
			.transition()
			.attr("x1", x(majority))
	    	.attr("x2", x(majority))
		
	}



	updateChart(data,type)
	console.log(data)

	// Set up blocs

	data.forEach(function(bloc, i) {
		var cont = d3.select("#" + bloc.status + "Container")

		var blocDiv = cont.append("div")
						.attr("class", "votingBloc")
						.attr("id", bloc.id + "-bloc")

		blocDiv.append("div")
			.html(bloc.bloc + "  <span class='voteCount'>" + String(bloc.votes) + "</span")		
			.attr("class", "blocTitle")		

		blocDiv.append("div")		
			.attr("class", "buttonsWrapper")
			.attr("id", bloc.id + "-buttons")
			.html("<span class='btn For' data-votetype='For'>for</span> <span class='btn Against' data-votetype='Against'>against</span> <span class='btn Undecided' data-votetype='Undecided'>undecided</span>") 

		cont.selectAll(".btn." + bloc.status).classed("active",true)	

	})

	d3.selectAll("#votingColWrapper .btn").on("click", changeStatus)

	function changeStatus() {
		var button = d3.select(this)
		var newStatus = button._groups["0"]["0"].dataset.votetype
		var blocID = button._groups["0"]["0"].parentNode.id.split("-")[0] 
		console.log("#" + blocID + "-bloc .btn." +  newStatus.toLowerCase())
		d3.selectAll("#" + blocID + "-bloc .btn").classed("active",false)
		d3.select("#" + blocID + "-bloc .btn." +  newStatus).classed("active",true)
		console.log(blocID, newStatus)

		var currentBloc = document.getElementById(blocID + "-bloc")
		var newColumn = document.getElementById(newStatus + "Container")
		newColumn.appendChild(currentBloc)

		data.forEach(function(d, i) {
			if (d.id === blocID) {
				d.status = newStatus
			}
		})

		console.log("edited data",data)
		updateChart(data,type)		

	}

	function cleanName(str) {
		return str.replace(/ /g,"_").replace("(","").replace(")","")
	}



	

	function resizeChart() {
	
	}


	// function updateBloc(bloc) {
	// 	this = bloc
	// }

}



Promise.all([
	d3.json('<%= path %>/assets/1dbPgKKX_K6_jk8SISUdIPAvzKD_2s6tJtVn18JnZMio.json')	
	// d3.json('https://interactive.guim.co.uk/docsdata/1dbPgKKX_K6_jk8SISUdIPAvzKD_2s6tJtVn18JnZMio.json')
])
.then((results) =>  {
	init(results[0].sheets.lowerhouse,'house')
});