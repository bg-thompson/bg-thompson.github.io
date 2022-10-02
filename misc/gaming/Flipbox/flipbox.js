// The javascript code behind Flipbox version 0.3.1, copywrite Benjamin Thompson 2016-2018. The file play.html launches the game.

var pSize = 4; // size of the 'pixels'
var cPos;
var currLS;
var previousPoses = [];
var levelList;
var levelNumber = 0;
var movementLock = false;

// Sprite detail
var boxMatR = ["11111111","10000001","10001001","10111001","10011101","10010001","10000001","11111111"];
var boxMatP = ["11111111","10000001","10100001","10001001","10010001","10000101","10000001","11111111"];
var boxMatI = ["11111111","11110001","11110001","11110001","11110001","11110001","11110001","11111111"];
var boxMatM = ["11111111","10000001","10100101","10100101","10100101","10100101","10000001","11111111"];
var tileMatQ = ["00000000","00000000","00000000","00000000","00000000","00000000","00000000","00000000"];
var tileMatS = ["00000000","00111000","01000000","00111000","00000100","00111000","00000000","00000000"];
var tileMatE = ["00000000","00111100","00100000","00111100","00100000","00100000","00111100","00000000"];
var charSprite = ["...11...","..1..1..","..1..1..","...11...","..0000..",".1.00.1.","...00...","..1..1.."];

function init() {
	// testing

	levelList = processLevelData(levels);
	// console.log(levelList);

	// create background
	var backCan = document.getElementById('background');
	backCan.width = 12*8*pSize;
	backCan.height = 12*8*pSize;
	backCtx = backCan.getContext('2d');
	backCtx.fillStyle = 'lightgray';
	backCtx.fillRect(0,0,12*8*pSize,12*8*pSize);

	var blockCan = document.getElementById('blocks');
	blockCan.width = 12*8*pSize;
	blockCan.height = 12*8*pSize;

	var charCan = document.getElementById('character');
	document.addEventListener("keydown", handleKeyPress);
	charCan.addEventListener("mousedown", handleMouseDown);
	charCan.addEventListener("mouseup", handleMouseUp);
	charCan.width = 12*8*pSize;
	charCan.height = 12*8*pSize;

	// create level
	loadLevel(levelNumber);
}

function resizeCanvas() {
	var backCan = document.getElementById('background');
	backCan.width = 12*8*pSize;
	backCan.height = 12*8*pSize;
	backCtx = backCan.getContext('2d');
	backCtx.fillStyle = 'lightgray';
	backCtx.fillRect(0,0,12*8*pSize,12*8*pSize);

	var blockCan = document.getElementById('blocks');
	blockCan.width = 12*8*pSize;
	blockCan.height = 12*8*pSize;

	var charCan = document.getElementById('character');
	charCan.width = 12*8*pSize;
	charCan.height = 12*8*pSize;
}


function copyMatrix(mat) {
	var matCopy = [];
	for (var i = 0; i < mat.length; i++) {
		matCopy.push([]);
		for (var j = 0; j < mat[0].length; j++) {
			matCopy[i][j] = mat[i][j];
		}
	}
	return matCopy;
}


function loadLevel(lnum) {
	currLS = copyMatrix(levelList[lnum][1]);
	// Find the starting position
	for (var i = 0; i < currLS.length; i++) {
		for (var j = 0; j < currLS[0].length; j++) {
			if (currLS[i][j] == 'S') {
				cPos = [j,i];
			}
		}
	}
	// Reset undo function
	previousPoses = [];
	redraw();
}

function redraw() { // Redraw the game screen
	blockCan = document.getElementById('blocks');
	blockCan.width = 12*8*pSize;
	drawLevel(currLS);
	charCan = document.getElementById('character');
	charCan.width = 12*8*pSize;
	drawChar();
}

