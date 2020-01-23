//Game of Life App

var generation = 0;

var gridCols;
var gridRows;
var grid;
var cDraw = 0;
var drawDelay = 5;
var res = 20;
var canvas;
var cWidth = 600;
var cHeight = 400;
var cellSize;

var last;
var boot = true;
var speedCalled = false;
var paused = true;
var allowRepeat = false;

var endOfGen = false;

function setup() {
	canvas = createCanvas(cWidth, cHeight);
	canvas.parent("cell_canvas");
	gridCols = round(width / res);
	gridRows = round(height / res);
	cellSize = cHeight / gridRows;

	grid = gridCreate(gridCols, gridRows);
	if (boot) {
		boot = false;
		handlers.init();
		gridFillRandom(gridCols, gridRows);
	}
}

function gridCreate(cols, rows) {
	var arr = new Array(cols);
	for (var i = 0; i < arr.length; i++) {
		arr[i] = new Array(rows);
		for (var j = 0; j < arr[i].length; j++) {
			arr[i][j] = CELL_DEAD;
		}
	}
	return arr;
}

function gridFillRandom(cols, rows) {
	for (var i = 0; i < cols; i++) {
		for (var j = 0; j < rows; j++) {
			var rand = Math.floor(Math.random() * 2);
			if (rand == 1) {
				grid[i][j] = CELL_ALIVE;
			} else {
				grid[i][j] = CELL_DEAD;
			}
		}
	}
}

function draw() {
	background(0);
	cDraw++;

	for (var i = 0; i < gridCols; i++) {
    	for (var j = 0; j < gridRows; j++) {
      		var x = i * res;
      		var y = j * res;
      		if (grid[i][j] == 1) {
        		fill(255);
        		stroke(0);
        		rect(x, y, res - 1, res - 1);
      		}
    	}
  	}

	if (cDraw >= drawDelay && !paused && !endOfGen) {
		cDraw = 0;
	  	var next = gridCreate(gridCols, gridRows);

	  	//Count Live neighbors
	  	for (var i = 0; i < gridCols; i++) {
	    	for (var j = 0; j < gridRows; j++) {
	    		var state = grid[i][j];
	      		var neighbors = countNeighbors(grid, i, j);

	      		//Rules
	      		if (state == 0 && neighbors == 3) {
	      			next[i][j] = CELL_ALIVE;
	      		} else if (state == 1 && (neighbors < 2 || neighbors > 3)) {
	      			next[i][j] = CELL_DEAD;
	      		} else {
	      			next[i][j] = state;
	      		}
	    	}
	  	}
	  	analyzePattern(grid, next);
	  	last = grid;
		grid = next;

		generation++;
	}
	document.getElementById("genDisp").innerHTML = generation;
	document.getElementById("inputSpeed").value = drawDelay;
}

function countNeighbors(grid, x, y) {
	sum = 0;
	for (var i = -1; i < 2; i++) {
		for (var j = -1; j < 2; j++) {
			var cols = (x + i + gridCols) % gridCols;
			var rows = (y + j + gridRows) % gridRows;
			sum += grid[cols][rows];
		}
	}
	sum -= grid[x][y];
	return sum;
}

function changeDim() {
	var h = document.getElementById("inputDim").value;
	setDim(h);
	paused = true;
}

function setDim(dim) {
	h = dim;
	if (h >= 3 && h <= 200) {
		if (h >= 100) {
			handlers.errorHandler("Dimensions above 100 will use a lot of processing power!", "warn");
			msg.send("Dimensions above 100 will use a lot of processing power!");
		}
		h = floor(cHeight / dim);
		res = h;
		boot = true;
		setup();
	} else {
		handlers.errorHandler("Invalid Dimension on setDim(" + dim + ")!");
	}
}

function gridStart() {
	if (paused) {
		paused = false;
	} else {
		paused = true;
	}
}

function gridClear() {
	setup();
	paused = true;
	generation = 0;
	msg.clear();
}

function gridRandomize(isBoot = false) {
	setup();
	gridClear();
	paused = true;
	gridFillRandom(gridCols, gridRows);
}

function changeSpeed() {
	var newSpd = document.getElementById("inputSpeed").value;
	if (newSpd >= 0 || newSpd == "") {
		drawDelay = newSpd;
	} else {
		handlers.errorHandler("Invalid Speed on changeSpeed(" + newSpd + ")!");
	}
}

