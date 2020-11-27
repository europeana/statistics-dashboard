import { Subscription } from 'rxjs';
import { SubscriptionManager } from '.';

describe('SubscriptionManager', () => {
  let clss: SubscriptionManager;

  /** getUnsubscribable utility
   */
  const getUnsubscribable = (undef?: boolean): Subscription => {
    return (undef
      ? undefined
      : ({
          unsubscribe: jasmine.createSpy('unsubscribe'),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)) as Subscription;
  };

  beforeEach(() => {
    clss = new SubscriptionManager();
  });

  it('should create', () => {
    expect(clss).toBeTruthy();
  });

  it('should cleanup on destroy', () => {
    spyOn(clss, 'cleanup').and.callThrough();
    clss.ngOnDestroy();
    expect(clss.cleanup).toHaveBeenCalled();
  });

  it('should unsub on cleanup', () => {
    const s1 = getUnsubscribable();
    const s2 = getUnsubscribable();
    clss.subs = [s1, s2];
    clss.cleanup();
    expect(s1.unsubscribe).toHaveBeenCalled();
    expect(s2.unsubscribe).toHaveBeenCalled();
    expect(clss.subs.length).toEqual(0);
  });
});