function drawChar() {
	// Create offscreen canvas to then transfer over.
	var charCanTemp = document.createElement('canvas');
	charCanTemp.width = 8*pSize;
	charCanTemp.height = 8*pSize;
	charCtx = charCanTemp.getContext('2d');
	drawIcon(charCtx,[charSprite,'c'],pSize);
	charCtx = document.getElementById('character').getContext('2d');
	charCtx.drawImage(charCanTemp,8*cPos[0]*pSize,8*cPos[1]*pSize);
}

function handleKeyPress(keyEvent) {
	if(!movementLock) {
		// Updating canvas occurs inside the functions below.
		// Game action events
		switch (keyEvent.key) {
			case "Escape":
				loadLevel(levelNumber);
				break;
			case "ArrowUp":
				keyEvent.preventDefault();
				charMove('u');
				break;
			case "w":
				charMove('u');
				break;
			case "ArrowRight":
				charMove('r');
				break;
			case "d":
				charMove('r');
				break;
			case "ArrowDown":
				keyEvent.preventDefault();
				charMove('d');
				break;
			case "s":
				charMove('d');
				break;
			case "ArrowLeft":
				charMove('l');
				break;
			case "a":
				charMove('l');
				break;
			case "z":
				undoFunction();
				break;
			case "n":
				levelNumber = Math.min(levelNumber + 1, levelList.length - 1);
				loadLevel(levelNumber);
				break;
			case "b":
				levelNumber = Math.max(0, levelNumber - 1);
				loadLevel(levelNumber);
				break;
			// UI / Game Size
			case "9":
				pSize = Math.max(1, pSize - 1);
				resizeCanvas();
				redraw();
				document.getElementById('displayCanvas').setAttribute("style","width:" + pSize*8*12 + "px;height:" + pSize*8*12 + "px");
				break;
			case "0":
				pSize = Math.min(pSize + 1, 6);
				resizeCanvas();
				redraw();
				document.getElementById('displayCanvas').setAttribute("style","width:" + pSize*8*12 + "px;height:" + pSize*8*12 + "px");
				break;
			case "h":
			alert("ASWD / Arrow Keys to move\n\nMouse to interact with boxes\n\nZ to undo\n\nESC to reset level\n\nN/B to skip forward/back a level\n\n9/0 to adjust game size");
				break;
			default:
				return;
		}
	}
}

function handleMouseDown(mouseEvent) {
	movementLock = true;
	var charCtx = document.getElementById('character').getContext('2d');
	// detect grid position
	var gridCoord = detGridCoords(mouseEvent.offsetX, mouseEvent.offsetY);
	if (isLinearBox(currLS[gridCoord.y][gridCoord.x])) {
		var interactingInfo = getInterBxs(gridCoord.x,gridCoord.y);
		var emptyList = [];
		var falseList = [];
		var trueList = [];
		for (var i = 0; i < 4; i++) {
			if (interactingInfo[i].length == 0) {
				emptyList.push(i);
			} else if (interactingInfo[i][1]) {
				trueList.push(i);
			} else {
				falseList.push(i);
			}
		}
		// If the box doesn't have the possibilty to interact with any
		if (emptyList.length == 4) {
			charCtx.fillStyle = 'red';
			charCtx.fillRect(8*pSize*gridCoord.x,8*pSize*gridCoord.y,8*pSize,8*pSize);
		}
		// If all the possible boxes the box can interact with are blocked
		if (trueList.length == 0) {
			charCtx.fillStyle = 'red';
			charCtx.fillRect(8*pSize*gridCoord.x,8*pSize*gridCoord.y,8*pSize,8*pSize);
			for (var i = 0; i < falseList.length; i++) {
				var sq = interactingInfo[falseList[i]][0];
				charCtx.fillRect(8*pSize*sq[0],8*pSize*sq[1],8*pSize,8*pSize);
			}
		} // There are some possible interactions
		else {
			addState();
			var interBxPs = [];
			for (var i = 0; i < trueList.length; i++) {
				interBxPs.push([interactingInfo[trueList[i]][0],trueList[i]]);
			}
			charCtx.fillStyle = 'blue';
			charCtx.fillRect(8*pSize*gridCoord.x,8*pSize*gridCoord.y,8*pSize,8*pSize);
			for (var i = 0; i < interBxPs.length; i++) {
				charCtx.fillRect(8*pSize*interBxPs[i][0][0],8*pSize*interBxPs[i][0][1],8*pSize,8*pSize);
			}
			flipLevel([gridCoord.x,gridCoord.y],interBxPs);
		}
	} else if(isLocalBox(currLS[gridCoord.y][gridCoord.x])) {
		if (islocalFP([gridCoord.x,gridCoord.y])) {
			addState();
			charCtx.fillStyle = 'blue';
			charCtx.fillRect(8*pSize*gridCoord.x,8*pSize*gridCoord.y,8*pSize,8*pSize);
			localFlip([gridCoord.x,gridCoord.y]);
		} else { // local flip not possible
		charCtx.fillStyle = 'red';
		charCtx.fillRect(8*pSize*gridCoord.x,8*pSize*gridCoord.y,8*pSize,8*pSize);
		}
	}
}

