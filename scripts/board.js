"use strict";

var dev = 1;

/* A little bit of error reporting. */
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
	+ create2dArray; + create2dCopy; + isEqual; + initFINAL; + getBlankPosition;

	What it does - 
	+ The function returns an object.

	What it does not do - 
	+ No event listeners corresponding to events in the frontend.

*/
function Board() {

	/* Constants*/
	var DIFFICULTY = {
		"EASY": 7,
		"MEDIUM": 9,
		"HARD": 11
	};

	/*
		Variables
	*/
	/* Dimensions of the grid. Since it's a square , we need only one.*/
	var dimension;

	/* Width and height of the board. */
	var boardLength, tileLength;

	var $board;

	var $tiles;

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

	/* Denotes whether the game is over or not. */
	var gameOver = false;

	/* Stores the moves played by the user. Works as a stack. */
	var history = Stack();

	/* Path to solution. */
	var solution = Queue();

	/* Move bindings. */
	var MOVE = {
		"LEFT": 37,
		"UP": 38,
		"RIGHT": 39,
		"DOWN": 40
	};

	/* Well, initializes the board.
		It can have the following options - 
		+ size - dimension.
		+ difficulty level - EASY, MEDIUM, HARD.
		+ boardLength
		+ tileLength
		+ el - selector to the element.
	*/

	function initBoard(options) {
		/* set initial values; */
		if(!options.dimension)
			options.dimension = 4;
		dimension = options.dimension;

		if(!options.difficulty) {
			options.difficulty = DIFFICULTY["MEDIUM"];
		}
		else {
			options.difficulty = DIFFICULTY[options.difficulty.toUpperCase()];
		}

		if(options.MOVE) {
			MOVE = options.MOVE;
		}

		// FINAL has the final state i.e winning state
		FINAL = initFINAL(dimension);

		if(dev)	{
			logState(FINAL, dimension);
		}

		currentState = generateRandomState(FINAL, dimension, options.difficulty);
		if(dev) {
			logState(currentState, dimension);
		}

		blankPosition = getBlankPosition(currentState, dimension);
		numberOfMoves = 0;
		startTime = pauseTime = Date.now();
		duration = 0;

		translationMatrix = create2dArray(dimension);

		initFrontEnd(options.el);

		initEvents();
	}

	function initFrontEnd(board) {
		tileLength = 100;

		if(!board) {
			$board = $(".board");
			if(!$board)
				throw new Error("There is no board element.");
		}

		translationMatrix = buildTranslationTable(dimension);
		$tiles = create2dArray(dimension);
		window.$tiles = $tiles;
		// Add dimension*dimension-1 number of tiles.
		for(var i = 0;i < dimension;i++) {
			for(var j = 0;j < dimension;j++) {
				var $tile = $("<div class='tile'>");
				if(currentState[i][j] != 0) {
					$tile.text(currentState[i][j]);
				}
				else {
					$tile.addClass("blank-entry");
				}
				$tile.css({
					"top": translationMatrix[i][j].first + "px",
					"left": translationMatrix[i][j].second + "px",
				});
				$board.append($tile);
				$tiles[i][j] = $tile;
			}
		}
	}

	function buildTranslationTable(dimension) {
		var arr = create2dArray(dimension);
		for(var i = 0;i < dimension;i++) {
			for(var j = 0;j < dimension;j++) {
				arr[i][j] = Pair(tileLength*i, tileLength*j );
			}
		}
		return arr;	
	}

	function initEvents() {
		window.addEventListener("keydown", checkMove, false);
	}

	/* 
		Public methods --------------------------------------------------
	*/
	function playSolution() {
	}

	function undo() {
		if(history.empty()) {
			return;
		}
		var newpos = history.top();
		history.pop();
		currentState = generateState(currentState, blankPosition, newpos, dimension);
		blankPosition = newpos.copy();
		if(dev) {
			logState(currentState, dimension);
			console.log(newpos.toString());
		}
		renderMove(blankPosition, newpos);
		numberOfMoves++;
	}

	function pause() {
		pauseTime = Date.now();
		duration = duration + (pauseTime - startTime);
		// pause the timer.
	}

	function resume() {
		// resume the timer.
		startTime = pauseTime;
	}

	function stop() {
		pauseTime = Date.now();
		duration += pauseTime - startTime;
		startTime = pauseTime = 0;
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
		console.log(oldpos.toString(), newpos.toString());
		var x1 = oldpos.first, y1 = oldpos.second, x2 = newpos.first, y2 = newpos.second;
		console.log($tiles[x2][y2]);
		/* Tile on newpos has to moved to oldpos. */
		$tiles[x2][y2].animate({
			"top": translationMatrix[x1][y1].first + "px",
			"left": translationMatrix[x1][y1].second + "px",
		});

		/* Blank entry at oldpos is moved to newpos. */
		$tiles[x1][y1].animate({
			"top": translationMatrix[x2][y2].first + "px",
			"left": translationMatrix[x2][y2].second + "px",
		});

		/* Dirty code. */
		var t = $tiles[x1][y1];
		$tiles[x1][y1] = $tiles[x2][y2];
		$tiles[x2][y2] = t;
	}

	/* Generates a random state(not so random right now) as start state
		returns the generated state.
		It also saves a path from the random state to the final state. */
	function generateRandomState(FINAL, dimension, depth) {

		if(!FINAL) {
			throw new Error("@param - FINAL is not defined");
		}
		if(!depth) {
			throw new Error("@param - dimension is not defined.");
		}
		if(!depth) {
			throw new Error("@param - depth is not defined. (DIFFICULTY LEVEL)");
		}

		var START;
		var NULLSTATE = create2dArray(dimension, -1);

		/* [left, up, right, down] */
		var MOVES = 4;
		var rowMove = [0, -1, 0, 1];
		var colMove = [-1, 0, 1, 0];

		/* Q - Queue has pairs< pairs<state, blank entry position>, dist/level> */
		var Q = Queue();
 
		/* Stores the visited states to avoid cycles.*/
		var visited = [];

		/* Stores pairs<child, parent>*/
		var parent = [];

		/* Starting position of blank entry*/
		var pos = new Pair(dimension-1, dimension-1);

		/* Initializing the queues, visited and parent maps. */
		Q.push(Pair( Pair(FINAL, pos), 0));
		visited.push(FINAL);
		parent[FINAL] = NULLSTATE;

		if(dev)
			console.log("Generating random states.");

		while( !Q.empty() ) {
			var u = Q.top(); Q.pop();
			var uState = u.first.first;
			var upos = u.first.second;
			var udist = u.second;

			if(u.second == depth){
				START = u.first.first;
				break;
			}

			// if(dev) {
			// 	console.log("uState");
			// 	console.log(upos.first, upos.second);
			// 	logState(uState, dimension);
			// }

			for(var i = 0;i < MOVES;i++ ) {
				var vpos = Pair(upos.first + rowMove[i], upos.second + colMove[i]) ;
				if( isValid(vpos, dimension) ) {
					var vState = generateState(uState, upos, vpos, dimension);
					// if(dev) {
					// 	console.log("New State");
					// 	console.log(isNotVisited(vState));
					// 	console.log(vpos.first, vpos.second);
					// 	logState(vState, dimension);
					// }

					if( isNotVisited(vState, visited)) {
						var v = new Pair( new Pair(vState, vpos), udist + 1);
						Q.push(v);
						visited.push(vState);
						parent[vState] = uState;
					}
				}
			}
		}

		if(START) {
			// Save the path from start to finish in solution.
			saveSolution(START, parent, NULLSTATE);
		}

		return START;
	}

	/* 
		Helper Methods for Board Object. ------------------------------------------------------------
	*/
	/* Creates a simple 2 dimensional array and returns. */
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

	/* Creates a copy of @param - arr. This is needed for the following reason*/
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
		if(pos.first < 0 || pos.first >= n || pos.second < 0 || pos.second >= n)
			return false;
		return true;
	}

	/* Check's if state has already not been visited. */
	function isNotVisited(state, visited) {
		var i;
		for(i = 0;i < visited.length ;i++) {
			var item = visited[i];
			if(isEqual(item, state, dimension))
				return false;
		}
		return true;
	}

	/* Save the solution path in solution variable. */
	function saveSolution(state, parent, NULLSTATE) {
		if(isEqual(state, NULLSTATE, dimension)) return;
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
		if(gameOver) return;
		var newpos = Pair(blankPosition.first, blankPosition.second - 1);
		if(isValid(newpos, dimension)) {
			makeMove(blankPosition, newpos);
		}
		else {
			console.log("Cannot move");
		}
	}

	/* Operations for up move. */
	function moveUp() {
		if(gameOver) return;
		var newpos = Pair(blankPosition.first - 1, blankPosition.second);
		if(isValid(newpos, dimension)) {
			makeMove(blankPosition, newpos);
		}
		else {
			console.log("Cannot move");
		}
	}

	/* Operations for right move. */
	function moveRight() {
		if(gameOver) return;
		var newpos = Pair(blankPosition.first, blankPosition.second + 1);
		if(isValid(newpos, dimension)) {
			makeMove(blankPosition, newpos);
		}
		else {
			console.log("Cannot move");
		}
	}
	
	/* Operations for down move. */
	function moveDown() {
		if(gameOver) return;
		var newpos = Pair(blankPosition.first + 1, blankPosition.second);
		if(isValid(newpos, dimension)) {
			makeMove(blankPosition, newpos);
		}
		else {
			console.log("Cannot move");
		}
	}

	/* Remaining operations for completing the move. */
	function makeMove(oldpos, newpos) {
		var oldState = create2dCopy(currentState, dimension);
		history.push(oldpos.copy());
		numberOfMoves++;
		currentState = generateState(currentState, oldpos, newpos, dimension);
		blankPosition = newpos.copy();
		if(dev) {
			console.log("Move");
			logState(currentState, dimension);
		}
		// oldpos - position of blank entry in $tiles which needs to be updated.
		renderMove(oldpos, newpos);
		if( isEqual(currentState, FINAL, dimension) ) {
			// Won
			if(dev) {
				console.log("No of Moves " + numberOfMoves);
				stop();
				console.log(duration);
				gameOver = true;
			}
		}
	}

	
	/* Mystic Square API*/
	return {
		init: initBoard,
		playMove: checkMove,
		undo: undo,
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