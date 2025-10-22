import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-toolbar.component.html',
  styleUrls: ['./app-toolbar.component.css']
})
export class AppToolbarComponent implements OnInit {
  user$ = this.authService.currentUser$;
  showToolbar = false;
  isPreviewMode = false;
  showProfileMenu = false;
  currentRoute = '';
  private hasLoadedUser = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Load user if authenticated but not loaded yet
    if (this.authService.isAuthenticated() && !this.authService.getCurrentUser()) {
      this.authService.loadUser().subscribe(() => {
        this.hasLoadedUser = true;
        this.updateToolbarVisibility();
      });
    }

    // Subscribe to user authentication state
    this.authService.currentUser$.subscribe(() => {
      this.updateToolbarVisibility();
    });

    // Check if we should show the toolbar based on the current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects;
      this.updateToolbarVisibility();
    });

    // Initial check
    this.updateToolbarVisibility();
  }

  updateToolbarVisibility(): void {
    const url = this.router.url;
    
    // Don't show toolbar on landing page, login, or auth callback
    const hideOnRoutes = ['/', '/login', '/auth/callback'];
    const isHiddenRoute = hideOnRoutes.some(route => url === route || url.startsWith(route + '?'));
    
    // Check if in preview mode
    this.isPreviewMode = url.includes('mode=preview');
    
    // Check if on a preview/slug page (any route that's not /dashboard, /edit, /login, /auth, etc.)
    const isPreviewPage = !url.startsWith('/dashboard') && 
                          !url.startsWith('/edit') && 
                          !url.startsWith('/login') && 
                          !url.startsWith('/auth') && 
                          !url.startsWith('/settings') &&
                          url !== '/';
    
    // Show toolbar if user is authenticated (has token) and not on hidden routes
    // This will show the toolbar immediately on refresh, even before user data is fully loaded
    const isAuthenticated = this.authService.isAuthenticated();
    
    // Show toolbar if authenticated and not on hidden routes, preview mode, or preview pages
    this.showToolbar = isAuthenticated && !isHiddenRoute && !this.isPreviewMode && !isPreviewPage;
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  navigateToDashboard(): void {
    this.closeProfileMenu();
    this.router.navigate(['/dashboard']);
  }

  navigateToSettings(): void {
    this.closeProfileMenu();
    // TODO: Navigate to settings page when created
    this.notificationService.info('Settings page coming soon!');
  }

  logout(): void {
    this.closeProfileMenu();
    this.authService.logout();
    this.router.navigate(['/']);
  }

  goBack(): void {
    // If on edit page, always go to dashboard
    if (this.isEditPage()) {
      this.router.navigate(['/dashboard']);
    } else {
      window.history.back();
    }
  }

  isEditPage(): boolean {
    return this.router.url.includes('/edit');
  }

  isDashboardPage(): boolean {
    return this.router.url === '/dashboard';
  }

  createBusiness(): void {
    // Navigate to dashboard and trigger create business action
    this.router.navigate(['/dashboard'], { 
      queryParams: { action: 'create' } 
    });
  }
}
