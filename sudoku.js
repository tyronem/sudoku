/* TODO: Turn this into a class, only exposing a few methods, checking for proper array size and exposing a solve() method */
/* TODO: Allow a user to enter the matrix directly and show only ONE solution or the possibles array */
/* TODO: Extend Array so I can call uniques, union and intersection natively. (Do I need to make the solution more general and not Integer specific? (Rethink this one) */
//TODO: cleanup entire file

var possibles = [	[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]], 
					[[],[],[],[],[],[],[],[],[]]];

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

function possiblesColumn(c) { 
	col = [];
	for (var i=0; i<9; i++) {
		col.push(possibles[i][c]);
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
				//possibles[pi][pj] = possibles[pi][pj][0];
			}
			if (possibles[pi][pj].constructor == Number) {
				puzzle[pi][pj] = possibles[pi][pj];
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

function printArrayToTable(arr, pagebreak) {
	if (pagebreak != null && pagebreak != undefined) {
		var $table = $( "<table class='pbb'></table>" );
	} else {
		var $table = $( "<table></table>" );
	}

	for (var pi = 0; pi < 9; pi++) {
		var $line = $( "<tr></tr>" );
		for (var pj = 0; pj < 9; pj++) {
			if (arr[pi][pj].constructor == Number) { 
				if (arr[pi][pj] == 0) {
					$line.append( $( "<td></td>" ).html("&nbsp;"));
				} else {
					$line.append( $( "<td></td>" ).html(arr[pi][pj]));
				}
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

/* when we have a naked subset solve, we have to clear the row, column and block */
function nsSolve(row, col, num) {
	//go across the row and remove this number from other cells in this row
	for (var i = 0; i<9; i++) {
		if (possibles[row][i].length > 1) {
			idx = possibles[row][i].indexOf(num);
			if (idx != -1) {
				possibles[row][i].splice(idx, 1);
				if (possibles[row][i].length == 1) {
					possibles[row][i] = possibles[row][i][0]; 
					nsSolve(row, i, possibles[row][i]);
				}		
			}			
		}
	}

	//go down the column and remove this number from other cells in this column
	for (var i = 0; i<9; i++) {
		if (possibles[i][col].length > 1) {
			idx = possibles[i][col].indexOf(num);
			if (idx != -1) {
				possibles[i][col].splice(idx, 1);
				if (possibles[i][col].length == 1) {
					possibles[i][col] = possibles[i][col][0]; 
					nsSolve(i, col, possibles[i][col]);
				}				
			}				
		}
	}
}

function clearBlock(row, col) {
	//TODO: Get block information, clear adjoining cells in this block
	bottomRow = Math.floor(row/3.0) * 3;
	bottomCol = Math.floor(col/3.0) * 3;
	for (r = bottomRow; r<bottomRow+3; r++) {
		for (c = bottomCol; c<bottomCol+3; c++) {
			var alreadySolved = sudokuBlock(r,c);
			if (possibles[r][c].constructor == Array) {
				//for each cell in possibles[r][c], find anything in sudokuBlock(r,c) that exists in possibles[r][c] and remove it from possibles[r][c]
				var toRemove = intersection(possibles[r][c], alreadySolved);
				for (item in toRemove) { 
					idx = possibles[r][c].indexOf(toRemove[item]);
					if (idx != -1) {
						possibles[r][c].splice(idx, 1);
					}
				}

				//now that we have done that, if we only have one item left, do this:
				if (possibles[r][c].length == 1) {
					possibles[r][c] = possibles[r][c][0]; 
					nsSolve(r, c, possibles[r][c]);
				}					
			}
	
		}
	}	
}

function nakedSubset() {
	var numChanges = 0;
	/* if we have two cells that contain [1, 6] in a row or column, we can remove 1 and 6 from every possible array in that column (except the ones where 1 and 6 are the only options.) */
	for (t = 0; t < 9; t++) {
		d = possibles[t].filter(function (value) { return value.length == 2 && value.constructor == Array; });
		ds = []; 
		for (item in d) { ds.push(cellToString(d[item])); }
		ds.sort();
		//once they're sorted, if two adjoining elements are equal, we have a match. take those elements and set them aside for processing.
		candidates = [];
		for (var i=0; i<ds.length - 1; i++) {
			if (ds[i] == ds[i+1]) {
				candidates.push($.map(ds[i].split(","), function(value){
				    return parseInt(value, 10);
				}));
			}
		}

		for (item in candidates) { 
			d = candidates[item]; 

			for (i = 0 ; i < 9; i++ ) {
				/*	what to do? cycle through the whole row and use splice to delete one element at a time */

				if (possibles[t][i].constructor == Array && possibles[t][i].length >= 2) {
					if (!possiblesEqual(d, possibles[t][i])) {
						for (p = 0; p<2; p++) {
							idx = possibles[t][i].indexOf(d[p]);
							if (idx != -1) {
								possibles[t][i].splice(idx, 1);
								numChanges++;
							}				
						}
						if (possibles[t][i].length == 1) {
							possibles[t][i] = possibles[t][i][0];
							numChanges++;
							nsSolve(t, i, possibles[t][i]);
						}
					}
				}
			}
		}
	}

	for (t = 0; t < 9; t++) {
		//console.log("column " + t);
		d = possiblesColumn(t).filter(function (value) { return value.length == 2 && value.constructor == Array; });
		// flaw: this works great if there are ONLY two cells with matching pairs in them. If you have three cells with pairs, this fails to process them.

		ds = []; 
		for (item in d) { ds.push(cellToString(d[item])); }
		ds.sort();
		//once they're sorted, if two adjoining elements are equal, we have a match. take those elements and set them aside for processing.
		candidates = [];
		for (var i=0; i<ds.length - 1; i++) {
			if (ds[i] == ds[i+1]) {
				candidates.push($.map(ds[i].split(","), function(value){
				    return parseInt(value, 10);
				}));
			}
		}

		for (item in candidates) { 
			d = candidates[item]; 
			for (i = 0 ; i < 9; i++ ) {
				//console.log("i: " + i + " t: "  + t);
				//	what to do? cycle through each cell in the column and use splice to delete one element at a time
				if (possibles[i][t].constructor == Array && possibles[i][t].length >= 2) {
					if (!possiblesEqual(d, possibles[i][t])) {
						for (p = 0; p<2; p++) {
							//console.log("Remove " + d[p] + " from " + possibles[i][t]);
							idx = possibles[i][t].indexOf(d[p]);
							if (idx != -1) {
								possibles[i][t].splice(idx, 1);
								numChanges++;
							}
							
						}
						if (possibles[i][t].length == 1) {
							possibles[i][t] = possibles[i][t][0];
							numChanges++;
							nsSolve(i, t, possibles[i][t]);	
						}
					}
				}				
			}
		 }
	}

	/* All I want to do here is pass the first possible array to this and let it clean up the rest.  */
	for (i=0; i<9; i++) {
		for (j=0; j<9; j++) {
			if (possibles[i][j].constructor == Array) {
				clearBlock(i, j);
				i=10; j=10; //trying to break out of double for loops is ugly at best. The best way is to make your conditions of both loops invalid.
				break;
			}
		}
 	}
	

	possiblesToSolve();
	//fillPossibles(); //this undoes the work of the nakedSubset - I need to treat this differently now
	printArrayToTable(possibles);

	//TODO: clear a cell where you have a unicorn in a row/cell. If there's an 8 as a possible, and it can't be anywhere else in that row/col/block, it has to be an 8.

	return numChanges;
}
