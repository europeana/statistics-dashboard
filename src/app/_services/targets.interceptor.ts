/*
  Temporary interceptor
*/
import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpHeaders,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { map, Observable, of, switchMap, tap } from 'rxjs';
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
          (event as unknown as { body: any }).body = targetData;
        } else if (req.url.includes(urlCountryTargetData)) {
          (event as unknown as { body: any }).body = countryTargetData;
        }
        return of(event);
      })
    );
  };
  return interceptor;
}
