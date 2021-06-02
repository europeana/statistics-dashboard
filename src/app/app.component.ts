import { Component, OnInit } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { SubscriptionManager } from './subscription-manager';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends SubscriptionManager implements OnInit {
  showPageTitle: boolean;

  constructor(private readonly router: Router) {
    super();
    document.title = 'Statistics Dashboard';
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
