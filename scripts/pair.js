"use strict";

/* Creates a pair <first, second>*/
function Pair(first, second) {
	function toString() {
		return (first + "," + second);
	}
	function copy() {
		return Pair(this.first, this.second);
	}
	return {
		first: first,
		second: second,
		toString: toString,
		copy: copy
	};
}