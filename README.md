# Statistics Dashboard

[![Build Status](https://travis-ci.org/europeana/statistics-dashboard.svg?branch=develop)](https://travis-ci.org/europeana/statistics-dashboard)

A visualisation utility for Europeana API data.

## Getting started

Make sure you have `node` version 12 and `npm` version 6.x:

    node --version
    npm --version

Get the `npm` dependencies:

    npm install

## Development server

Run `npm run start` for a dev server. Navigate to [http://localhost:4200/](http://localhost:4200/). The app will automatically reload if you change any of the source files.

## Branches and Pull Requests

The main branch for development is the `develop` branch. But do NOT use this branch directly! Use a new branch for features/bugs and give it a descriptive name containing the user story code, like:

    feat/MET-1535-chart-styling
    bug/MET-3245-dashboard-not-loading

If you push a branch or commit to GitHub, it will automatically be tested by Travis CI. This will take about 5 mins and the results will be shown in GitHub, e.g. in the pull request page.

Make a pull request in GitHub for code review and merging.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

To run the unit tests in development (watch mode):

    npm run test:dev


### E2E tests (development)

To run the cypress tests:

    npm run test:e2e


To run the cypress tests in development (watch mode), start the dev server in one terminal window:

    npm run start:ci

...start the dev data server in another terminal window:

    npm run start:ci-data

...and then run cypress in another window:

    npm run cypress

### Accessibility tests (development)

To run the accessibility tests:

    npm run test:accessibility

## Deploy

We use jenkins to deploy. Make sure you can access [https://jenkins.eanadev.org/](https://jenkins.eanadev.org/) and use the following jobs:

- `statistics-dashboard-test`
- `statistics-dashboard-acceptance`
