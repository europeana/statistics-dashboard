const getEnvVar = (key: string): string => {
  return (window as any).__env[key];
};

export const environment = {
  production: true,
  feedbackUrl: getEnvVar('feedbackUrl') || '',
  serverAPI: getEnvVar('serverAPI') || '',
  serverPortal: getEnvVar('serverPortal') || '',
  wskey: getEnvVar('wskey') || ''
};
