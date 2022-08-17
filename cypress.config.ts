import { defineConfig } from 'cypress'

export default defineConfig({
  blockHosts: ['*fonts.googleapis.com', '*fonts.gstatic.com'],
  screenshotsFolder: 'tmp/cypress-screenshots/',
  video: false,
  videosFolder: 'tmp/cypress-videos/',
  viewportHeight: 768,
  viewportWidth: 1024,
  env: {
    dataServer: 'http://127.0.0.1:3001',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:4280',
    excludeSpecPattern: ['tsconfig.json'],
  },
})
