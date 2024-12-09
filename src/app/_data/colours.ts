const blue = '#49AECE';
const blueLight = '#B9DEEF';

const green = '#00FF00';
const greenForest = '#219D31';
const greenLight = '#A0B468';

const pinkBright = '#FF00FF';
const pinkLilac = '#C697FC';
const pinkLight = '#FFCCFF';

const yellowLight = '#FFC171';

export const colourStatsBlue = '#0A72CC';

const colour3dBlue = colourStatsBlue;
const colourHqRed = '#E11D53';
const colourTotalYellow = '#FFAE00';

export const colourHeatmapBlue = '#1676aa'; // eu-blue
export const colourHeatmapRed = colourHqRed;
export const colourHeatmapYellow = colourTotalYellow;

const primarySequence = [colour3dBlue, colourHqRed, colourTotalYellow];
//const primarySequence = ['#0A72CC', '#E11D53', '#FFAE00'];

const secondarySequence = [greenForest, pinkLight, blue];
const tertiarySequence = [pinkBright, blueLight, green];
const lastSequence = [yellowLight, greenLight, pinkLilac];

export const colours = [...primarySequence, '#219D31'];

export const colourGrid = [
  ...primarySequence,
  ...secondarySequence,
  ...tertiarySequence,
  ...lastSequence
];
