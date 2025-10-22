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
    this.notificationService.input({
      title: 'Create New Business',
      message: 'Enter your business details to get started',
      inputs: [
        {
          id: 'name',
          label: 'Business Name',
          type: 'text',
          placeholder: 'e.g., My Awesome Business',
          required: true
        },
        {
          id: 'slug',
          label: 'URL Slug',
          type: 'text',
          placeholder: 'e.g., my-awesome-business',
          required: true,
          pattern: '^[a-z0-9-]+$',
          patternMessage: 'Only lowercase letters, numbers, and hyphens allowed'
        }
      ],
      confirmText: 'Create Business',
      cancelText: 'Cancel'
    }).subscribe((result) => {
      if (!result) return; // User cancelled

      const { name, slug } = result;

      this.businessService.create({ name, slug }).subscribe({
        next: (response) => {
          console.log('Business created:', response);
          this.notificationService.success('Success!', `Business "${name}" created successfully`);
          // Navigate to edit page immediately
          this.router.navigate(['/business', response.business.id, 'edit']);
        },
        error: (error) => {
          console.error('Failed to create business:', error);
          this.notificationService.error('Failed to create business', error.error?.message || 'Unknown error');
        },
      });
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
