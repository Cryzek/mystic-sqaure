(function (){ 
	"use strict";

	$(document).ready(initDocument);

	/* Much needed globals*/
	var opts = {
		// dimension: 4,
		difficulty: "EASY",
		MOVE : {
			"LEFT": 39,
			"UP": 40,
			"RIGHT": 37,
			"DOWN": 38
		}
	}

	var isPlaying = false, isGameOver = true, playedOnce = false;

	const board = new Board();
	var $board;
	var $instructions;
	var $start, $stop, $solve, $undo;
	var $moves, $timer;

	function initDocument() {
		opts.el = $(".board");
		board.init(opts);

		$board = $(".board");
		$instructions = $(".instructions");

		$moves = $(".move-count");
		$timer = $(".timer");
		var $gameControls = $(".game-controls");

		$start = $gameControls.find(".start");
		$stop = $gameControls.find(".stop");
		$solve = $gameControls.find(".solve");
		$undo = $gameControls.find(".undo");

		initEvents(board);

		Materialize.toast("Use Arrow Keys(Swipe this to the right)");
	}

	function initEvents(board) {
		$(".difficulty-controls .difficulty").on("click", changeDifficulty);

		$board.on("game-over", gameOver);

		$board.on("make-move", updateMoves);

		$board.on("update-timer", updateTimer);

		$instructions.on("click", () => {

		});

		/*Button events.*/
		$start.on("click", start);

		$stop.on("click", stop);

		$solve.on("click", solve);

		$undo.on("click", undo);

	}

	function changeDifficulty(e) {
		if(isPlaying) {
			Materialize.toast("Do complete the ongoing game or otherwise", 2000);
			return;
		}
		var $el = $(this), currentDifficulty = opts.difficulty, newDifficulty = $el.attr("data-difficulty").toUpperCase();
		if(currentDifficulty === newDifficulty) 
			return;

		/* Set a loader on board */
		$(".difficulty.active").removeClass("active");
		$el.addClass("active");

		if(newDifficulty == "EASY") {
			opts.difficulty = newDifficulty;
		}
		else if(newDifficulty = "MEDIUM") {
			opts.difficulty = newDifficulty;
		}
		else if(newDifficulty = "HARD") {
			opts.difficulty = newDifficulty;
		}
	}

	function updateTimer(e, sec, min) {
		$timer.text(min + ":" + sec);
	}

	function gameOver() {
		Materialize.toast("You have completed it.Well Duh!!", 2000);
		$start.text("Start");
		isGameOver = true;
		isPlaying = false;
		playedOnce = true;
	}

	function updateMoves(e, moves) {
		$moves.text(moves);
	}

	function start() {
		if(isGameOver && !isPlaying && playedOnce) {
			// Restart or start a new game.
			console.log("here");
			var difficulty = $(".difficulty.active").attr("data-difficulty").toUpperCase();
			opts.el.html("");
			opts.difficulty = difficulty;
			board.init(opts);
			$start.text("Pause");
			board.start();
			isGameOver = false;
			isPlaying = true;
			return;
		}

		if(isGameOver && !playedOnce) {
			// Start the game(timer).
			board.start();
			$start.text("Pause");
			isGameOver = false;
			isPlaying = true;
			return;
		}
		
		if(isPlaying) {
			// Pause the game.
			isPlaying = false;
			board.pause();
			$start.text("Resume");
		}
		else {
			isPlaying = true;
			board.resume();
			$start.text("Pause");
		}
	}

	function stop() {
		if(isPlaying) {
			isPlaying = false;
			isGameOver = true;
			board.stop();
			$start.text("Start");
			$timer.text("00:00");
			playedOnce = true;
		}
		else
			Materialize.toast("Can't stop something that isn't started", 2000);
	}

	function solve() {
		Materialize.toast("Yet to come.", 2000);
	}

	function undo() {
		if(board.undo() == -1) {
			Materialize.toast("You're at the very start.", 2000);
		}
	}
})();
