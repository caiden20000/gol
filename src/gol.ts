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

// This all means we have a new system ofr subpatterns: Overlapping subpatterns.
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
    neighbors: number,
    pos: Pos
}

type CellMap = Map<string, Cell>;

// Binary boolean string of active cells l/r->t/d
// As a consequence, limited by 32-bit ints, 
//      max square grid size is 5x5 == 25 bits
//      though if we used floats (64 bit),
//      max grid size would be 8 * 8 = 64 bits exactly
type Subpattern = number;
type SubpatternMap = Map<string, Subpattern>;

type Transform = {
    pattern: Subpattern,
}

///////
// Classes
//////

class Universe {
    constructor() {

    }
}

// ??

//////
// Functions
/////

function generateSubpatternTransforms() {

}