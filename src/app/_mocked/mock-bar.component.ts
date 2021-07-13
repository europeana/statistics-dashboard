import { Component } from '@angular/core';

@Component({
  selector: 'app-bar-chart',
  template: ''
})
export class MockBarComponent {
  addSeries(_): void {
    console.log('MockBarComponent.addSeries');
  }

  drawChart(): void {
    console.log('MockBarComponent.drawChart');
  }

  getChartSeriesCount(): number {
    return 0;
  }

  getSvgData(): Promise<string> {
    return new Promise((resolve) => {
      resolve('svg');
    });
  }
}
