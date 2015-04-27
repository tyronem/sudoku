/* TODO: Turn this into a class, only exposing a few methods, checking for proper array size and exposing a solve() method */
/* TODO: Allow a user to enter the matrix directly and show only ONE solution or the possibles array */
/* TODO: Extend Array so I can call uniques, union and intersection natively. (Do I need to make the solution more general and not Integer specific? (Rethink this one) */

function uniques(yourArray) {
	uniq = {};
	yourArray = yourArray.sort();
	//for each item in the array, put each item in a hash. This will give us uniques keys. But we don't need zeroes.
	//Can this be done with a filter function? Might be faster if ues.
	for (item in yourArray) { 
		if (parseInt(yourArray[item]) !== 0) { 
			uniq[yourArray[item]] = true; 
		}
	}

	//get the keys, then coerce them back to integers.
	uniqKeys = Object.keys(uniq);

	//we don't need zeroes (since they denote unknown cells)
	for (item in uniqKeys) { 
		uniqKeys[item] = parseInt(uniqKeys[item]); 
	}
	return uniqKeys;
}

function union(leftarray, rightarray) {
	/* Union of the sets A and B, denoted A ∪ B, is the set of all objects that are a member of A, or B, or both. The union of {1, 2, 3} and {2, 3, 4} is the set {1, 2, 3, 4} . */
	u = uniques(leftarray.concat(rightarray));
	return u;
}

function intersection(leftarray, rightarray) {
	/* Intersection of the sets A and B, denoted A ∩ B, is the set of all objects that are members of both A and B. The intersection of {1, 2, 3} and {2, 3, 4} is the set {2, 3} . */
	z = uniques(leftarray.concat(rightarray));
	//console.log(z);	

	common = [];
	//now that I have the uniques, let's run through that array and only return ones that appear in both arrays
	for (i=0; i<z.length; i++) {
		if (leftarray.indexOf(z[i]) > -1 && rightarray.indexOf(z[i]) > -1) {
			common.push(z[i]);
		}
	}

	return common;
}

function difference(leftarray, rightarray) {
	/* Set difference of U and A, denoted U \ A, is the set of all members of U that are not members of A. The set difference {1,2,3} \ {2,3,4} is {1} , while, conversely, the set difference {2,3,4} \ {1,2,3} is {4}	*/
	diff = leftarray.filter(function(value) {
		return rightarray.indexOf(value) == -1;
	});

	return diff;
}

function missingNumbers(arr) {
	return difference([1,2,3,4,5,6,7,8,9], arr);
}

function sudokuColumn(c) { 
	col = [];
	for (var i=0; i<9; i++) {
		col.push(puzzle[i][c]);
	}
	return col;
}

function sudokuBlock(c, r) {
	//Give me all the numbers within whatever block we are in.
	bottomRow = Math.floor(r/3.0) * 3;
	bottomCol = Math.floor(c/3.0) * 3;
	blockitems = [];
	for ( i = bottomRow; i<bottomRow+3; i++) {
		temp = puzzle[i].slice(bottomCol,bottomCol+3);
		blockitems = blockitems.concat(temp);
	}
	blockitems = uniques(blockitems);
	return blockitems;
}

var possibles = [	[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]]];

function fillPossibles() {
	for (var pi = 0; pi < 9; pi++) {
		for (var pj = 0; pj < 9; pj++) {
			//console.log("debugging (" + pi + ", " + pj + ")" );
			if (puzzle[pi][pj] != 0) {
				possibles[pi][pj] = puzzle[pi][pj];
			} else {
				partone = union(sudokuColumn(pj), puzzle[pi]);
				parttwo = sudokuBlock(pj, pi);
				possibles[pi][pj] = missingNumbers(union(partone, parttwo));
			}
		}
	}
}

function possiblesToSolve() {
	for (var pi = 0; pi < 9; pi++) {
		for (var pj = 0; pj < 9; pj++) {
			if (possibles[pi][pj].length == 1) {
				puzzle[pi][pj] = possibles[pi][pj][0];
			}
		}
	}
}

function moreSinglesInPossibles() {
	for (var pi = 0; pi < 9; pi++) {
		for (var pj = 0; pj < 9; pj++) {
			if (possibles[pi][pj].length == 1) {
				return true;
			}
		}
	}
	return false;
}

function hasMorePossibles() {
	for (var pi = 0; pi < 9; pi++) {
		for (var pj = 0; pj < 9; pj++) {
			if (possibles[pi][pj].length > 1) {
				return true;
			}
		}
	}
	return false;			
}

function printArrayToTable(arr) {
	var $table = $( "<table></table>" );
	for (var pi = 0; pi < 9; pi++) {
		var $line = $( "<tr></tr>" );
		for (var pj = 0; pj < 9; pj++) {
			if (arr[pi][pj].constructor == Number) {
				$line.append( $( "<td></td>" ).html(arr[pi][pj]));
			} else {
				$line.append( $("<td></td>").html( "[" + arr[pi][pj].join(", ") + "]"));
			}
			
		}
		$table.append($line);
	}
	$table.appendTo(document.body);
}

function cellToString(arr) {
	return arr.join(",");
}

function possiblesEqual(first, second) {
	/* this is imperfect (in general, and a little bit slow), but it works in this case. */
	return (cellToString(first) == cellToString(second));
}

function nakedSubset() {
	/* if we have two cells that contain [1, 6] in a row or column, we can remove 1 and 6 from every possible array in that column (except the ones where 1 and 6 are the only options.) */
	for (t = 0; t < 9; t++) {
		d = possibles[t].filter(function (value) { return value.length == 2 && value.constructor == Array; });

		/* flaw: this works great if there are ONLY two cells with matching pairs in them. If you have three cells with pairs, this fails to process them. */
		if (d.length == 2 && possiblesEqual(d[0], d[1])) {

			for (i = 0 ; i < 9; i++ ) {
				/*	what to do? cycle through the whole row and use splice to delete one element at a time, then 
				go through fillPossibles() and possiblesToSolve(). */

				if (possibles[t][i].constructor == Array && possibles[t][i].length >= 2) {
					if (!possiblesEqual(d[0], possibles[t][i])) {
						for (p = 0; p<2; p++) {
							possibles[t][i].splice(possibles[t][i].indexOf(d[0][p]), 1);
						}								
					}
				}
			}
		}
	}

	/* maybe try vertical naked subsets here */
	printArrayToTable(possibles);
}
