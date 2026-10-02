import '@angular/localize/init';
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv();

// Stub Canvas API for amCharts / JSDOM environment
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Uint8ClampedArray() })),
  putImageData: jest.fn(),
  createImageData: jest.fn(),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0, height: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
})) as any;


// Intercept console errors to silence the fake JSDOM CSS parsing bugs
const originalConsoleError = console.error;

console.error = (...args: any[]) => {
  const errorMessage = args[0]?.toString() || '';

  // If the error message mentions the CSS stylesheet parser, swallow it quietly
  if (errorMessage.includes('Could not parse CSS stylesheet')) {
    return;
  }

  // Otherwise, pass normal framework/runtime errors through to the screen
  originalConsoleError(...args);
};
