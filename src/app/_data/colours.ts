const blue = '#49AECE';
const blueLight = '#B9DEEF';

const green = '#00FF00';
const greenForest = '#219D31';
const greenLight = '#A0B468';

const pinkBright = '#FF00FF';
const pinkLilac = '#C697FC';
const pinkLight = '#FFCCFF';

const yellowLight = '#FFC171';

const primarySequence = ['#0A72CC', '#E11D53', '#FFAE00'];
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
