import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppToolbarComponent } from './shared/app-toolbar/app-toolbar.component';
import { NotificationComponent } from './shared/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppToolbarComponent, NotificationComponent],
  template: `
    <app-toolbar></app-toolbar>
    <router-outlet></router-outlet>
    <app-notification></app-notification>
  `,
})
export class AppComponent {}
