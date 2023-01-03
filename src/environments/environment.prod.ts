const getEnvVar = (key: string): string | null => {
  const env = (window as any).__env;
  return env ? env[key] : null;
};

export const environment = {
  production: true,
  feedbackUrl: getEnvVar('feedbackUrl') || '',
  serverAPI: getEnvVar('serverAPI') || '',
  serverPortal: getEnvVar('serverPortal') || '',
  wskey: getEnvVar('wskey') || ''
};
