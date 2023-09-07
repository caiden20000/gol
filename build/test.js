"use strict";
const r = (min, max) => Math.round((Math.random() * (max - min)) + min);
function randomString(len) {
    let result = "";
    for (let i = 0; i < len; i++) {
        result += String.fromCharCode(r(65, 90));
    }
    return result;
}
const size = 100000;
var a = new Map();
for (let i = 0; i < size; i++)
    a.set(i, randomString(8));
const numberOfQueries = 10;
const beforeTime = Date.now();
for (let i = 0; i < numberOfQueries; i++)
    console.log(a.get(r(0, size - 1)));
const afterTime = Date.now();
const deltaTime = afterTime - beforeTime;
const avgTimePerQuery = deltaTime / numberOfQueries;
console.log("Average time per query: " + avgTimePerQuery);
// Seems like average time per query is 0.5 ms every time!
