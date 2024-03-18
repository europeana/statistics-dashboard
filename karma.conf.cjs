// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      'karma-coverage',
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-jasmine-html-reporter',
      '@angular-devkit/build-angular/plugins/karma'
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      type: "lcov",
      dir: "coverage/"
    },
    angularCli: {
      environment: 'dev'
    },
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    preprocessors: {
      "src/app/**/*.ts": ["coverage"]
    },
    reporters: ["progress", "kjhtml", "coverage"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browserConsoleLogOptions: {
      level: "log"
    },
    autoWatch: true,
    browsers: ["ChromeHeadlessNoSandbox"],
    singleRun: true,
    restartOnFileChange: true,
    customLaunchers: {
       ChromeHeadlessNoSandbox: {
         base: 'ChromeHeadless',
         flags: ['--no-sandbox', '--no-proxy-server', '--user-data-dir=./karma-chrome']
       }
     }
  });
};
