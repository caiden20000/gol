// Goal: To make a hash-type Game of Life engine
// Goal 2: To not look up HOW before doing it
// I've only read a basic summary and remember only half of that
// Basically divide the universe grid into a larger grid, each cell
//      containing a certain # of smaller cells.
// Instead of calculating the state of each atomic cell individually,
//      we can use a predetermined list of how the larger cell subpatterns
//      evolve depending on their neighbors.
// So, we should first generate this list of subpatterns, and how they evolve.
// Then, we should store the subpattern array internally while giving
//      a complete grid to external processes like the display.
// We also need a function to take in a universe, or even individual cell-by-cell
//      changes and modify or generate a subpattern universe.

// OK, so, EDIT
// I was originally going to do each subpattern matching a transform based on its neighbors
//      i.e. "pattern 5 with neighbors == [1, 3, 2, 4, 2, 7, 8, 4] transforms into pattern 12"
// But I realize the numbers would get FAR TOO BIG, since matching a transform would essentially be
//      searching for and matching a number with (SIZE^2 * 9) DIGITS.
// If we had a grid size of 4x4 like I was planning, I would be trying to match a subpattern arrangement
//      to one of 2^(4*4 * 9) == 2.2300745e+43 possible combinations, if I did my math right.
// So, the new idea I have is far better for our tiny little brains (and PCs):
// Each subpattern transform will address an area of SIZE*SIZE, but only define the change
//      for the area of SIZE-2*SIZE-2 inside it. EG, for SIZE = 5, the transform will define the
//      change for the middle 9 cells, in the 3x3 middle.
// The reason for this is that only the edges touching a subpattern affect the next state of
//      that subpattern (as well as the interior cells, but that is a given.)
// Allowing for the subpattern to be self contained like this allows for the numbers to be managable.
// For a size 5 grid, we only need to match to 1 of 33554432 possible transforms to determine the next
//      state of a 3x3 interior section.
// So that actually sounds like a lot... In C, this wouldn't be a problem because with
//      clever indexing and memory management, instant lookups would be possible.
// However, we're using JS. I don't know how JS handles hashmaps.
// Good news! I just used a small test script to test the difference in attribute retrieval time
//      based on the size of the object, and it is CONSTANT! The retrieval time is about 0.5ms.
// This means that this idea is not only plausable, it is dang near possible! lol
// This also means that the crazy number of 33,000,000 different combos is STILL cheaper
// than calculating the 3x3 answer on the fly, simply because if we have the answer, it is FREE.

// This all means we have a new system for subpatterns: Overlapping subpatterns.
// We choose a size for the transformed subpattern, and we have tied to that the neighboring cells.
// So max subpattern size for 32 bit int is 3x3, for the 5x5 being stored.

// Terms
// Subpattern - square of cells with a standard width/height
// Transform - The relation between a subpattern and its future state

/////
// Types
////

type Pos = {
    x: number,
    y: number
}

type Cell = {
    active: boolean,
    pos: Pos
};

type CellMap = Map<string, Cell>;

// Binary boolean string of active cells l/r->t/d
// As a consequence, limited by 32-bit ints, 
//      max square grid size is 5x5 == 25 bits
//      though if we used floats (64 bit),
//      max grid size would be 8 * 8 = 64 bits exactly
type Subpattern = {
    binary: number,
    size: number
}

type SubpatternMap = Map<string, Subpattern>;

type Transform = {
    present: Subpattern,
    future: Subpattern
}

// Simple GOL ruleset
type Ruleset = {
    survive: number[],
    birth: number[]
}

// Conway's original ruleset
const CGOL = { survive: [2, 3], birth: [3] };

///////
// Classes
//////

// There are two coordinate systems - cell and subpattern
// The cell coordinate system shares origin with subpattern coords
// The cell coords are multiplied by the subpattern size
class Universe {
    subpatternMap: SubpatternMap;
    // Do remember that the size of the subpatterns will be 2 larger than ths number.
    subpatternSize: number;
    constructor() {
        this.subpatternMap = new Map();
        this.subpatternSize = 3;
    }

    getSubpattern(pos: Pos): Subpattern {
        const result = this.subpatternMap.get(posToString(pos));
        if (result) return result;
        return emptySubpattern(this.subpatternSize);
    }

