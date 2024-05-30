/*
  Temporary interceptor
*/
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { countryTargetData, targetData } from '../_data';

export function targetsInterceptor(): HttpInterceptorFn {
  const urlTargetMetadata = 'target-metadata';
  const urlCountryTargetData = 'country-target-data';

  const interceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
  ): Observable<HttpEvent<unknown>> => {
    return next(req).pipe(
      switchMap((event) => {
        if (req.url.includes(urlTargetMetadata)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (event as unknown as { body: any }).body = targetData;
        } else if (req.url.includes(urlCountryTargetData)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (event as unknown as { body: any }).body = countryTargetData;
        }
        return of(event);
      }),
      catchError(() => {
        if (req.url.includes(urlTargetMetadata)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (event as unknown as { body: any }).body = targetData;
        } else if (req.url.includes(urlCountryTargetData)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (event as unknown as { body: any }).body = countryTargetData;
        }
        return of(event) as unknown as Observable<HttpEvent<unknown>>;
      })
    );
  };
  return interceptor;
}
