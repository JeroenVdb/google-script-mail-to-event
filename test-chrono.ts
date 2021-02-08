import * as chrono from 'chrono-node';

const blobOfText = `
	Deze zin gaat over de dag 27 januari 2021. Maar een latere over 1 februari 2020.
	En deze over 1 maart 2021.
`
const blobOfTextTwo = `
	Deze zin gaat over de dag.
`

const result = chrono.nl.parse(blobOfText);
const resultTwo = chrono.nl.parse(blobOfTextTwo);

console.log(JSON.stringify(result));
console.log(JSON.stringify(resultTwo));
