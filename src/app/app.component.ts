import { Component, HostListener, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { SubscriptionManager } from './subscription-manager';

import { ClickService } from './_services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent extends SubscriptionManager implements OnInit {
  showPageTitle: boolean;

  constructor(
    private readonly clickService: ClickService,
    private readonly router: Router
  ) {
    super();
    document.title = 'Statistics Dashboard';
  }

  /** documentClick
   * - global document click handler
   * - push the clicked element to the clickService
   **/
  @HostListener('document:click', ['$event'])
  documentClick(event: { target: HTMLElement }): void {
    this.clickService.documentClickedTarget.next(event.target);
  }

  ngOnInit(): void {
    this.subs.push(
      this.router.events.subscribe(this.handleRouterEvent.bind(this))
    );
  }

  handleRouterEvent(e: Event): void {
    if (e instanceof NavigationEnd) {
      this.showPageTitle = e.url.indexOf('data') === -1;
    }
  }
}
