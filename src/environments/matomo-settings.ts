import { MaintenanceScheduleItemKey } from '@europeana/metis-ui-maintenance-utils';

const getEnvVar = (key: string): string | null => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (window as any).__env;
  return env ? env[key] : null;
};

const matomoHost = getEnvVar('matomoHost');
const matomoSiteId = getEnvVar('matomoSiteId');

export const matomoSettings = {
  matomoTrackerUrl: `${matomoHost}/matomo.php`,
  //matomoTrackerUrl: `${matomoHost}`,
  matomoScriptUrl: `${matomoHost}/matomo.js`,
  matomoSiteId: parseInt(matomoSiteId)
};
