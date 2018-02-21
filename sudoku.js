import * from './sudoku_utils.js';

var Sudoku = (function (){


	let possibles = [	[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]]];

	let puzzle = [		[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]], 
						[[],[],[],[],[],[],[],[],[]]];


	function sudokuColumn(c) { 
		let col = [];
		for (var i=0; i<9; i++) {
			col.push(puzzle[i][c]);
		}
		return col;
	}

	function possiblesColumn(c) { 
		let col = [];
		for (var i=0; i<9; i++) {
			col.push(possibles[i][c]);
		}
		return col;
	}

	function sudokuBlock(c, r) {
		//Give me all the numbers within whatever block we are in.
		let bottomRow, bottomCol, blockitems; 

		bottomRow = Math.floor(r/3.0) * 3;
		bottomCol = Math.floor(c/3.0) * 3;
		blockitems = [];
		for (var i = bottomRow; i<bottomRow+3; i++) {
			var temp = puzzle[i].slice(bottomCol,bottomCol+3);
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
				if (arr[pi][pj].constructor === Number) { 
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
						//TODO: catch the other items in this block
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
						//TODO: catch the other items in this block
						nsSolve(i, col, possibles[i][col]);
					}				
				}				
			}
		}
	}

	function correctBlock(row, col) {
		let changes = 0;
		//I need to revisit my approach - go through each possible cell that has an array. Find 
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
							changes++;
						}
					}

					//now that we have done that, if we only have one item left, do this:
					if (possibles[r][c].length == 1) {
						possibles[r][c] = possibles[r][c][0];
						changes++; 
						nsSolve(r, c, possibles[r][c]);
						changes += correctBlock(r, c);
					}					
				}
		
			}
		}	

		return changes;
	}

	function nakedSubset() {
		//printArrayToTable(possibles);
		var numChanges = 0;
		/* if we have two cells that contain [1, 6] in a row or column, we can remove 1 and 6 from every possible array in that column (except the ones where 1 and 6 are the only options.) */
		//console.log("starting nsSolve for rows");
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
					    return parseInt(value);
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
									//console.log("nsSolve row: removing " + d[p] + " from " + cellToString(possibles[t][i])); 
									possibles[t][i].splice(idx, 1);
									numChanges++;
								}				
							}
							if (possibles[t][i].length == 1) {
								//console.log("nsSolve row: cell[" + t + "],[" + i + "] only has one match left: " + possibles[t][i][0]);
								possibles[t][i] = possibles[t][i][0];
								numChanges++;
								//console.log("correctBlock: [" + t + "],[" + i + "]");
								numChanges += correctBlock(t, i);
								//console.log("nsSolve row: Recursion on [" + t + "],[" + i + "]");
								nsSolve(t, i, possibles[t][i]);
							}
						}
					}
				}
			}
		}

		//console.log("starting nsSolve for col");
		for (t = 0; t < 9; t++) {
			//console.log("column " + t);
			d = possiblesColumn(t).filter(function (value) { return value.length == 2 && value.constructor == Array; });
			// flaw: this works great if there are ONLY two cells with matching pairs in them. If you have three cells with pairs, this fails to process them.

			ds = []; 
			for (item in d) { ds.push(cellToString(d[item])); }
			ds.sort();
			//once they're sorted, if two adjoining elements are equal, we have a match. take those elements and set them aside for processingsolve()			candidates = [];
			for (var i=0; i<ds.length - 1; i++) {
				if (ds[i] == ds[i+1]) {
					candidates.push($.map(ds[i].split(","), function(value){
					    return parseInt(value);
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
									//console.log("nsSolve col: removing " + d[p] + " from " + cellToString(possibles[i][t])); 
									possibles[i][t].splice(idx, 1);
									numChanges++;
								}
								
							}
							if (possibles[i][t].length == 1) {
								//console.log("nsSolve col: cell[" + i + "],[" + t + "] only has one match left: " + possibles[i][t][0]);				
								possibles[i][t] = possibles[i][t][0];
								numChanges++;
								//console.log("correctBlock: [" + i + "],[" + t + "]");
								numChanges += correctBlock(i, t);								
								//console.log("nsSolve col: Recursion on [" + i + "],[" + t + "]");
								nsSolve(i, t, possibles[i][t]);	
							}
						}
					}				
				}
			 }
		}

		possiblesToSolve();
		//fillPossibles(); //this would undo the work of the nakedSubset - I need to treat this differently now
		//printArrayToTable(possibles);

		//TODO: clear a cell where you have a unicorn in a row/cell. If there's an 8 as a possible, and it can't be anywhere else in that row/col/block, it has to be an 8.

		return numChanges;
	}

	
	
	return {
		solve: function(puzzleArray) {
			$("table").not("table.entry").remove(); //remove all the other tables
			puzzle = puzzleArray;	//set internal array
			printArrayToTable(puzzle); //print initial puzzle

			// This can solve any 'easy' sudoku
			fillPossibles();
			possiblesToSolve();

			while(moreSinglesInPossibles()) {
				fillPossibles();
				possiblesToSolve();
			}
			//end 'easy' solution

			//for more difficult ones, you can start using naked subsets to eliminate other possibilities
			if (!moreSinglesInPossibles() && hasMorePossibles()) {
				//printArrayToTable(possibles, true);
				numChanges = nakedSubset();
				while (numChanges > 0) {
					numChanges = nakedSubset();
					//console.log("Number of changes: " + numChanges);
				}
				
			}

			checkResult();
			//we're done solving.
			printArrayToTable(puzzle);
			printArrayToTable(possibles);
		},
	};

})();


/* TODO: Allow a user to enter the matrix directly and show only ONE solution or the possibles array */
// TODO: cleanup entire file
// TODO: check your solution.
