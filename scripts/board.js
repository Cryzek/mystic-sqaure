"use strict";

var dev = 1;

function Board() {

	/* Constants*/
	var DIFFICULTY = {
		"EASY": 7,
		"MEDIUM": 9,
		"HARD": 11
	};

	/* Stores the final state.i.e answer. (0 denotes the blank entry.) */
	var FINAL;
	
	/* Stores the current state during gameplay. Also the game will start from current state which will be set to some random state. */
	var currentState;
	
	/* Stores the (i,j) position of blank entry. */
	var blankPosition;

	/* Stores the number of moves played by the player. */
	var noOfMoves;

	/* The duration of game. */
	var timer;
	
	/* Stores the moves played by the user. Works as a stack. */
	var history = Stack();

	/* Path to solution. */
	var solution = Queue();

	/* Well, initializes the board*/
	function initBoard(boardSize, difficulty) {
		/* set initial values; */
		if(!boardSize)
			boardSize = 4;

		if(!difficulty)
			difficulty = DIFFICULTY["MEDIUM"];
		else {
			difficulty = difficulty.toUpperCase();
			difficulty = DIFFICULTY[difficulty];
		}

		// FINAL has the final statei.e winning state
		FINAL = create2dArray(boardSize);
		initFINAL(FINAL, boardSize);

		if(dev)	{
			logState(FINAL, boardSize);
		}

		currentState = generateRandomState(FINAL, boardSize, difficulty);
		if(dev) {
			logState(currentState, boardSize);
		}

		blankPosition = getBlankPosition(currentState, boardSize);

		noOfMoves = 0;

		timer = new Date();
	}

	/* 
		Public methods 
	*/
	function playSolution() {
	}

	function undo() {
	}

	function playMove() {
	}

	function pause() {
	}

	function stop() {
	}

	/* 
		Private methods 
	*/
	function renderMove() {
	}

	/* Generates a random state as start state
		returns the generated state. */
	function generateRandomState(FINAL, boardSize, depth) {

		if(!depth) {
			throw new Error("DIFFICULTY LEVEL not provided.");
		}

		var START;

		/* [left, up, right, down] */
		var MOVES = 4;
		var rowMove = [0, -1, 0, 1];
		var colMove = [-1, 0, 1, 0];

		/* Q - Queue has pairs< pairs<state, blank entry position>, dist/level> */
		var Q = Queue();
 
		/* Stores the visited states to avoid cycles.*/
		var visited = [];
		window.visited = visited;

		/* Stores pairs<child, parent>*/
		var parent = [];

		/* Starting position of blank entry*/
		var pos = new Pair(boardSize-1, boardSize-1);

		/* Helper methods for generateRandomState */
		function isNotVisited(state) {
			var i;
			for(i = 0;i < visited.length ;i++) {
				var item = visited[i];
				if(isEqual(item, state, boardSize))
					return false;
			}
			return true;
		}

		/* Check's if the pos is within the bounds. */
		function isValid(pos, n) {
			if(pos.first < 0 || pos.first == n || pos.second < 0 || pos.second == n)
				return false;
			return true;
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

		/* Initialising the queus, visited and parent maps. */
		Q.push(Pair( Pair(FINAL, pos), 0));
		visited.push(FINAL);
		parent.push(Pair(FINAL, create2dArray(boardSize, -1) ));

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
			// 	logState(uState, boardSize);
			// }

			for(var i = 0;i < MOVES;i++ ) {
				var vpos = Pair(upos.first + rowMove[i], upos.second + colMove[i]) ;
				if( isValid(vpos, boardSize) ) {
					var vState = generateState(uState, upos, vpos, boardSize);
					// if(dev) {
					// 	console.log("New State");
					// 	console.log(isNotVisited(vState));
					// 	console.log(vpos.first, vpos.second);
					// 	logState(vState, boardSize);
					// }

					if( isNotVisited(vState, visited)) {
						var v = new Pair( new Pair(vState, vpos), udist + 1);
						Q.push(v);
						visited.push(vState);
						parent.push(Pair(vState, uState) );
					}
				}
			}
		}
		return START;
	}

	/* 
		Helper Methods for Board Object.
	*/
	/* Creates a simple 2 dimensional array and returns. */
	function create2dArray(n, el) {
		var arr = new Array(n);
		var i, j;
		for(i = 0;i < n;i++) {
			arr[i] = new Array(n);
			if(el) {
				for(j = 0; j < n;j++)
					arr[i][j] == el;
			}	

		}
		return arr;
	}

	/* Creates a copy of @param - arr. This is needed for the following reason*/
	function create2dCopy(arr, n) {
		var res = create2dArray(n);
		var i, j;
		for(i = 0;i < n;i++) {
			for(j = 0;j < n;j++){
				res[i][j] = arr[i][j];
			}
		}
		return res;
	}

	/* Checking for array equality */
	function isEqual(arr1, arr2, n) {
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
	function initFINAL(FINAL, boardSize) {
		var i, j, k = 1;
		for(i = 0;i < boardSize;i++) {
			for(j = 0;j < boardSize;j++) {
				FINAL[i][j] = k++;
			}
		}
		FINAL[i-1][j-1] = 0;
	}

	function getBlankPosition(state, n) {
		var i, j;
		var pos = Pair();
		// At this point pos.first and second are undefined.
		for(i = 0;i < n;i++) {
			for(j = 0;j < n;j++) {
				if(state[i][j] == 0) {
					pos.first = i;
					pos.second = j;
					return pos;
				}
			}
		}
		return pos;
	}

	/* Logs to console. Dev purposes*/
	function logState(arr, n) {
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
		Events 
	*/
	function initEvents() {

	}
	window.addEventListener("keydown", playMove, false);

	function playMove(event) {
		console.log(event.keyCode);
		switch(event.keyCode) {
			case 37: 
				/* left key detected */
				break;
			case 38:
				/* up key detected	  */
				break;
			case 39:
				/* right key detected */
				break;
			case 40:
				/* down key detected */
				break;
			default:
				/* some other key ignore. */
				break;
		}
	}

	return {
		init: initBoard,
		playMove: playMove
	};
};