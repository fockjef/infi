let input = "location" in globalThis && location.href.startsWith("https://infiaoc.azurewebsites.net/api/aoc/input/2021/")
	? document.body.innerText.trim() // run directly from dev console of puzzle input url
	: `492634 onderdelen missen
Lightsaber: 61 Batterij, 19 Unobtanium
HandheldComputer: 31 Batterij, 71 Printplaat, 47 Plastic
ElectrischeRacebaan: 31 AutoChassis, 89 Printplaat, 59 Plastic, 31 Batterij, 3 Wiel
QuadDrone: 59 Accu, 23 Plastic, 59 Printplaat
PikachuPlushy: 59 Batterij
Trampoline: 73 Schokdemper, 97 IJzer
BatmobileReplica: 71 BatmobileChassis, 17 Schokdemper, 7 Unobtanium, 73 Wiel
DanceDanceRevolutionMat: 79 Schokdemper, 53 Batterij
Printplaat: 41 Hars, 67 Koper, 41 Chip, 59 Led
Accu: 17 Batterij
Schokdemper: 17 IJzer, 89 Staal
Batterij: 41 Staal
BatmobileChassis: 3 AutoChassis, 19 Staal
AutoChassis: 13 IJzer
Wiel: 79 Rubber, 59 IJzer
Unobtanium: 29 IJzer, 29 Kryptonite`;

let numPartsUsed = parseInt(input),
    toys = getToys_v2(input).sort( ( a, b) => b.numParts - a.numParts),
	part1 = toys[0].numParts,
	part2 = findToyCombination( toys, 20, numPartsUsed).sort().join("");

console.log(`infi@nerd-pc ~/aoc2021 ▶ ${part1}`);
console.log(`infi@nerd-pc ~/aoc2021 ▶ ${part2}`);

function getToys_v1(input){
	/*
	create toys object:
	{
		toyName1 : { partName1: <number>, partName2, <number> ...},
		toyName2 : { partName2: <number>, partName3, <number> ...},
		...
	}
	note: partNames may also be toyNames
	*/
	toys = input.split(/\n/).slice(1).reduce( ( toys, desc) => {
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
	return Object.entries(toys)
		.map( ([ toyName, parts]) => ({
			toyName,
			numParts: Object.values(parts).reduce( ( sum, x) => sum + x)
		}));
}

/* 
regex's _and_ eval? this might be against the geneva conventions
converts partslist into numerical expression.
example:
73 Schokdemper, 97 IJzer ->
73*(17 IJzer, 89 Staal), 97 IJzer ->
73*(17+89)+97, which is then "eval"-ed
*/
function getToys_v2(input){
	const reToyInfo = /^\w+: .*/mg;
	input.match(reToyInfo).forEach( info => {
		let [ toyName, parts] = info.split(":"),
			reToyName = new RegExp( `(\\d+) ${toyName}\\b`, "g");
		if( reToyName.test(input) ){
			input = input.replace( reToyName, `$1*(${parts})`).replace( info, "");
		}
	});
	return input.match(reToyInfo).map( info => ({
		toyName: info.split(":")[0],
		numParts: eval(info.split(":")[1].replace( /,/g, "+").replace( /[a-z ]/ig, ""))
	}));
}

/*
IMPORTANT: requires that toys are sorted by number of parts in descending order
provides a massive speedup by short circuiting needless recursion calls
if numWrapped is large, only checking toys.length will result in terrible performance
for numWrapped = 70, only checking toys.length takes over 2 minutes to run
but by also checking against the avgParts runtime is sub 10ms!
even with numWrapped = 1,000,000, runtime is still ~1 second.
*/
function findToyCombination( toys, numWrapped, numPartsUsed){
    let avgParts = numPartsUsed / numWrapped;
    if(
        toys.length == 0 || // still have parts but no toys are left
        toys[0].numParts < avgParts || // cannot reach numPartsUsed, even with largest numPartsUsed left
        toys[toys.length-1].numParts > avgParts // cannot use less than numPartsUsed, even with smallest numPartsUsed left
    ) return null;
    if( toys[0].numParts == avgParts ) return [toys[0].toyName[0].repeat(numWrapped)];
    for( let n = 0; n < numWrapped; n++ ){
        let nP = n * toys[0].numParts;
        if( nP < numPartsUsed ){
            let combo = findToyCombination( toys.slice(1), numWrapped - n, numPartsUsed - nP);
            if( combo ) return n == 0 ? combo : [ ...combo, toys[0].toyName[0].repeat(n)];
        }
    }
    return null;
}
