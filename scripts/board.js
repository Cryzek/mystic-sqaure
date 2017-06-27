"use strict";

var dev = 0;

/* A little bit of error reporting. */
if(!window)
	throw new Error("You're running this in the wrong place.");

if(!(window.Stack))
	throw new Error("Stack has not been implemented. Include the stack.js file.");

if(!(window.Queue))
	throw new Error("Queue has not been implemented. Include the queue.js file.");

if(!(window.Pair))
	throw new Error("Pair has not been implemented. Include the pair.js file. However simple it may be.");


/*
	Board - contains the logic for puzzle board.
	Data structures used - 
	+ Array (well, duh)
	+ Stack 
	+ Queue
	+ Pair(from C++ not the complete package, just the structure).

	Variables used - 
	+ FINAL; + currentState; + blankPosition; + numberOfMoves; + timer; + history; + solution;
	
	Helper Methods -
	+ create2dArray; + create2dCopy; + isEqual; + initFINAL; + getBlankPosition, +isValid, +isNotVisited;
*/
function Board() {

	/* Constants*/
	var DIFFICULTY = {
		"EASY": 4,
		"MEDIUM": 5,
		"HARD": 6
	};

	/*
		Variables
	*/
	/* Dimensions of the grid are decided based on difficulty. Since it's a square , we need only one. Feels redundant , however the value is needed in event listeners. */
	var size;

	/* Width and height of the board. */
	var tileLength;

	/* DOM references to puzzle board and its tiles. */
	var $board, tiles;

	/* Stores the translation of the tiles. */
	var translationMatrix;

	/* Stores the final state.i.e answer. (0 denotes the blank entry.) */
	var FINAL;
	
	/* Stores the current state during gameplay. Also the game will start from current state which will be set to some random state. */
	var currentState;
	
	/* Stores the (i,j) position of blank entry. */
	var blankPosition;

	/* Stores the number of moves played by the player. */
	var numberOfMoves;

	/* The start time, in between pause time end time and duration of game. */
	var startTime, pauseTime, duration;

	// holds reference to setInterval. This sends updates to the front end for time.
	var gameInterval;

	/* Denotes whether the game is over or not. */
	var gameOver = false, gamePaused = true;

	/* Stores the moves played by the user. Works as a stack. */
	var history = Stack();

	/* Path to solution. */
	var solution = Queue();

	/* Move Key bindings. */
	var MOVE = {
		"LEFT": 37,
		"UP": 38,
		"RIGHT": 39,
		"DOWN": 40
	};

	/* Well, this initializes the board.
		It can have the following options - 
		+ size - dimensions of the board.
		+ difficulty level - EASY, MEDIUM, HARD.
		+ boardLength
		+ tileLength
		+ el - selector to the element.
	*/

	function initBoard(options) {
		/* set initial values; */
		
		if(options.difficulty) {
			size = DIFFICULTY[options.difficulty.toUpperCase()];
		}
		else {
			size = DIFFICULTY["EASY"];
		}

		if(options.MOVE) {
			MOVE = options.MOVE;
		}

		// FINAL has the final state i.e winning state
		FINAL = initFINAL(size);

		if(dev)	{
			logState(FINAL, size);
		}

		currentState = generateRandomState(FINAL, size, 5);
		if(dev) {
			logState(currentState, size);
		}

		blankPosition = getBlankPosition(currentState, size);
		numberOfMoves = 0;
		gameOver = true;

		translationMatrix = create2dArray(size);

		initFrontEnd(options.el, size);

		initEvents();
	}

	function initFrontEnd(board, size) {
		$board = board;
		if(!board) {
			$board = $(".board");
			if(!$board.length)
				throw new Error("There is no board element.");
		}
		if(!size) {
			throw new Error("@param - size is not defined.");
		}

		tileLength = 100;

		translationMatrix = buildTranslationTable(size);
		tiles = create2dArray(size);

		// Add size*size-1 number of tiles.
		for(var i = 0;i < size;i++) {
			for(var j = 0;j < size;j++) {
				// var $tile = $("<div class='tile'>");
				var tile = document.createElement("div");
				tile.classList.add("tile");
				if(currentState[i][j] != 0) {
					// $tile.append($("<p>").text(currentState[i][j]));
					// $tile.on("click", attachClickEvent);
					var p = document.createElement("p");
					p.append(currentState[i][j]);
					tile.appendChild(p);
					tile.addEventListener("click", attachClickEvent, false);
				}
				else {
					// $tile.addClass("blank-entry");
					tile.classList.add("blank-entry");
				}
				// $tile.css({
				// 	"top": translationMatrix[i][j].first,
				// 	"left": translationMatrix[i][j].second,
				// });
				tile.style.top = translationMatrix[i][j].first;
				tile.style.left = translationMatrix[i][j].second;
				
				$board.append(tile);
				tiles[i][j] = tile;
			}
		}
	}

	function buildTranslationTable(size) {
		var arr = create2dArray(size);
		var inc = 100/size;
		for(var i = 0;i < size;i++) {
			for(var j = 0;j < size;j++) {
				var x = inc*i + "%", y = inc*j + "%";
				arr[i][j] = Pair(x, y);
			}
		}
		return arr;	
	}

	function initEvents() {
		window.addEventListener("keydown", checkMove, false);
	}

	function attachClickEvent() {
		var $el = $(this);
		var x , y;
		console.log(this, tiles);

		for(var i = 0;i < size;i++) {
			if(tiles[i].includes(this)) {
				x = i;
				y = tiles[i].indexOf(this);
				break;
			}
		}

		/* Check if blankPosition is in the vicinity*/

	}

	/* 
		Public methods --------------------------------------------------
	*/
	function playSolution() {
	}

	function start() {
		startTime = pauseTime = Date.now();
		duration = 0;
		gamePaused = false;
		gameOver = false;
		gameInterval = window.setInterval(startGameInterval, 1000);
	}

	function startGameInterval() {
		var sec, min, tmp, diff;
		if(gamePaused === true) {
			diff = duration;
		}
		else {
			tmp = Date.now();	
			diff = ((tmp - startTime)/1000 | 0);
			diff += duration;
		}
		min = (diff/60) | 0;
		min = (min < 10) ? "0" + min: min;
		sec = (diff%60) | 0;
		sec = (sec < 10) ? "0" + sec: sec;
		$board.trigger("update-timer", [sec, min]);
	}

	function undo() {
		if(history.empty()) {
			return -1;
		}
		if(gamePaused) return;

		var newpos = history.top();
		history.pop();
		// currentState = generateState(currentState, blankPosition, newpos, dimension);
		// // blankPosition = newpos.copy();
		// if(dev) {
		// 	logState(currentState, dimension);
		// 	console.log(newpos.toString());
		// }
		// numberOfMoves++;
		makeMove(blankPosition, newpos);
		// Hack for now
		history.pop(); 
		// renderMove(blankPosition, newpos);
	}

	// pause the timer.
	function pause() {
		gamePaused = true;
		pauseTime = Date.now();
		duration = duration + ((pauseTime - startTime))/1000;
	}

	// resume the timer.
	function resume() {
		gamePaused = false;
		startTime = Date.now();
	}

	function stop() {
		pauseTime = Date.now();
		duration += (pauseTime - startTime)/1000;
		startTime = pauseTime = 0;
		destroy();
	}

	function getTimePlayed() {
		return duration;
	}

	function getNumberOfMoves() {
		return numberOfMoves;
	}

	/* 
		Private methods ------------------------------------------------------------
	*/
	function renderMove(oldpos, newpos) {
		if(dev)
			console.log(oldpos.toString(), newpos.toString());
		var x1 = oldpos.first, y1 = oldpos.second, x2 = newpos.first, y2 = newpos.second;
		if(dev)
			console.log(tiles[x2][y2]);
		/* Tile on newpos has to moved to oldpos. */
		$(tiles[x2][y2]).animate({
			"top": translationMatrix[x1][y1].first,
			"left": translationMatrix[x1][y1].second,
		});

		/* Blank entry at oldpos is moved to newpos. */
		$(tiles[x1][y1]).animate({
			"top": translationMatrix[x2][y2].first,
			"left": translationMatrix[x2][y2].second,
		});

		/* Dirty code. */
		var t = tiles[x1][y1];
		tiles[x1][y1] = tiles[x2][y2];
		tiles[x2][y2] = t;
		$board.trigger("make-move", numberOfMoves);
	}

	function generateRandomState(FINAL, size) {
		if(!FINAL) {
			throw new Error("@param - FINAL is not defined");
		}
		if(!size) {
			throw new Error("@param - size is not defined.");
		}

		/* randomizeTiles and swapTiles are used from sitepoint. */
		function randomizeTiles(board, size) {
			var iter = size*size-1;
			while(iter) {
				var tmp, x1, y1, x2, y2;
				tmp = Math.floor(Math.random() * iter);

				x1 = iter%size;
				y1 = Math.floor(iter / size);

				x2 = tmp%size;
				y2 = Math.floor(tmp / size);

				swapTiles(board, x1, y1, x2, y2);

				iter--;
			}
		}

		function swapTiles(board, i, j, k, l) {
	    var temp = board[i][j];
	    board[i][j] = board[k][l];
	    board[k][l] = temp;
	  }

	  function countInversions(board, size, x, y ) {
	  	var res = 0, val = board[x][y];
	  	for(var i = x;i < size;i++) {
	  		for(var j = 0;j < size;j++) {
	  			if(board[i][j] == 0 || (i == x && j <= y) ) continue;

	  			if(board[i][j] < val) {
	  				res++;
	  			}
	  		}
	  	}
	  	return res;
	  }

	  function totalInversions(board, size) {
	  	var res = 0;
		  for(var i = 0;i < size;i++) {
				for(var j = 0;j < size;j++) {
					if(board[i][j] == 0) {
						/* Blank tile. No need to count inversions for it.*/
						continue;
					}
					res += countInversions(board, size, i, j);
				}
			}
			return res;
	  }

	  function getBlankFromBottom(board, size) {
	  	for(var i = 0;i < size;i++) {
	  		if(board[i].includes(0)) {
	  			return (size - i);
	  		}
	  	}
	  	throw new Error("No blank row found.");
	  }

	  function isSolvable(board, size, inversions, blankFromBottom) {
	  	/*
				1. If N is odd, then number of inversions should be even.
				2. If N is even, then,
					a.the blank is on an odd row counting from the bottom (last, third-last, fifth-last, etc.) and number of inversions is even.
					b.the blank is on an even row counting from the bottom (second-last, fourth-last, etc.) and number of inversions is odd.
	  	*/
	  	if(size&1) { /* size is odd*/
	  		/* return true if even number of inversions. */
	  		return (inversions%2 == 0);
	  	}
	  	else { /*size is even.*/
	  		if( blankFromBottom&1 ) { /*blank is on odd row. */
	  			return (inversions%2 == 0);
	  		}
	  		else {
	  			return (inversions%2 == 1);
	  		}
	  	}
	  }

		/* This has to be set and returned from the generateRandomState function.*/
		var board = create2dCopy(FINAL, size); 
		randomizeTiles(board, size);
		
		/*Just checking - 
		board = [[7, 4, 3], [0, 5, 8], [6, 2, 1]];
		size = 3;*/

		/* Count the total number of inversions in the board configuration. */
		var inversions = totalInversions(board, size);
		/* Get the position of blank row from bottom. */
		var blankFromBottom = getBlankFromBottom(board, size);

		if(dev == 0) {
			logState(board, size);
			console.log(inversions, blankFromBottom);
		}
		/* Check if the generated configuration is valid or not. */
		if( !isSolvable(board, size, inversions, blankFromBottom)) {
			var blankPos = getBlankPosition(board, size);
			if(blankPos.first <= 1 && blankPos.second == 0) {
				swapTiles(board, size-2, size-1,size-1,size-1);
			}
			else {
				swapTiles(board, 0, 0, 1, 0);
			}
		}
		if(dev) {
			logState(board, size);
			console.log(totalInversions(board, size), getBlankFromBottom(board, size) );
		}
		return board;
	}

	/* Generates a random state(not so random right now) as start state
		returns the generated state.
		It also saves a path from the random state to the final state. */
	// function generateRandomState(FINAL, size) {
	// 	if(!FINAL) {
	// 		throw new Error("@param - FINAL is not defined");
	// 	}
	// 	if(!size) {
	// 		throw new Error("@param - size is not defined.");
	// 	}

	// 	var START;
	// 	var NULLSTATE = create2dArray(size, -1);

	// 	/* [left, up, right, down] */
	// 	var MOVES = 4;
	// 	var rowMove = [0, -1, 0, 1];
	// 	var colMove = [-1, 0, 1, 0];

	// 	/* Q - Queue has pairs< pairs<state, blank entry position>, dist/level> */
	// 	var Q = Queue();
 
	// 	/* Stores the visited states to avoid cycles.*/
	// 	var visited = [];

	// 	/* Stores pairs<child, parent>*/
	// 	var parent = [];

	// 	/* Starting position of blank entry*/
	// 	var pos = new Pair(size-1, size-1);

	// 	/* Initializing the queues, visited and parent maps. */
	// 	Q.push(Pair( Pair(FINAL, pos), 0));
	// 	visited.push(FINAL);
	// 	parent[FINAL] = NULLSTATE;

	// 	if(dev)
	// 		console.log("Generating random states.");

	// 	while( !Q.empty() ) {
	// 		var u = Q.top(); Q.pop();
	// 		var uState = u.first.first;
	// 		var upos = u.first.second;
	// 		var udist = u.second;

	// 		if(u.second == FINAL){
	// 			START = u.first.first;
	// 			break;
	// 		}

	// 		// if(dev) {
	// 		// 	console.log("uState");
	// 		// 	console.log(upos.first, upos.second);
	// 		// 	logState(uState, size);
	// 		// }

	// 		for(var i = 0;i < MOVES;i++ ) {

	// 			var vpos = Pair(upos.first + rowMove[i], upos.second + colMove[i]) ;
	// 			if( isValid(vpos, size) ) {
	// 				var vState = generateState(uState, upos, vpos, size);
	// 				// if(dev) {
	// 				// 	console.log("New State");
	// 				// 	console.log(isNotVisited(vState));
	// 				// 	console.log(vpos.first, vpos.second);
	// 				// 	logState(vState, size);
	// 				// }
	// 				if( isNotVisited(vState, size, visited)) {
	// 					var v = new Pair( new Pair(vState, vpos), udist + 1);
	// 					Q.push(v);
	// 					visited.push(vState);
	// 					parent[vState] = uState;
	// 				}
	// 			}
	// 		}
	// 	}

	// 	if(START) {
	// 		// Save the path from start to finish in solution.
	// 		saveSolution(START, parent, NULLSTATE);
	// 	}

	// 	return START;
	// }

	/* 
		Helper Methods for Board Object. ------------------------------------------------------------
	*/
	/* Creates a simple 2 dimensional array and returns it. This is due to the fact that JS does not provide ability to create multidimensional arrays like C,C++ and 2D arrays suffice the need.*/
	function create2dArray(n, el) {
		if(!n) {
			throw new Error("@param - n is not defined.");
		}
		var arr = new Array(n);
		var i, j;
		for(i = 0;i < n;i++) {
			arr[i] = new Array(n);
			if(el) {
				for(j = 0; j < n;j++)
					arr[i][j] = el;
			}	

		}
		return arr;
	}

	/* Creates a copy of @param - arr. This is needed for the following reason - 
		eg. var a = [1, 2, 4];
		    var b = a; copies the same array reference of a.
		    So, b[1] = 6 is the same as a[1]. i.e a===b is true.

		Array.from does not for the 2D array in use.
	*/
	function create2dCopy(arr, n) {
		if(!arr) {
			throw new Error("@param - arr is not defined.");
		}
		if(!n) {
			throw new Error("@param - n is not defined.");
		}
		var res = create2dArray(n);
		var i, j;
		for(i = 0;i < n;i++) {
			for(j = 0;j < n;j++){
				res[i][j] = arr[i][j];
			}
		}
		return res;
	}

	/* Checking for array equality. Both arrays must have same dimensions. */
	function isEqual(arr1, arr2, n) {
		if(!arr1) {
			throw new Error("@param - arr1 not defined.");
		}
		if(!arr2) {
			throw new Error("@param - arr2 not defined.");
		}
		if(!n) {
			throw new Error("@param - n not defined.");
		}
		var i, j;
		for(i = 0;i < n;i++) {
			for(j = 0;j < n;j++) {
				if(arr1[i][j] != arr2[i][j])
					return false;
			}
		}
		return true;
	}

	/* Initializes the array to final state of the game. */
	function initFINAL(n) {
		if(!n) {
			throw new Error("@param - n is not defined.");
		}
		var arr = create2dArray(n);
		var i, j, k = 1;
		for(i = 0;i < n;i++) {
			for(j = 0;j < n;j++) {
				arr[i][j] = k++;
			}
		}
		arr[i-1][j-1] = 0;
		return arr;
	}

	/* Finds the blank entry in the 2d array and returns it (i,j) position as a Pair()*/
	function getBlankPosition(state, n) {
		if(!state) {
			throw new Error("@param - state is not defined.");
		}
		if(!n) {
			throw new Error("@param - n is not defined.");
		}
		var i, j;
		for(i = 0;i < n;i++) {
			for(j = 0;j < n;j++) {
				if(state[i][j] == 0) {
					return Pair(i, j);
				}
			}
		}
		throw new Error("No blank entry. Something is wrong.");
	}

	/* Check's if the pos is within the bounds. */
	function isValid(pos, n) {
		if(!pos) {
			throw new Error("@param - pos is not defined.");
		}
		if(!n) {
			throw new Error("@param - n is not defined.");
		}
		if(pos.first < 0 || pos.first >= n || pos.second < 0 || pos.second >= n)
			return false;
		return true;
	}

	/* Check's if state has already not been visited. */
	function isNotVisited(state, n, visited) {
		if(!state) {
			throw new Error("@param - state is not defined.");
		}
		if(!n) {
			throw new Error("@param - n is not defined.");
		}
		if(!visited) {
			throw new Error("@param - visited is not defined.");
		}
		var i;
		for(i = 0;i < visited.length ;i++) {
			var item = visited[i];
			if(isEqual(item, state, n))
				return false;
		}
		return true;
	}

	/* Save the solution path in solution variable. */
	function saveSolution(state, parent, NULLSTATE) {
		if(isEqual(state, NULLSTATE, size)) return;
		solution.push(state);
		saveSolution(parent[state], parent, NULLSTATE);
	}

	/* Generates a new state by moving blank entry at u to v and the entry at v to u. */
	function generateState(state, u, v, n) {
		var res = create2dCopy(state, n);
		var res = res.slice();
		var temp = res[u.first][u.second];
		res[u.first][u.second] = res[v.first][v.second];
		res[v.first][v.second] = temp;
		return res;
	}

	/* Logs to console. Dev purposes*/
	function logState(arr, n) {
		if(!arr) {
			throw new Error("@param - arr is not defined.");
		}
		if(!n) {
			throw new Error("@param - n is not defined.");
		}
		var i, j;
		for(i = 0;i < n;i++) {
			var str = "";
			for(j = 0;j < n;j++) {
				str += arr[i][j] + " ";
			}
			console.log(str);
		}
	}

	/* 
		Events --------------------------------------------------
	*/

	/* */
	function checkMove(event) {
		// console.log(event.keyCode);
		switch(event.keyCode) {
			case MOVE["LEFT"]: 	moveLeft(); /* left key detected */
								break;
			case MOVE["UP"]: 	moveUp(); /* up key detected */
								break;
			case MOVE["RIGHT"]: moveRight(); /* right key detected */
								break;
			case MOVE["DOWN"]: 	moveDown(); /* down key detected */
								break;
			default: /* some other key ignore. */ break;
		}
	}

	/* Operations for left move. */
	function moveLeft() {
		if(gameOver || gamePaused) return;
		var newpos = Pair(blankPosition.first, blankPosition.second - 1);
		if(isValid(newpos, size)) {
			makeMove(blankPosition, newpos);
		}
		else {
			console.log("Cannot move");
		}
	}

	/* Operations for up move. */
	function moveUp() {
		if(gameOver || gamePaused) return;
		var newpos = Pair(blankPosition.first - 1, blankPosition.second);
		if(isValid(newpos, size)) {
			makeMove(blankPosition, newpos);
		}
		else {
			console.log("Cannot move");
		}
	}

	/* Operations for right move. */
	function moveRight() {
		if(gameOver || gamePaused) return;
		var newpos = Pair(blankPosition.first, blankPosition.second + 1);
		if(isValid(newpos, size)) {
			makeMove(blankPosition, newpos);
		}
		else {
			console.log("Cannot move");
		}
	}
	
	/* Operations for down move. */
	function moveDown() {
		if(gameOver || gamePaused) return;
		var newpos = Pair(blankPosition.first + 1, blankPosition.second);
		if(isValid(newpos, size)) {
			makeMove(blankPosition, newpos);
		}
		else {
			console.log("Cannot move");
		}
	}

	/* Remaining operations for completing the move. */
	function makeMove(oldpos, newpos) {
		var oldState = create2dCopy(currentState, size);
		history.push(oldpos.copy());
		numberOfMoves++;
		currentState = generateState(currentState, oldpos, newpos, size);
		blankPosition = newpos.copy();
		if(dev) {
			console.log("Move");
			logState(currentState, size);
		}
		// oldpos - position of blank entry in tiles which needs to be updated.
		renderMove(oldpos, newpos);
		if( isEqual(currentState, FINAL, size) ) {
			// Won
			if(dev) {
				console.log("No of Moves " + numberOfMoves);
				console.log(duration);
			}
			stop();
			$board.trigger("game-over");
		}
	}

	function destroy() {
		// solution = null;
		// history = null;
		gameOver = true;
		gamePaused = true;
		window.clearInterval(gameInterval);
	}

	/* Mystic Square API*/
	return {
		init: initBoard,
		playMove: checkMove,
		undo: undo,
		start: start,
		pause: pause,
		resume: resume,
		stop: stop,
		left: moveLeft,
		up: moveUp,
		right: moveRight,
		down: moveDown,
		time: getTimePlayed,
		numberOfMoves: getNumberOfMoves
	};
};