function flipLevel(bxClkdCoords,interBxInfo) {
	var boxType = currLS[bxClkdCoords[1]][bxClkdCoords[0]].toLowerCase();
	for (var i = 0; i < interBxInfo.length; i++) {
		if (interBxInfo[i][1] == 0) { // North
			var northRow = [];
			for (var j = bxClkdCoords[1] - 1; j > interBxInfo[i][0][1]; j--) {
				northRow.push(currLS[j][bxClkdCoords[0]]);
			}
			northRow = flipRow(northRow,boxType);
			for (var j = 0; j < northRow.length; j++) {
				currLS[bxClkdCoords[1] - 1 - j][bxClkdCoords[0]] = northRow[j];
			}
		}
		else if (interBxInfo[i][1] == 1) {// East
			var eastRow = [];
			for (var j = bxClkdCoords[0] + 1; j < interBxInfo[i][0][0]; j++) {
				eastRow.push(currLS[bxClkdCoords[1]][j]);
			}
			eastRow = flipRow(eastRow,boxType);
			for (var j = 0; j < eastRow.length; j++) {
				currLS[bxClkdCoords[1]][bxClkdCoords[0] + 1 + j] = eastRow[j];
			}
		}
		else if (interBxInfo[i][1] == 2) {// South
			var southRow = [];
			for (var j = bxClkdCoords[1] + 1; j < interBxInfo[i][0][1]; j++) {
				southRow.push(currLS[j][bxClkdCoords[0]]);
			}
			southRow = flipRow(southRow,boxType);
			for (var j = 0; j < southRow.length; j++) {
				currLS[bxClkdCoords[1] + 1 + j][bxClkdCoords[0]] = southRow[j];
			}
		}
		else {// West
			var westRow = [];
			for (var j = bxClkdCoords[0] - 1; j > interBxInfo[i][0][0]; j--) {
				westRow.push(currLS[bxClkdCoords[1]][j]);
			}
			westRow = flipRow(westRow,boxType);
			for (var j = 0; j < westRow.length; j++) {
				currLS[bxClkdCoords[1]][bxClkdCoords[0] - 1 - j] = westRow[j];
			}
		}
	}
	return ;
}

function flipRow(row, type) {
	if (type == 'i') {
		var nrow = [];
		for (var i = 0; i < row.length; i++) {
			if (row[i] == '.') {
				nrow.push('#');
			} else {
				nrow.push('.');
			}
		}
		return nrow;
	} else if (type == 'p') {
		if (row.length == 0) {
			return [];
		} else {
			var first = row.shift();
			row.push(first);
			return row
		}
	} else if (type == 'm') {
		for (var i = 0; i < row.length / 2; i++) {
			var hold = row[i];
			row[i] = row[row.length - i - 1];
			row[row.length - i - 1] = hold;
		}
		return row;
	}
}

