export var SudokuUtils = (function (){

	function uniques(yourArray) {
		uniq = {};
		//for each item in the array, put each item in a hash. This will give us uniques keys. But we don't need zeroes.
		//Can this be done with a filter function? Might be faster if yes.
		let nz = yourArray.filter(function(item) { return item != 0 } );

		for (item in nz) { 
			if (parseInt(nz[item]) !== 0) { 
				uniq[nz[item]] = true; 
			}
		}

		//get the keys, then coerce them back to integers.
		uniqKeys = $.map( Object.keys(uniq), function( val, i ) {  return parseInt(val); });

		return uniqKeys.sort();
	}

	let  union = (leftarray, rightarray) => {
		/* Union of the sets A and B, denoted A ∪ B, is the set of all objects that are a member of A, or B, or both. The union of {1, 2, 3} and {2, 3, 4} is the set {1, 2, 3, 4} . */
		return uniques(leftarray.concat(rightarray));
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

	let cellToString = (arr) => {
		return arr.join(",");
	}

	function checkResult() {
		//check across rows
		for (let i=0; i<9; i++) {
			x = missingNumbers(puzzle[i]);
			if (x.length> 0) {
				return false;
			}
		}


		//check down columns
		for (let i=0; i<9; i++) {
			x = missingNumbers(sudokuColumn[i]);
			if (x.length > 0) {
				return false;
			}
		}

		//check each 3x3 section
 		for (let i=0; i<9; i+=3) {
 			for (let j=0; j<9; j+=3) {
				x = missingNumbers(sudokuBlock[i, j]);
				if (x.length > 0) {
					return false;
				}
			}
		}

		return true;
	}
})
