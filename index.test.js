const rewire = require('rewire');
const app = rewire('./index.js');

findDates = app.__get__('findDates');

test.each([
	[`De pagadder zal terug open zijn vanaf maandag 1 maart 21.`, ['1 maart 21']],
	[`De pagadder zal terug open zijn vanaf maandag 01 februari 2021.`, ['01 februari 2021']],
	[`De pagadder zal gesloten zijn van maandag 25 januari 2021 tot en met vrijdag 29 januari 2021.`, ['25 januari 2021', '29 januari 2021']],
])('%s should contain date %i', (text, date) => {
	expect(findDates(text)).toEqual(date);
});

