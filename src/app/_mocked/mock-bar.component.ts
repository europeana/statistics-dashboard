import { Component } from '@angular/core';

@Component({
  selector: 'app-bar-chart',
  template: ''
})
export class MockBarComponent {
  constructor() {
    console.log('create MockBarComponent');
  }

  addSeries(_): void {
    console.log('addSeries');
  }

  getSvgData(): Promise<string> {
    return new Promise((resolve) => {
      resolve('svg');
    });
  }
}
