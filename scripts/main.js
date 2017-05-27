"use strict";

$(document).ready(initDocument);

function initDocument() {
	var opts = {
		dimension: 4,
		difficulty: "EASY"
	}
	var board = Board();
	board.init(opts);
}