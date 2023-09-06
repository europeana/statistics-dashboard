(function (window) {
  window.__env = window.__env || {};
  const env = window.__env;
  env.feedbackUrl = "${APP_FEEDBACK_URL}";
  env.serverAPI = "${APP_SERVER_API}";
  env.serverPortal = "${APP_SERVER_PORTAL}";
  env.wskey = "${APP_WS_KEY}";
  env.remoteEnvUrl = '${APP_REMOTE_ENV_URL}';
  env.remoteEnvKey = '${APP_REMOTE_ENV_KEY}';
})(this);
