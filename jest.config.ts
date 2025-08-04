import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets';

export default {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['./setup-jest.ts'],
  testEnvironment: './FixJSDOMEnvironment.ts',
   "transformIgnorePatterns": [
    "node_modules/^(@amcharts)",
    "node_modules/^(amcharts4)",
    "node_modules/^(am4map)"
  ]
} satisfies Config;
