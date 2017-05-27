"use strict";

/* Creates a pair <first, second>*/
function Pair(first, second) {
	function toString() {
		return (first + "," + second);
	}
	return {
		first: first,
		second: second,
		toString: toString
	};
}