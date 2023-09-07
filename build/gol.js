"use strict";
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
