import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BusinessService } from '../../core/services/business.service';
import { NotificationService } from '../../core/services/notification.service';
import { Business } from '../../models/types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  businesses: Business[] = [];
  user$ = this.authService.currentUser$;

  constructor(
    private authService: AuthService,
    private businessService: BusinessService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBusinesses();
    
    // Check if we need to trigger create business action
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create') {
        // Clear the query param and trigger create
        this.router.navigate(['/dashboard'], { queryParams: {} });
        setTimeout(() => this.createBusiness(), 100);
      }
    });
  }

  loadBusinesses(): void {
    this.businessService.getAll().subscribe({
      next: (response) => {
        this.businesses = response.businesses;
      },
      error: (error) => {
        console.error('Failed to load businesses:', error);
      },
    });
  }

  createBusiness(): void {
    // TODO: Open a modal or navigate to a form to create business
    // For now, let's create a simple prompt-based flow
    const name = prompt('Enter business name:');
    if (!name) return;

    const slug = prompt('Enter URL slug (e.g., mybusiness):');
    if (!slug) return;

    this.businessService.create({ name, slug }).subscribe({
      next: (response) => {
        console.log('Business created:', response);
        this.loadBusinesses(); // Reload the list
      },
      error: (error) => {
        console.error('Failed to create business:', error);
        this.notificationService.error('Failed to create business: ' + (error.error?.message || 'Unknown error'));
      },
    });
  }

  editBusiness(business: Business): void {
    // Navigate to edit page
    this.router.navigate(['/business', business.id, 'edit']);
  }

  viewBusiness(business: Business): void {
    // Navigate to public preview page with preview mode parameter
    const currentPath = encodeURIComponent(this.router.url);
    this.router.navigate(['/', business.slug], {
      queryParams: { 
        mode: 'preview',
        returnUrl: currentPath
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
