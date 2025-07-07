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

const fakeTemplate = {
  adapter: fakeAdapter,
  events: fakeEvents,
  states: {
    create: (): unknown => {
      return {
        properties: {}
      };
    }
  }
};

const fakeAxis = {
  axisRanges: {
    create: (): unknown => {
      return {
        label: {
          adapter: fakeAdapter
        }
      };
    },
    getIndex: (): unknown => {
      return {
        value: 0,
        label: {
          text: ''
        }
      };
    }
  },
  renderer: {
    labels: {
      template: fakeTemplate
    }
  }
};

const fakeSeries = {
  dataItem: {
    values: {
      value: {
        low: 0
      }
    }
  },
  push: (): unknown => {
    return {
      events: fakeEvents,
      getPolygonById: (id: string): unknown => {
        return id === 'EU'
          ? null
          : {
              polygon: {
                morpher: {
                  morphToPolygon: (): unknown => {
                    return {
                      events: fakeEvents
                    };
                  },
                  morphToCircle: (): unknown => {
                    return {
                      events: fakeEvents
                    };
                  }
                }
              }
            };
      },
      heatRules: [],
      include: false,
      data: [],

      mapPolygons: {
        template: fakeTemplate,
        getIndex: (): unknown => {
          return {
            polygon: {}
          };
        }
      },
      tooltip: (): unknown => {
        return {};
      },
      useGeodata: false
    };
  }
};

export const MockMapChart = {
  createChild: (): unknown => {
    // legend
    return {
      background: {},
      events: fakeEvents,
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hide: (): void => {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      padding: (): void => {},
      valueAxis: fakeAxis,
      series: fakeSeries,
      numberFormatter: {
        format: () => 'formatted'
      }
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  dispatchImmediately: (): void => {},
  series: fakeSeries,
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
