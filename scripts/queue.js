"use strict";

function Queue() {
	var arr = [];
	var front = -1;
	var back = -1;

	function push(el) {
		if(!el) throw new Error("No element provided");
		if(front == -1)
			front++;
		arr[++back] = el;
	}

	function pop() {
		if(empty())
			throw new Error("Queue is empty");
		var el = arr[front++];
		return el;
	}

	function empty() {
		if((front == back + 1) || (front == -1 && back == -1))
			return true;
		else
			return false;
	}

	function top() {
		if(front != -1)
			return arr[front];
		else
			throw new Error("Queue is empty");
	}

	return {
		push: push,
		pop: pop,
		empty: empty,
		top: top
	};
};