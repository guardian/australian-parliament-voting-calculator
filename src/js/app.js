// javascript goes here

import * as d3 from "d3"
import Stickyfill from 'stickyfilljs'

function init(data,type) {

	console.log("data", data, "type", type)
	var forCol = d3.select("#forCol")
	var againstCol = d3.select("#againstCol")
	var undecidedCol = d3.select("#undecidedCol")
	
	// var forVoteCountText = d3.select("#ForVoteCount")
	// var againstVoteCountText = d3.select("#AgainstVoteCount")
	// var undecidedVoteCountText = d3.select("#UndecidedVoteCount")

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

	var margin = {top: 20, right: 2, bottom: 20, left:leftMar};	
	width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;
    
    d3.select("#votingChart svg").remove()

    var svg = d3.select("#votingChart").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.attr("id", "svg")
				.attr("overflow", "hidden");					

	var features = svg.append("g")
					.attr("id", "features")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	
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

	if (type == 'lowerhouse') {
		max = 86
		majority = 76
	}

	else {
		max = 45
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

    features.selectAll(".barLabel")
        .data(nullData, function(d) { return d.key })
      .enter().append("text")
        .attr("class", function(d) { return "barLabel  " + d.key })
        .attr("fill", function(d) { 
        		if (x(d.value) >= 15 ) {
        			return "#FFFFFF"
        		}

        		else {
        			return "#000000"
        		}
        	})
        .attr("x", function(d) { return x(d.value) - 10})
        .attr("y", function(d) { return y(d.key) + y.bandwidth()/2 + 6; })
        .attr("text-anchor", function(d) { 
        		if (x(d.value) >= 15 ) {
        			return "end"
        		}

        		else {
        			return "start"
        		}
        	})
        .text(function(d) { return d.value })
 

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
    	.text(function() { 

    		if (type == 'lowerhouse') {
				return "76 votes for majority"
			}

			else {
				return "39 votes for majority"
			}
    		
    	})

	function updateChart(chartData, houseType) {

		var grouped = d3.nest()
			.key(function(d) { return d.status; })
			.rollup(function(v) { return d3.sum(v, function(d) {return d.votes;}); })
			.entries(chartData)

		console.log(grouped)
		console.log(checkZero(grouped))	

		grouped = checkZero(grouped);
		
		var getMax = d3.max(grouped, function(d) { return d.value; })

		console.log(getMax);


		if (houseType == 'lowerhouse') {
			max = 86
		}

		else {
			max = 45
		}

		if (getMax > max) {
			max = getMax
		}

		x.domain([0, max])
		
		grouped.sort(function (a, b) {
			return voteTypes.indexOf(a.key) - voteTypes.indexOf(b.key)
		})

		var updateBars = features.selectAll(".bar").data(grouped, function(d) { return d.key; })
		var updateLabels = features.selectAll(".barLabel").data(grouped, function(d) { return d.key; })

		updateBars.transition("blah")
					.attr("width", function(d) { return x(d.value); })

		updateLabels.text(function(d) { return d.value; })
		updateLabels.transition()
				.attr("x", function(d) { 

					if (x(d.value) >= 15 ) {
	        			return x(d.value) - 5;
	        		}

	        		else {
	        			return x(d.value) + 5;
	        		}
				})
				.attr("fill", function(d) { 
	        		if (x(d.value) >= 15 ) {
	        			return "#FFFFFF"
	        		}

	        		else {
	        			return "#000000"
	        		}
        		})
        		.attr("text-anchor", function(d) { 
	        		if (x(d.value) >= 15 ) {
	        			return "end"
	        		}

	        		else {
	        			return "start"
	        		}
        		})


		d3.select("#majorityLine")
			.transition()
			.attr("x1", x(majority))
	    	.attr("x2", x(majority))

	    d3.select("#majorityText")
	    	.transition()
	    	.attr("x", x(majority))


	    var outcomeText = "UNKNOWN"

	    grouped.forEach(function(d) {

	    	d3.select("#" + d.key + "VoteCount").text(d.value)

	   		if (d.key === 'For') {
	   			if (d.value >= majority) {
	   				outcomeText = "PASSED"
	   			}
	   		}

	   		if (d.key === 'Against') {

	   			if (d.value >= (majority - 1)) {
	   				outcomeText = "BLOCKED"
	   			}
	   			
	   		}

	    })	

	    d3.select("#outcomeText").text(outcomeText).attr("class", outcomeText)

		
	}



	updateChart(data,type)
	console.log(data)

	// Set up blocs

	d3.select("#ForContainer").html("")
	d3.select("#AgainstContainer").html("")
	d3.select("#UndecidedContainer").html("")

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

	function checkZero(obj) {
		
		var keysInThing = []
		obj.forEach(function(d) {
			keysInThing.push(d.key)
		})

		voteTypes.forEach(function (voteType) {
			if (!keysInThing.includes(voteType)) {
			console.log("does not conatin " + voteType)
				obj.push({key: voteType, value:0})
			}
		})
		
		return obj

	}
	

	function resizeChart() {
			console.log("resize!")
			width = document.querySelector("#votingChart").getBoundingClientRect().width
			height = 300
			leftMar = 150
			if (width  < 500) {
				height = 200
				leftMar = 100
			}

			margin.left = leftMar
			width = width - margin.left - margin.right,
		    height = height - margin.top - margin.bottom;

		    x.range([0, width])
			y.range([height, 0])
			
			svg.transition()
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)

			features
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")	

			features.selectAll(".bar")
				.transition("resize")
				.attr("height", y.bandwidth())
        		.attr("y", function(d) { return y(d.key); })	

        	features.selectAll(".barLabel")
				.transition("resize")
				.attr("y", function(d) { return y(d.key) + y.bandwidth()/2 + 6; })

			features.select(".y")
				.call(d3.axisLeft(y))	

			updateChart(data,type)

	}

	var to=null
	var lastWidth = document.querySelector("#votingChart").getBoundingClientRect()
	window.addEventListener('resize', function() {
		var thisWidth = document.querySelector("#votingChart").getBoundingClientRect()
		
		if (lastWidth != thisWidth) {
			
			window.clearTimeout(to);

			to = window.setTimeout(function() {
			    
				resizeChart()

			}, 200)
		}
	})

}


Promise.all([
	d3.json('<%= path %>/assets/1dbPgKKX_K6_jk8SISUdIPAvzKD_2s6tJtVn18JnZMio.json')	
	// d3.json('https://interactive.guim.co.uk/docsdata/1dbPgKKX_K6_jk8SISUdIPAvzKD_2s6tJtVn18JnZMio.json')
])
.then((results) =>  {
	console.log(results)
	init(results[0].sheets.lowerhouse,'lowerhouse')

	d3.select("#selectHouse").on("change", selectHouse)
	d3.select("#resetChart").on("click", selectHouse)

	function selectHouse() {
		var selectValue = d3.select("#selectHouse").property('value')
		console.log(selectValue)
		init(results[0].sheets[selectValue],selectValue)
	}



});