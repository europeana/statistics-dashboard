/** environment
/*  settings that can be used throughout the entire application
 **/

export const environment = {
  production: false,

  serverAPI: 'https://api.europeana.eu/record/v2/search.json',
  serverPortal: 'https://www.europeana.eu/en/search',
  intervalStatus: 2500,
  intervalStatusMax: 60000 * 9.5,
  wskey: 'api2demo'
};
