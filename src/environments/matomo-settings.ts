import { getEnvVar } from './environment-utils';

const matomoHost = getEnvVar('matomoHost');
const matomoSiteId = getEnvVar('matomoSiteId');

type PAQ = Array<Array<string>>;

export const matomoSettings = {
  matomoTrackerUrl: `//stats.europeana.eu/matomo.php`,
  //matomoTrackerUrl: `${matomoHost}/matomo.php`,
  matomoScriptUrl: `${matomoHost}/matomo.js`,
  matomoSiteId: parseInt(`${matomoSiteId}`),
  getPAQ: (): PAQ => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any)['_paq'] as PAQ;
  }
};

console.log('export hard coded: ' + matomoSettings.matomoTrackerUrl)
