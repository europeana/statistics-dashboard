import { defineConfig } from 'cypress'

export default defineConfig({
  blockHosts: ['*://googleapis.com', '*://gstatic.com'],
  screenshotsFolder: 'tmp/cypress-screenshots/',
  video: false,
  videosFolder: 'tmp/cypress-videos/',
  viewportHeight: 768,
  viewportWidth: 1024,
  env: {
    dataServer: 'http://127.0.0.1:3001',
  },
  e2e: {
    setupNodeEvents(on, config) {
      return config;
    },
    baseUrl: 'http://localhost:4280',
    excludeSpecPattern: ['tsconfig.json'],
  },
})
