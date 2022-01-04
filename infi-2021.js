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

let [ missing, ...toys] = input.split(/\n/),
    subparts = {};

// convert "missing" to a number
missing = parseInt(missing);

// convert "toys" to an object with a parts list for each toy
toys = toys.reduce( ( toys, desc) => {
    let [ toy, parts] = desc.split(/\s*:\s*/);
    toy = toys[toy] = {};
    parts.split(/\s*,\s*/).forEach( item => {
        let [ cnt, part] = item.split(/\s+/);
        toy[part] = +cnt;
    });
    return toys;
}, {});

let done = false;
while( !done ){
    done = true;
    /* for each "toy" check if any of it's parts or also toys
       if so then:
       1. mark that part as a "subpart"
       2. delete the part for the current toy's part list
       3. add the part's subparts to the current toy (multiplied by the port's count) */
    Object.keys(toys).forEach( toy => {
        toy = toys[toy];
        Object.keys(toy).forEach( part => {
            if( part in toys ){
                subparts[part] = true;
                let cnt = toy[part];
                delete toy[part];
                part = toys[part];
                Object.keys(part).forEach( subpart => {
                    if( !(subpart in toy) ) toy[subpart] = 0;
                    toy[subpart] += cnt * part[subpart];
                });
                done = false;
            }
        });
    });
}

// remove non-toys from the toy list (ie: subparts)
Object.keys(subparts).forEach( part => delete toys[part]);

// reduce toys object to an array of the form [ [ toyName1, numParts1], [ toyName2, numParts2], ... ]
toys = Object.entries(toys)
        .map( ([ toy, parts]) => [ toy, Object.values(parts).reduce( ( sum, x) => sum + x)])
        .sort( ( a, b) => b[1] - a[1]); // sort by numParts descending

// recursively test every linear combination of toys until criteria is matched
function findCombos( toys, numToys, numParts){
    if( toys.length == 0 ){
        return [];
    }
    if( toys[0][1] * numToys == numParts ){
        return [[ toys[0][0], numToys]];
    }
    for( let i = 0; i < numToys; i++ ){
        let nP = i * toys[0][1];
        if( nP < numParts ){
            let combo = findCombos( toys.slice(1), numToys - i, numParts - nP);
            if( combo.length ){
                return i == 0 ? combo : [ ...combo, [ toys[0][0], i]];
            }
        }
    }
    return [];
}

let part1 = toys[0][1];
let part2 = findCombos( toys, 20, missing).map( ([ toy, cnt]) => toy.charAt().repeat(cnt)).sort().join("");

console.log(`infi@nerd-pc ~/aoc2021 ▶ ${part1}`);
console.log(`infi@nerd-pc ~/aoc2021 ▶ ${part2}`);
