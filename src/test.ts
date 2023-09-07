const r = (min: number, max: number) => Math.round((Math.random() * (max - min)) + min);

function randomString(len: number) {
    let result = "";
    for (let i = 0; i < len; i++) {
        result += String.fromCharCode(r(65, 90));
    }
    return result;
}

const size = 100_000;

var a = new Map();
for (let i=0;i< size; i++) a.set(i, randomString(8));

const numberOfQueries = 10;
const beforeTime = Date.now();
for (let i=0;i<numberOfQueries; i++) console.log(a.get(r(0, size-1)));
const afterTime = Date.now();
const deltaTime = afterTime - beforeTime;
const avgTimePerQuery = deltaTime / numberOfQueries;

console.log("Average time per query: " + avgTimePerQuery);
// Seems like average time per query is 0.5 ms every time!
// I got 0.5ms with 100,000 entries and 0.5 on 10,000,000 entries!