const input =
`555009 onderdelen missen
Lightsaber: 31 Batterij, 2 Unobtanium
HandheldComputer: 7 Batterij, 61 Printplaat, 67 Plastic
ElectrischeRacebaan: 47 AutoChassis, 71 Printplaat, 7 Plastic, 61 Batterij, 97 Wiel
QuadDrone: 23 Accu, 73 Plastic, 61 Printplaat
PikachuPlushy: 31 Batterij
Trampoline: 97 Schokdemper, 17 IJzer
BatmobileReplica: 43 BatmobileChassis, 89 Schokdemper, 73 Unobtanium, 53 Wiel
DanceDanceRevolutionMat: 47 Schokdemper, 3 Batterij
Printplaat: 71 Hars, 71 Koper, 61 Chip, 31 Led
Accu: 59 Batterij
Schokdemper: 73 IJzer, 2 Staal
Batterij: 29 Staal
BatmobileChassis: 41 AutoChassis, 2 Staal
AutoChassis: 31 IJzer
Wiel: 71 Rubber, 19 IJzer
Unobtanium: 7 IJzer, 29 Kryptonite`;

let data = input.split(/\n/);

/*
create toys object:
{
    toyName1 : { partName1: <number>, partName2, <number> ...},
    toyName2 : { partName2: <number>, partName3, <number> ...},
    ...
}
note: partNames may also be toyNames
*/
toys = data.slice(1).reduce( ( toys, desc) => {
    let [ toyName, parts] = desc.split(/\s*:\s*/);
    toys[toyName] = {};
    parts.split(/\s*,\s*/).forEach( item => {
        let [ cnt, part] = item.split(/\s+/);
        toys[toyName][part] = +cnt;
    });
    return toys;
}, {});

/*
replace any partName that is also a toyName with the corresponding
number of parts from the associated toyName
*/
Object.keys(toys).forEach( toyName => {
    let parts = toys[toyName];
    Object.values(toys).forEach( partList => {
        if( toyName in partList ){
            let cnt = partList[toyName];
            Object.keys(parts).forEach( p => partList[p] = (partList[p]||0) + cnt * parts[p]);
            delete partList[toyName];
            delete toys[toyName];
        }
    });
});

/*
convert toys object into an array of objects with each toys name and total number of parts
sort the array by number of parts descending:
[
    { toyName: toyName1, numParts: <number> },
    { toyName: toyName2, numParts: <number> },
    ...
]
*/
toys = Object.entries(toys)
    .map( ([ toyName, parts]) => ({
        toyName,
        numParts: Object.values(parts).reduce( ( sum, x) => sum + x)
    }))
    .sort( ( a, b) => b.numParts - a.numParts);

let part1 = toys[0].numParts;
let part2 = (function findCombos( toys, numToys, numParts){
    if( toys.length == 0 ) return null;
    if( toys[0].numParts * numToys == numParts ) return [toys[0].toyName[0].repeat(numToys)];
    for( let i = 0; i < numToys; i++ ){
        let nP = i * toys[0].numParts;
        if( nP < numParts ){
            let combo = findCombos( toys.slice(1), numToys - i, numParts - nP);
            if( combo ) return i == 0 ? combo : [ ...combo, toys[0].toyName[0].repeat(i)];
        }
    }
    return null;
})( toys, 20, parseInt(data[0]) /* <-- number of missing parts */).sort().join("");

console.log(`infi@nerd-pc ~/aoc2021 ▶ ${part1}`);
console.log(`infi@nerd-pc ~/aoc2021 ▶ ${part2}`);
