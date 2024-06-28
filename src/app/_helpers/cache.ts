import { AsyncSubject, connectable, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export class Cache<Value> {
  private observable?: Observable<Value>;

  constructor(private readonly sourceFn: () => Observable<Value>) {}

  /** get
  /* accessor for the observable variable
  */
  public get(refresh = false): Observable<Value> {
    // If already cached, return.
    if (this.observable && !refresh) {
      return this.observable;
    }

    // Create new observable.
    const observable = connectable(
      this.sourceFn().pipe(
        tap({
          error: () => this.clear()
        })
      ),
      {
        connector: () => new AsyncSubject<Value>(),
        resetOnDisconnect: false
      }
    );
    // Return local variable, as this.observable might be cleared by the connect call.
    this.observable = observable;
    observable.connect();
    return observable;
  }

  /** peek
  /* return the observable or undefined as an observable
  */
  public peek(): Observable<Value | undefined> {
    return this.observable ?? of(void 0);
  }

  /** clear
  /* sets the observable to undefined
  */
  public clear(): void {
    this.observable = undefined;
  }
}
