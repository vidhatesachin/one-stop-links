import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-preview-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-toolbar.component.html',
  styleUrls: ['./preview-toolbar.component.css']
})
export class PreviewToolbarComponent implements OnInit {
  @Input() businessSlug = '';
  @Input() businessId = '';

  fullUrl = '';
  qrCodeDataUrl = '';
  showQrModal = false;
  copied = false;
  returnUrl = '/dashboard';
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.fullUrl = `${window.location.origin}/${this.businessSlug}`;
    // Initialize QR modal to be closed
    this.showQrModal = false;
    // Generate the QR code but don't show it yet
    this.generateQRCode();
    
    // Check if there's a returnUrl query parameter
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  generateQRCode(): void {
    // We'll use a dynamic import to load qrcode library only when needed
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(this.fullUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      .then(url => {
        this.qrCodeDataUrl = url;
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
      });
    });
  }

  copyUrlToClipboard(): void {
    navigator.clipboard.writeText(this.fullUrl)
      .then(() => {
        this.copied = true;
        this.notificationService.success('URL copied to clipboard!');
        setTimeout(() => {
          this.copied = false;
        }, 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        this.notificationService.error('Failed to copy URL to clipboard');
      });
  }

  downloadQRCode(): void {
    const link = document.createElement('a');
    link.download = `${this.businessSlug}-qrcode.png`;
    link.href = this.qrCodeDataUrl;
    link.click();
  }

  toggleQrModal(): void {
    this.showQrModal = !this.showQrModal;
  }
  
  closeQrModal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showQrModal = false;
  }

  editBusiness(): void {
    this.router.navigate(['/business', this.businessId, 'edit']);
  }

  closePreview(): void {
    // Check if this was opened in a new tab/window from edit page
    if (window.opener && !window.opener.closed) {
      // If we have a returnUrl, navigate the opener to that URL
      if (this.returnUrl && this.returnUrl !== '/dashboard') {
        // Navigate the opener window to the edit page
        window.opener.location.href = window.opener.location.origin + decodeURIComponent(this.returnUrl);
      }
      // Close the preview window/tab
      window.close();
    } else if (window.history.length <= 1 && this.returnUrl !== '/dashboard') {
      // If opened in new window with returnUrl, navigate to that URL
      this.router.navigateByUrl(this.returnUrl);
    } else if (window.history.length <= 1) {
      // If opened in new window without history, go to dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // Use browser's back navigation to return to previous page
      this.location.back();
    }
  }
}