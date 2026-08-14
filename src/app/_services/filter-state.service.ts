import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  // A clean, shared global signal that any component can read/write reactively
  includeCTZero = signal<boolean>(false);
}