function localFlip(coords) {
	var boxesToCap = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
	var row = [];
	for(var i = 0; i < 8; i++) {
		row.push(currLS[coords[1] + boxesToCap[i][1]][coords[0] + boxesToCap[i][0]]);
	}
	if (currLS[coords[1]][coords[0]].toLowerCase() == 'r') {
		row = flipRow(row, 'm');
		row = flipRow(row, 'p');
		row = flipRow(row, 'p');
		row = flipRow(row, 'm');
	}
	for(var i = 0; i < 8; i++) {
		currLS[coords[1] + boxesToCap[i][1]][coords[0] + boxesToCap[i][0]] = row[i];
	}
}

function handleMouseUp() {
	movementLock = false;
	redraw();
}

function detGridCoords(xcoord,ycoord) {
	// divide by square size to get the position
	return { x: ~~(xcoord/(8*pSize)), y: ~~(ycoord/(8*pSize)) };
}

function charMove(direction) {
	// Possible bug: things moving off the map
	switch (direction) {
		case 'u':
			if(isEmpty(currLS[cPos[1] - 1][cPos[0]])) {
				addState();
				cPos[1] -= 1;
				charCan = document.getElementById('character');
				charCan.width = 12*8*pSize;
				drawChar();
			} else if(isMoveableBox(currLS[cPos[1] - 1][cPos[0]]) && isEmpty(currLS[cPos[1] - 2][cPos[0]])) {
				addState();
				currLS[cPos[1] - 2][cPos[0]] = currLS[cPos[1] - 1][cPos[0]];
				currLS[cPos[1] - 1][cPos[0]] = '.';
				cPos[1] -= 1;
				redraw();
			} break;
		case 'r':
			if(isEmpty(currLS[cPos[1]][cPos[0] + 1])) {
				addState();
				cPos[0] += 1;
				charCan = document.getElementById('character');
				charCan.width = 12*8*pSize;
				drawChar();
			} else if(isMoveableBox(currLS[cPos[1]][cPos[0] + 1]) && isEmpty(currLS[cPos[1]][cPos[0] + 2])) {
				addState();
				currLS[cPos[1]][cPos[0] + 2] = currLS[cPos[1]][cPos[0] + 1];
				currLS[cPos[1]][cPos[0] + 1] = '.';
				cPos[0] += 1;
				redraw();
			} break;
		case 'd':
			if(isEmpty(currLS[cPos[1] + 1][cPos[0]])) {
				addState();
				cPos[1] += 1;
				charCan = document.getElementById('character');
				charCan.width = 12*8*pSize;
				drawChar();
			} else if(isMoveableBox(currLS[cPos[1] + 1][cPos[0]]) && isEmpty(currLS[cPos[1] + 2][cPos[0]])) {
				addState();
				currLS[cPos[1] + 2][cPos[0]] = currLS[cPos[1] + 1][cPos[0]];
				currLS[cPos[1] + 1][cPos[0]] = '.';
				cPos[1] += 1;
				redraw();
			} break;
		case 'l':
			if(isEmpty(currLS[cPos[1]][cPos[0] - 1])) {
				addState();
				cPos[0] -= 1;
				charCan = document.getElementById('character');
				charCan.width = 12*8*pSize;
				drawChar();
			} else if(isMoveableBox(currLS[cPos[1]][cPos[0] - 1]) && isEmpty(currLS[cPos[1]][cPos[0] - 2])) {
					addState();
					currLS[cPos[1]][cPos[0] - 2] = currLS[cPos[1]][cPos[0] - 1];
					currLS[cPos[1]][cPos[0] - 1] = '.';
					cPos[0] -= 1;
					redraw();
			} break;
		default:
			return;
	}
	if (currLS[cPos[1]][cPos[0]] == 'E') {
		levelWon();
	}
}

function levelWon() {
	levelNumber = (levelNumber + 1) % (levelList.length)
	// levelNumber = Math.min(levelNumber + 1, levelList.length - 1);
	loadLevel(levelNumber);
}

