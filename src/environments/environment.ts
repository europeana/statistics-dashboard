/** environment
/*  settings that can be used throughout the entire application
 **/

const getEnvVar = (key: string): string => {
  return (window as any).__env[key];
};

export const environment = {
  production: false,
  feedbackUrl: getEnvVar('feedbackUrl') || '',
  serverAPI: getEnvVar('serverAPI') || '',
  serverPortal: getEnvVar('serverPortal') || '',
  wskey: getEnvVar('wskey') || ''
};
