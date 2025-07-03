import * as am4maps from '@amcharts/amcharts4/maps';

const fakeAdapter = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  add: (): void => {}
};

const fakeEvents = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disableType: (): void => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  on: (): void => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  once: (): void => {}
};

export const MockMapChart = {
  createChild: (): unknown => {
    return {
      background: {},
      events: fakeEvents,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hide: (): void => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      padding: (): void => {},
      valueAxis: {
        axisRanges: {
          create: (): unknown => {
            return {
              label: {
                adapter: fakeAdapter
              }
            };
          }
        },
        renderer: {
          labels: {
            template: {
              adapter: fakeAdapter
            }
          }
        }
      }
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispatchImmediately: (): void => {},
  series: {
    push: (): unknown => {
      return {
        events: fakeEvents,
        getPolygonById: (): unknown => {
          return {};
        },
        heatRules: [],
        include: false,
        data: [],

        mapPolygons: {
          template: {
            adapter: fakeAdapter,
            events: fakeEvents,
            states: {
              create: (): unknown => {
                return {
                  properties: {}
                };
              }
            }
          }
        },
        tooltip: (): unknown => {
          return {};
        },
        useGeodata: false
      };
    }
  },
  chartContainer: {
    background: {
      events: fakeEvents
    }
  },
  seriesContainer: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    dispatchImmediately: (): void => {},
    events: fakeEvents,
    resizable: true
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  show: (): void => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  hide: (): void => {},
  events: fakeEvents,

  zoomToRectangle: (): unknown => {
    return {
      events: fakeEvents
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  animate: (): void => {}
} as unknown as am4maps.MapChart;