function isEmpty(matrixChr) {
	// console.log(matrixChr);
	switch (matrixChr) {
		case '.': return true;
		case 'S': return true;
		case 'E': return true;
		case '#': return false;
		default: return false;
	}
}

function isMoveableBox(matrixChr) {
	switch (matrixChr) {
		case 'i': return true;
		case 'r': return true;
		case 'p': return true;
		case 'm': return true;
		default: return false;
	}
}

function isLinearBox(matrixChr) {
	switch (matrixChr.toLowerCase()) {
		case 'i': return true;
		case 'p': return true;
		case 'm': return true;
		default: return false;
	}
}

function isLocalBox(matrixChr) {
	switch(matrixChr.toLowerCase()) {
		case 'r': return true;
		default: return false;
	}
}

function addState() {
	if(previousPoses.length < 100) {
		previousPoses.push([[cPos[0],cPos[1]],copyMatrix(currLS)]);
	} else {
		previousPoses.shift();
		previousPoses.push([[cPos[0],cPos[1]],copyMatrix(currLS)]);
		// shift down by one, add to end
	}
}

function undoFunction() {
	if (previousPoses.length != 0) {
		var prevState = previousPoses.pop();
		charCan = document.getElementById('character');
		charCan.width = 12*8*pSize;
		blockCan = document.getElementById('blocks');
		blockCan.width = 12*8*pSize;
		cPos = prevState[0];
		currLS = prevState[1];
		drawLevel(currLS);
		drawChar();
	}
}

function drawLevel(levelMatrix) {
	// Create the off-screen canvas we'll draw on
	// then transfer update the actual canvas with it once
	// the drawing's done.
	// console.log('level drawn!')
	var offscreenCanvas = document.createElement('canvas');
	offscreenCanvas.width = 12*8*pSize;
	offscreenCanvas.height = 12*8*pSize;
	var offCan = offscreenCanvas.getContext('2d');



	// Now let's draw the level! // rewrite as function later
	for (var i = 0; i < levelMatrix.length; i++) {
		for (var j = 0; j < levelMatrix[0].length; j++ ) {
			offCan.translate(8*j*pSize,8*i*pSize);
			if (levelMatrix[i][j] == '#') {
				offCan.fillStyle = 'black';
				offCan.fillRect(0,0,8*pSize,8*pSize);
			} else { if (levelMatrix[i][j] != '.') {
				drawIcon(offCan,iconDict(levelMatrix[i][j]),pSize)
				}
			}
				offCan.translate(-8*j*pSize,-8*i*pSize);
			}
		}

	// Now we copy the drawn level from memory to display.
	var blockCan = document.getElementById('blocks').getContext('2d');
	blockCan.drawImage(offscreenCanvas,0,0);
}

// This function draws a box from the matrix data above.
function drawIcon(ctx,iconInfo,pSize) {
	// iconInfo := [iconMatrix, colouring type]
	var mat = iconInfo[0];
	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {
			ctx.translate(i*pSize,j*pSize)
			if (mat[j][i] == '1') {
				ctx.fillStyle = 'black';
			} else if (mat[j][i] == '0') {
				if (iconInfo[1] == 'l') {
					ctx.fillStyle = 'white';
				} else if (iconInfo[1] == 'y') {
					ctx.fillStyle = 'yellow';
				} else if (iconInfo[1] == 'e') {
					ctx.fillStyle = 'fuchsia';
				} else if (iconInfo[1] == 'c') {
					ctx.fillStyle = 'crimson';
				} else {
					ctx.fillStyle = 'gray';
				}
			} else {
				// Don't draw anything!
				ctx.fillStyle = 'rgba(0,0,0,0)';
			}

			ctx.fillRect(0,0,pSize,pSize)
			ctx.translate(-i*pSize,-j*pSize)
		}
	}
}

