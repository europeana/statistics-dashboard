import { Observable, of, throwError } from 'rxjs';
import { gatherError, gatherValues } from '@europeana/metis-ui-test-utils';
import { Cache } from '.';

function createCacheFn(): () => Observable<number> {
  let i = 1;
  return jasmine.createSpy().and.callFake(() => of(i++));
}

describe('single cache', () => {
  it('should get the value', () => {
    const fn = createCacheFn();
    const cache = new Cache<number>(fn);
    expect(gatherValues(cache.get())).toEqual([1]);
    expect(gatherValues(cache.get())).toEqual([1]);
    expect(gatherValues(cache.get())).toEqual([1]);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should refresh the value', () => {
    const fn = createCacheFn();
    const cache = new Cache<number>(fn);
    expect(gatherValues(cache.get())).toEqual([1]);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(gatherValues(cache.get(true))).toEqual([2]);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(gatherValues(cache.get())).toEqual([2]);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(gatherValues(cache.get(true))).toEqual([3]);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should clear the value', () => {
    const fn = createCacheFn();
    const cache = new Cache<number>(fn);
    expect(gatherValues(cache.get())).toEqual([1]);
    cache.clear();
    expect(gatherValues(cache.get())).toEqual([2]);
    expect(gatherValues(cache.get())).toEqual([2]);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not cache an error, but clear the cache', () => {
    const error = new Error('wrong');
    const fn = jasmine.createSpy().and.callFake(() => throwError(error));
    const cache = new Cache<number>(fn);
    new Array(3).fill(null).map(() => {
      expect(gatherError(cache.get())).toEqual(error);
    });
    // Must be called 3 times, indicating that error was not cached.
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should peek', () => {
    const fn = createCacheFn();
    const cache = new Cache<number>(fn);
    expect(gatherValues(cache.peek())).toEqual([undefined]);
    expect(gatherValues(cache.get())).toEqual([1]);
    expect(gatherValues(cache.peek())).toEqual([1]);
    expect(gatherValues(cache.get(true))).toEqual([2]);
    expect(gatherValues(cache.peek())).toEqual([2]);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