    setSubpattern(pos: Pos, subpattern: Subpattern) {
        this.subpatternMap.set(posToString(pos), subpattern);
    }

    cellPosToSubpatternPos(pos: Pos): Pos {
        return {
            x: Math.round(pos.x / this.subpatternSize),
            y: Math.round(pos.y / this.subpatternSize)
        };
    }

    subpatternPosToCellPos(pos: Pos, shift: Pos = originPos()): Pos {
        const newPos = {
            x: pos.x * this.subpatternSize,
            y: pos.y * this.subpatternSize
        };
        // Shift (1, 1) automatically because all subpatterns include neighbors:
        // This means the edge cells of the subpattern are by default outside the
        //      bounds referenced by the position given.
        return shiftPos(newPos, shift.x + 1, shift.y + 1);
    }

    getSubpatternFromCellPos(pos: Pos) {
        return this.getSubpattern(this.cellPosToSubpatternPos(pos));
    }


}

// ??

//////
// Functions
/////

function emptySubpattern(size: number): Subpattern {
    return {
        binary: 0,
        size: size
    };
}

function originPos(): Pos {
    return {x: 0, y: 0};
}

function posToString(pos: Pos): string {
    return `${pos.x},${pos.y}`;
}

function shiftPos(pos: Pos, x: number, y: number) {
    return {x: pos.x + x, y: pos.y + y};
}

// Reading from left to right, in a space with "size" width,
// distance is how many cells (or "words"?) you've read.
function linearTo2D(distance: number, size: number): Pos {
    return {
        x: distance % size,
        y: Math.floor(distance / size)
    }
}

function posToLinear(pos: Pos, size: number): number {
    return pos.x + pos.y * size;
}

function getBitAt(subject: number, bitPos: number): boolean {
    return (subject & 2**bitPos) != 0;
}

function setBitAt(subject: number, bitPos: number, value: boolean): number {
    if (value) return subject | 2**bitPos;
    return subject & ~(2**bitPos);
}

// Generates a universe from origin to size, size
function subpatternToCellMap(subpattern: Subpattern): CellMap {
    const map: CellMap = new Map();
    const numberOfCells = subpattern.size**2;
    
    for (let i=0; i<numberOfCells; i++) {
        const currentPos = linearTo2D(i, subpattern.size);
        const active = getBitAt(subpattern.binary, i);
        const cell = {
            active: active,
            pos: currentPos
        }
        map.set(posToString(currentPos), cell);
    }

    return map;
}

function getNeighbors(pos: Pos): Pos[] {
    const posArr = [];
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            if (x == 0 && y == 0) continue;
            posArr.push(shiftPos(pos, x, y));
        }
    }
    return posArr;
}

// Step universe GOL
// Not written efficiently, but it is OK, 
//      this will only be used in generating the transforms.
function stepCellMap(map: CellMap, rules: Ruleset = CGOL): CellMap {
    const newMap: CellMap = new Map();
    for (const cell of map.values()) {
        let numberOfNeighbors = 0;
        let neighboringPositions = getNeighbors(cell.pos);
        for (const neighborPos of neighboringPositions) {
            const neighbor = map.get(posToString(neighborPos));
            if (neighbor?.active) numberOfNeighbors ++;
        }
        let active = false;
        if (cell.active && rules.survive.includes(numberOfNeighbors) ||
            cell.active == false && rules.birth.includes(numberOfNeighbors)) {
            active = true;
        }
        newMap.set(posToString(cell.pos), {
            active: active,
            pos: cell.pos
        });
    }
    return newMap;
}

// Convert origin (+, +) to subpattern, shift used for getting future for transforms
function getSubpatternFromCellMap(map: CellMap, size: number, shift: Pos = originPos()): Subpattern {
    let binary = 0;
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y ++) {
            const pos = shiftPos({x: x, y: y}, shift.x, shift.y);
            const distance = posToLinear(pos, size);
            const active = map.get(posToString(pos))?.active ?? false;
            binary = setBitAt(binary, distance, active);
        }
    }
    return {
        binary: binary,
        size: size
    };
}

function generateTransform(subpattern: Subpattern): Transform {
    const map = subpatternToCellMap(subpattern);
    const newMap = stepCellMap(map);
    const future = getSubpatternFromCellMap(newMap, subpattern.size-2, {x:1,y:1});
    return {
        present: subpattern,
        future: future
    };
}