function iconDict(chtr) {
	switch(chtr) {
		case 'S': return [tileMatS,'y'];
		case 'E': return [tileMatE,'y'];
		case 'I': return [boxMatI,'d'];
		case 'i': return [boxMatI,'l'];
		case 'R': return [boxMatR,'d'];
		case 'r': return [boxMatR,'l'];
		case 'P': return [boxMatP,'d'];
		case 'p': return [boxMatP,'l'];
		case 'M': return [boxMatM,'d'];
		case 'm': return [boxMatM,'l'];
		default:  return [tileMatQ,'e'];
	}
}




// for (var i = 1; i < 19; i++) {
// 	if (fieldsTest[i] == "") {
// 	// if (true) {
// 		console.log("empty");
// 	}
// 	if (! isNaN(fieldsTest[i])) { // Detects number, BUT EMPTY LINES will be detected as numbers too!
// 		console.log("number", i);
// 	}
// }

function processLevelData(rawLevelData) {
	var fieldsTest = rawLevelData.split('\n');
	var levelList = [];
	var currLevel = [];
	var levelName = "";
	for (var i = 1; i < fieldsTest.length; i++) {
		if (fieldsTest[i] == "") {
			if (currLevel.length != 0) {
				levelList.push([levelName,currLevel]);
				// Reset variables
				currLevel = [];
				levelName = "";
			}
		} else if (fieldsTest[i][0] != '/') {
			if(levelName != "") {
				currLevel.push(fieldsTest[i]);
			} else {
				levelName = fieldsTest[i];
			}
		}
	} return levelList;
}

// Given grid coordinates of a box, gets coords of
// possible interacting boxes, and whether there is an interaction or not.

// currLS
function getInterBxs(gridX,gridY) {
	var boxChar = currLS[gridY][gridX];
	var intBxInfo = [[],[],[],[]];
	// [N, E, S, W] interaction info
	// Search North
	var spacesClear = true;
	for (var i = gridY - 1; i >= 0; i--) {
		if (currLS[i][gridX] == boxChar) {
			intBxInfo[0] = [[gridX,i],spacesClear];
			break;
		} else if (!(currLS[i][gridX] == '.' || currLS[i][gridX] == '#') || (gridX == cPos[0] && i == cPos[1])) {
			spacesClear = false;
		}
	}
	// Search East
	spacesClear = true;
	for (var i = gridX + 1; i <= currLS[0].length - 1; i++) {
		if (currLS[gridY][i] == boxChar) {
			intBxInfo[1] = [[i,gridY],spacesClear];
			break;
		} else if (!(currLS[gridY][i] == '.' || currLS[gridY][i] == '#') || (i == cPos[0] && gridY == cPos[1])) {
			spacesClear = false;
		}
	}
	// Search South
	spacesClear = true;
	for (var i = gridY + 1; i <= currLS.length - 1; i++) {
		if (currLS[i][gridX] == boxChar) {
			intBxInfo[2] = [[gridX,i],spacesClear];
			break;
		} else if (!(currLS[i][gridX] == '.' || currLS[i][gridX] == '#') || (gridX == cPos[0] && i == cPos[1])) {
			spacesClear = false;
		}
	}
	// Search West
	spacesClear = true;
	for (var i = gridX - 1; i >= 0; i--) {
		if (currLS[gridY][i] == boxChar) {
			intBxInfo[3] = [[i,gridY],spacesClear];
			break;
		} else if (!(currLS[gridY][i] == '.' || currLS[gridY][i] == '#') || (i == cPos[0] && gridY == cPos[1])) {
			spacesClear = false;
		}
	}
	return intBxInfo;
}

function islocalFP(coords) {
	var gridShiftsToCheck = [[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
	for (var i = 0; i < 8; i++) {
		var boxtoCheck = currLS[coords[1] + gridShiftsToCheck[i][1]][coords[0] + gridShiftsToCheck[i][0]];
		if(!(boxtoCheck == '.' || boxtoCheck == '#') ||  (cPos[0] == coords[0] +gridShiftsToCheck[i][0] && cPos[1] == coords[1] + gridShiftsToCheck[i][1])) {
			return false;
		}
	}
	return true;
}
