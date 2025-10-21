const CELL_SIZE = 0.5;

/**
 * Represents a parsed cell from the CSV level data.
 * @typedef {object} LevelCell
 * @property {string} type - The collision type (e.g., 'Bounce', 'Death').
 * @property {string} target - The collision target (e.g., 'All', 'Ball').
 */

/**
 * Represents a merged rectangle for the game world.
 * @typedef {object} LevelRectangle
 * @property {number[]} position - The center position [x, y] of the rectangle.
 * @property {number[]} size - The size [width, height] of the rectangle.
 * @property {string} type - The collision type.
 * @property {string} target - The collision target.
 * @property {number} rotation - The rotation of the rectangle (defaults to 0).
 */

/**
 * Loads a level from a CSV file, parses it, and merges adjacent cells into rectangles.
 * @param {string} url - The URL of the CSV file to load.
 * @returns {Promise<LevelRectangle[]>} A promise that resolves to an array of rectangle objects.
 */
async function loadLevel(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const csvText = await response.text();
		const grid = parseCSV(csvText);
		const rectangles = mergeCells(grid);
		return rectangles;
	} catch (error) {
		console.error("Failed to load or process level:", error);
		return []; // Return an empty array on failure
	}
}

/**
 * Parses the raw CSV text into a 2D grid of LevelCell objects.
 * @param {string} csvText - The raw text content of the CSV file.
 * @returns {LevelCell[][]} A 2D array representing the level grid.
 */
function parseCSV(csvText) {
	const grid = [];
	const rows = csvText.trim().split(/\r?\n/);
	for (const rowText of rows) {
		const gridRow = [];
		const cells = rowText.split(',');
		for (const cellText of cells) {
			const [type, target] = cellText.trim().split('-');
			if (type && target) {
				gridRow.push({ type, target });
			} else {
				gridRow.push(null); // Represents an empty cell
			}
		}
		grid.push(gridRow);
	}
	return grid;
}

/**
 * Merges adjacent cells in the grid with the same properties into larger rectangles.
 * This uses a greedy algorithm to find the largest possible rectangle from each unvisited cell.
 * @param {LevelCell[][]} grid - The 2D grid of level cells.
 * @returns {LevelRectangle[]} An array of merged rectangle objects.
 */
function mergeCells(grid) {
	if (!grid || grid.length === 0) {
		return [];
	}

	const numRows = grid.length;
	const numCols = grid[0].length;
	const visited = Array.from({ length: numRows }, () => Array(numCols).fill(false));
	const rectangles = [];

	for (let r = 0; r < numRows; r++) {
		for (let c = 0; c < numCols; c++) {
			if (visited[r][c] || !grid[r][c]) {
				continue;
			}

			const startCell = grid[r][c];

			// 1. Find the maximum width the rectangle can have
			let width = 1;
			while (c + width < numCols && !visited[r][c + width] && isSameCell(startCell, grid[r][c + width])) {
				width++;
			}

			// 2. Find the maximum height it can have with that width
			let height = 1;
			while (r + height < numRows) {
				let canExtend = true;
				for (let i = 0; i < width; i++) {
					if (visited[r + height][c + i] || !isSameCell(startCell, grid[r + height][c + i])) {
						canExtend = false;
						break;
					}
				}
				if (canExtend) {
					height++;
				} else {
					break;
				}
			}

			// 3. Mark all cells in the found rectangle as visited
			for (let i = 0; i < height; i++) {
				for (let j = 0; j < width; j++) {
					visited[r + i][c + j] = true;
				}
			}

			// 4. Create the rectangle object
			const rectWidth = width * CELL_SIZE;
			const rectHeight = height * CELL_SIZE;
			const posX = c * CELL_SIZE + rectWidth / 2;
			const posY = r * CELL_SIZE + rectHeight / 2;

			rectangles.push({
				position: [posX, -posY],
				size: [rectWidth, rectHeight],
				type: startCell.type,
				target: startCell.target,
				rotation: 0, // Default rotation
			});
		}
	}

	return rectangles;
}

/**
 * Helper function to check if two cells have the same type and target.
 * @param {LevelCell} cellA
 * @param {LevelCell} cellB
 * @returns {boolean}
 */
function isSameCell(cellA, cellB) {
	if (!cellA || !cellB) return false;
	return cellA.type === cellB.type && cellA.target === cellB.target;
}

// Example Usage:
// loadLevel('level.csv').then(levelRects => {
//   console.log("Loaded and merged level rectangles:", levelRects);
//   // You can now use `levelRects` to populate your game world,
//   // for example, by replacing the hardcoded `rects` array in `game.js`.
//   // rects = levelRects.map(r => new RectCollision(r.position, r.size, r.rotation, CollisionTarget[r.target], CollisionType[r.type.toUpperCase()]));
// });
