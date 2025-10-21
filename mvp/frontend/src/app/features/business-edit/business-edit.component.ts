import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BusinessService } from '../../core/services/business.service';
import { Business } from '../../models/types';
import { LogoUploaderComponent } from '../../shared/logo-uploader/logo-uploader.component';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-business-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, LogoUploaderComponent],
  templateUrl: './business-edit.component.html',
  styleUrls: ['./business-edit.component.css'],
})
export class BusinessEditComponent implements OnInit {
  business: Business | null = null;
  loading = false;
  saving = false;
  
  // Form fields
  name = '';
  slug = '';
  bio = '';
  logo = '';
  showLogoUploader = false;
  theme = 'modern';
  primaryColor = '#3B82F6';
  published = false;

  // Links and contacts
  links: any[] = [];
  contacts: any[] = [];

  themes = [
    { value: 'modern', label: 'Modern', preview: 'Clean and minimal design' },
    { value: 'gradient', label: 'Gradient', preview: 'Colorful gradient backgrounds' },
    { value: 'glassmorphism', label: 'Glass', preview: 'Frosted glass effect' },
    { value: 'brutalist', label: 'Brutalist', preview: 'Bold and striking' },
    { value: 'neon', label: 'Neon', preview: 'Vibrant neon glow' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBusiness(id);
    }
  }

  loadBusiness(id: string): void {
    this.loading = true;
    this.businessService.getAll().subscribe({
      next: (response) => {
        const business = response.businesses.find(b => b.id === id);
        if (business) {
          this.business = business;
          this.name = business.name;
          this.slug = business.slug;
          this.bio = business.bio || '';
          this.logo = business.logo || '';
          this.theme = business.theme;
          this.primaryColor = business.primaryColor;
          this.published = business.published;
          this.links = business.links || [];
          this.contacts = business.contacts || [];
        } else {
          this.notificationService.error('Business not found');
          this.router.navigate(['/dashboard']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load business:', error);
        this.notificationService.error('Failed to load business');
        this.router.navigate(['/dashboard']);
      },
    });
  }

  addLink(): void {
    this.links.push({
      id: `temp-${Date.now()}`,
      title: '',
      url: '',
      isActive: true,
      order: this.links.length,
    });
  }

  removeLink(index: number): void {
    this.notificationService.confirm('Remove this link?').subscribe((confirmed) => {
      if (confirmed) {
        this.links.splice(index, 1);
        // Reorder
        this.links.forEach((link, i) => link.order = i);
      }
    });
  }

  addContact(): void {
    this.contacts.push({
      id: `temp-${Date.now()}`,
      platform: 'email',
      value: '',
      isActive: true,
      order: this.contacts.length,
    });
  }

  removeContact(index: number): void {
    this.notificationService.confirm('Remove this contact?').subscribe((confirmed) => {
      if (confirmed) {
        this.contacts.splice(index, 1);
        // Reorder
        this.contacts.forEach((contact, i) => contact.order = i);
      }
    });
  }

  openLogoUploader(): void {
    this.showLogoUploader = true;
  }

  onLogoUploaded(cloudinaryUrl: string): void {
    this.logo = cloudinaryUrl;
    this.showLogoUploader = false;
  }

  onUploadCancelled(): void {
    this.showLogoUploader = false;
  }

  removeLogo(): void {
    this.notificationService.confirm('Remove the current logo?').subscribe((confirmed) => {
      if (confirmed) {
        this.logo = '';
      }
    });
  }

  saveBusiness(): void {
    if (!this.business) return;

    if (!this.name.trim()) {
      this.notificationService.warning('Business name is required');
      return;
    }

    if (!this.slug.trim() || !/^[a-z0-9-]+$/.test(this.slug)) {
      this.notificationService.warning('Slug must contain only lowercase letters, numbers, and hyphens');
      return;
    }

    // Validate logo is present
    if (!this.logo) {
      this.notificationService.warning('Business logo is required. Please upload a logo.');
      return;
    }

    this.saving = true;

    const data = {
      name: this.name,
      slug: this.slug,
      bio: this.bio,
      logo: this.logo, // Cloudinary URL or existing URL
      theme: this.theme,
      primaryColor: this.primaryColor,
      published: this.published,
      links: this.links.map((link, index) => ({
        ...link,
        order: index,
        isActive: true,
      })),
      contacts: this.contacts.map((contact, index) => ({
        ...contact,
        order: index,
        isActive: true,
      })),
    };

    this.businessService.update(this.business.id, data).subscribe({
      next: () => {
        this.notificationService.success('Business updated successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Failed to update business:', error);
        this.notificationService.error('Failed to update: ' + (error.error?.message || 'Unknown error'));
        this.saving = false;
      },
    });
  }

  previewBusiness(): void {
    if (this.business) {
      // Create an absolute URL based on the current origin with preview mode parameter
      const baseUrl = window.location.origin;
      const currentPath = encodeURIComponent(this.router.url);
      window.open(`${baseUrl}/${this.business.slug}?mode=preview&returnUrl=${currentPath}`, '_blank');
    }
  }

  cancel(): void {
    this.notificationService.confirm('Discard changes?').subscribe((confirmed) => {
      if (confirmed) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  deleteBusiness(): void {
    if (!this.business) return;

    const businessId = this.business.id;
    const businessName = this.business.name;

    this.notificationService.confirm(`Are you sure you want to delete "${businessName}"? This cannot be undone.`).subscribe((confirmed) => {
      if (confirmed) {
        this.businessService.delete(businessId).subscribe({
          next: () => {
            this.notificationService.success('Business deleted');
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            console.error('Failed to delete:', error);
            this.notificationService.error('Failed to delete business');
          },
        });
      }
    });
  }
}
