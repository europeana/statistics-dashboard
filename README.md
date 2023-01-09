# Statistics Dashboard

[![Build Status](https://travis-ci.org/europeana/statistics-dashboard.svg?branch=develop)](https://travis-ci.org/europeana/statistics-dashboard)

A visualisation utility for Europeana API data.

## Getting started

Make sure you have `node` version 14.7.8 and `npm` version 6.x:

    node --version
    npm --version

Get the `npm` dependencies:

    npm install

## Development environment

To facilitate containerisation the standard angular way of setting environment variables has been amended.

The standard `environment.ts` file exists under `src/app/environments/` but its contents define a function that can load variables from an external source, in this case `src/assets/env.js`.

The file `src/assets/env.js` should therefore be modified before starting the development server.

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

## Docker

To make a (parameterised) docker image of the app first run this command:

`npm run dist-localised`

and then copy the output of that command (from the dist directory) into a docker nginx image:

`docker build -t statistics-dashboard-app-image:v2.0 .`

The image runtime configuration is only set on container startup, so environment variables have to be passed when it's run.  Here they are passed using the project `env_file`:

`docker run -it --rm -d -p 80:80  --env-file=env_file --name stats-db statistics-dashboard-app-image:v2.0`

As with the `src/assets/env.js` file for the development server, the `env_file` file should be adjusted before the nginx server is started.

Note: it may be useful to comment out the line `return 301 https://$host$request_uri;` in `nginx-docker.conf` when testing docker locally or in environments that haven't been configured for https.
