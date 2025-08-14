import JSDOMEnvironment from 'jest-environment-jsdom';

// Mock SVGPathElement class
class SVGPathElement {}

export default class FixJsDomEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    this.global.URL.createObjectURL = (_) => '';
    this.global.URL.revokeObjectURL = (_) => {}

    Object.defineProperty(this.global.navigator, 'clipboard', {
      value: {
        writeText: async () => {},
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.global.SVGPathElement = SVGPathElement as any;

    // https://github.com/facebook/jest/blob/v29.4.3/website/versioned_docs/version-29.4/Configuration.md#testenvironment-string
    // FIXME https://github.com/jsdom/jsdom/issues/3363
    this.global.structuredClone = structuredClone;

    // https://gist.github.com/ahmad2smile/068e481d65b0cb82a7c9b9f1bc9d0ee0
    Object.defineProperty(this.global.SVGSVGElement.prototype, 'createSVGMatrix', {
      writable: true,
      value: () => ({
        martix: () => [[]],
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        e: 0,
        f: 0,
        flipX: () => global.SVGSVGElement,
        flipY: () => global.SVGSVGElement,
        inverse: () => global.SVGSVGElement,
        multiply: () => global.SVGSVGElement,
        rotate: () => {
            return {
              translate: () => {
                return {
                  rotate: ()=>{}
                };
              }
            };
        },
        rotateFromVector: () => global.SVGSVGElement,
        scale: () => global.SVGSVGElement,
        scaleNonUniform: () => global.SVGSVGElement,
        skewX: () => global.SVGSVGElement,
        skewY: () => global.SVGSVGElement,
        translate: () => {
          return {
            multiply: () => {
              return {
                multiply: () => global.SVGSVGElement
              };
            }
          };
        }
      }),
    });

    Object.defineProperty(this.global.SVGSVGElement.prototype, 'createSVGPoint', {
      writable: true,
      value: () => ({
        x: 0,
        y: 0,
        matrixTransform: () => ({
          x: 0,
          y: 0,
        }),
      }),
    });

    Object.defineProperty(this.global.SVGSVGElement.prototype, 'createSVGTransform', {
      writable: true,
      value: () => ({
        angle: 0,
        matrix: {
          a: 1,
          b: 0,
          c: 0,
          d: 1,
          e: 0,
          f: 0,
          multiply: ()=> {},
        },
        setMatrix: ()=> {},
        setTranslate: ()=> {},
      }),
    });
  }
}
