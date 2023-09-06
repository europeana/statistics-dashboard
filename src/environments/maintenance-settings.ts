const getEnvVar = (key: string): string | null => {
  const env = (window as any).__env;
  return env ? env[key] : null;
};

export const maintenanceSettings = {
  intervalMaintenance: 60000,
  remoteEnvUrl: getEnvVar('remoteEnvUrl') || '',
  remoteEnvKey: getEnvVar('remoteEnvKey') || '',
  remoteEnv: {
    maintenanceMessage: ''
  }
};
