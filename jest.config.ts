import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets';

export default {
  ...createCjsPreset(),
  setupFilesAfterEnv: ['./setup-jest.ts'],
  testEnvironment: './FixJsDomEnvironment.ts',
   'transformIgnorePatterns': [
    'node_modules/^(@amcharts)',
    'node_modules/^(amcharts4)',
    'node_modules/^(am4map)'
  ],
  coverageReporters: ['lcov', 'html']
} satisfies Config;
