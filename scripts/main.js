"use strict";

$(document).ready(initDocument);

function initDocument() {
	
	var opts = {
		dimension: 4,
		difficulty: "EASY",
		MOVE : {
			"LEFT": 39,
			"UP": 40,
			"RIGHT": 37,
			"DOWN": 38
		}
	}
	var board = Board();
	board.init(opts);
}