function switchCell(i, j) {
	if (grid[i][j] == CELL_ALIVE) {
		grid[i][j] = CELL_DEAD;
	} else {
		grid[i][j] = CELL_ALIVE;
	}
}

var msg = {
	send: function(msgs) {
		document.getElementById("msgService").innerHTML = msgs;
	},

	clear: function() {
		document.getElementById("msgService").innerHTML = "";
	}
}

var handlers = {
	mousedown: false,
    lastX: 0,
    lastY: 0,

    init: function() {
    	setTimeout(function(){
    		var c = document.getElementById("cell_canvas");
			handlers.registerEvent(c, 'mousedown', handlers.canvasMouseDown, false);
	        handlers.registerEvent(document, 'mouseup', handlers.canvasMouseUp, false);
	        handlers.registerEvent(c, 'mousemove', handlers.canvasMouseMove, false);
    	}, 5);
    },

    errorHandler: function(e = "Unknown Error", t = "error") {
		if (t == "log") console.log(e);
		if (t == "info") console.info("INFO: " + e);
		if (t == "warn") console.warn("WARN: " + e);
		if (t == "error") console.error("ERROR: " + e);
	},

  	canvasMouseDown: function(event) {
        var position = handlers.mousePosition(event);
        switchCell(position[0], position[1]);
        handlers.lastX = position[0];
        handlers.lastY = position[1];
        handlers.mouseDown = true;
  	},

  	canvasMouseUp: function() {
    	handlers.mouseDown = false;
  	},

  	canvasMouseMove: function(event) {
    	if (handlers.mouseDown) {
      		var position = handlers.mousePosition(event);
      		if ((position[0] !== handlers.lastX) || (position[1] !== handlers.lastY)) {
	            switchCell(position[0], position[1]);
	            handlers.lastX = position[0];
	            handlers.lastY = position[1];
      		}
    	}
  	},

  	mousePosition: function (e) {
        var event, x, y, domObject, posx = 0, posy = 0, top = 0, left = 0;

        event = e;
        if (!event) {
          	event = window.event;
        }
      
        if (event.pageX || event.pageY) 	{
          	posx = event.pageX;
          	posy = event.pageY;
        } else if (event.clientX || event.clientY) 	{
          	posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
          	posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        domObject = event.target || event.srcElement;

        while ( domObject.offsetParent ) {
          	left += domObject.offsetLeft;
          	top += domObject.offsetTop;
          	domObject = domObject.offsetParent;
        }

        domObject.pageTop = top;
        domObject.pageLeft = left;

        x = Math.ceil(((posx - domObject.pageLeft)/cellSize) - 1);
        y = Math.ceil(((posy - domObject.pageTop)/cellSize) - 1);

        return [x, y];
    },

    registerEvent: function (element, event, handler, capture) {
        element.addEventListener(event, handler, capture);
    },

    downloadFileGen: function(filename, text) {
	  	var element = document.createElement('a');
	  	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	  	element.setAttribute('download', filename);

	  	element.style.display = 'none';
	  	document.body.appendChild(element);

	  	element.click();

	  	document.body.removeChild(element);

	  	return true;
	}
}

function analyzePattern(grd, nxt) {
	if (JSON.stringify(grd) == JSON.stringify(nxt)) {
  		endOfGen = true;
  		generation -= 1;
  		msg.send("End of Generation");
  	}
  	if (JSON.stringify(last) == JSON.stringify(nxt)) {
  		console.log(allowRepeat);
  		if (!allowRepeat) {
  			endOfGen = true;
  			generation -= 1;
  		}
  		msg.send("Repeating Generation");
  	}
}

function gridAllowRepeat() {
	var chk = document.getElementById("inputAllowRepeat").checked;
	if (chk) {
		allowRepeat = true;
	} else {
		allowRepeat = false;
	}
}

function gridExport() {
	handlers.downloadFileGen("gol_grid.dat", JSON.stringify(grid));
}

setTimeout(function() {
	document.getElementById('inputImport').addEventListener('change', function selectedFileChanged() {
  		if (this.files.length === 0) {
			handlers.errorHandler("Empty file input!");
			return;
		}
		console.log("Importing File: " + this.files[0].name);

  		const reader = new FileReader();
  		reader.onload = function fileReadCompleted() {
    		//console.log(reader.result);
    		grid = JSON.parse(reader.result);
  		};
  		reader.readAsText(this.files[0]);
	});
}, 100);


//Constants
const CELL_ALIVE = 1;
const CELL_DEAD = 0;