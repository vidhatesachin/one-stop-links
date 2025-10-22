import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BusinessService } from '../../core/services/business.service';
import { Business } from '../../models/types';
import { PreviewToolbarComponent } from '../../shared/preview-toolbar/preview-toolbar.component';

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [CommonModule, PreviewToolbarComponent],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css'],
})
export class PreviewComponent implements OnInit {
  business: Business | null = null;
  loading = true;
  error = false;
  currentYear = new Date().getFullYear();
  isPreviewMode = false;

  constructor(
    private route: ActivatedRoute,
    private businessService: BusinessService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      this.loadBusiness(slug);
    });
    
    // Check if this is being viewed from preview mode
    this.route.queryParams.subscribe(params => {
      this.isPreviewMode = params['mode'] === 'preview';
    });
  }

  loadBusiness(slug: string): void {
    this.businessService.getBySlug(slug).subscribe({
      next: (response) => {
        this.business = response.business;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  getThemeClasses(): string {
    return 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200';
  }

  getContactIconClass(platform: string): string {
    const classes: Record<string, string> = {
      whatsapp: 'whatsapp',
      email: 'email',
      phone: 'phone',
      map: 'map-marker-alt',
      location: 'location',
    };
    return classes[platform.toLowerCase()] || '';
  }

  getLinkButtonClass(title: string): string {
    const titleLower = title.toLowerCase();
    const classes: Record<string, string> = {
      instagram: 'instagram',
      facebook: 'facebook',
      youtube: 'youtube',
      pinterest: 'pinterest',
      website: 'website',
      linkedin: 'linkedin',
      twitter: 'twitter',
      google: 'google-business',
      tiktok: 'tiktok',
      snapchat: 'snapchat',
      whatsapp: 'whatsapp',
      telegram: 'telegram',
      discord: 'discord',
      github: 'github',
      dribbble: 'dribbble',
      behance: 'behance',
      medium: 'medium',
      spotify: 'spotify',
      reddit: 'reddit',
      twitch: 'twitch',
      email: 'email',
      phone: 'phone',
    };
    
    for (const key in classes) {
      if (titleLower.includes(key)) {
        return classes[key];
      }
    }
    return 'website';
  }

  adjustColor(color: string, percent: number): string {
    // Lighten or darken a hex color
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  }

  // Separate quick contacts (WhatsApp, Email, Phone, Location) for top row
  getQuickContacts(): any[] {
    if (!this.business?.contacts) return [];
    const quickPlatforms = ['whatsapp', 'email', 'phone', 'location', 'map'];
    return this.business.contacts.filter(c => 
      quickPlatforms.includes(c.platform.toLowerCase())
    ).slice(0, 4);
  }

  // Get remaining contacts for card grid
  getAdditionalContacts(): any[] {
    if (!this.business?.contacts) return [];
    const quickPlatforms = ['whatsapp', 'email', 'phone', 'location', 'map'];
    return this.business.contacts.filter(c => 
      !quickPlatforms.includes(c.platform.toLowerCase())
    );
  }

  getContactButtonClass(platform: string): string {
    const classes: Record<string, string> = {
      whatsapp: 'bg-green-500 hover:bg-green-600',
      email: 'bg-red-500 hover:bg-red-600',
      phone: 'bg-blue-500 hover:bg-blue-600',
      location: 'bg-red-600 hover:bg-red-700',
      map: 'bg-red-600 hover:bg-red-700',
    };
    return classes[platform.toLowerCase()] || 'bg-gray-500 hover:bg-gray-600';
  }

  getContactSVGIcon(platform: string): string {
    const platformLower = platform.toLowerCase();
    
    // WhatsApp
    if (platformLower.includes('whatsapp') || platformLower.includes('wa')) {
      return '<i class="fab fa-whatsapp"></i>';
    }
    
    // Email
    if (platformLower.includes('email') || platformLower.includes('mail')) {
      return '<i class="fas fa-envelope"></i>';
    }
    
    // Phone
    if (platformLower.includes('phone') || platformLower.includes('call') || platformLower.includes('mobile')) {
      return '<i class="fas fa-phone"></i>';
    }
    
    // Location
    if (platformLower.includes('location') || platformLower.includes('map') || platformLower.includes('address')) {
      return '<i class="fas fa-location-dot"></i>';
    }
    
    // Default icon
    return '<i class="fas fa-link"></i>';
  }

  getSocialIcon(title: string): string {
    const titleLower = title.toLowerCase();
    
    // Instagram
    if (titleLower.includes('instagram') || titleLower.includes('insta')) {
      return '<i class="fab fa-instagram"></i>';
    }
    
    // Facebook
    if (titleLower.includes('facebook') || titleLower.includes('fb')) {
      return '<i class="fab fa-facebook"></i>';
    }
    
    // YouTube
    if (titleLower.includes('youtube') || titleLower.includes('yt')) {
      return '<i class="fab fa-youtube"></i>';
    }
    
    // Twitter/X
    if (titleLower.includes('twitter') || titleLower.includes('x.com')) {
      return '<i class="fab fa-twitter"></i>';
    }
    
    // LinkedIn
    if (titleLower.includes('linkedin')) {
      return '<i class="fab fa-linkedin"></i>';
    }
    
    // TikTok
    if (titleLower.includes('tiktok')) {
      return '<i class="fab fa-tiktok"></i>';
    }
    
    // Pinterest
    if (titleLower.includes('pinterest')) {
      return '<i class="fab fa-pinterest"></i>';
    }
    
    // Snapchat
    if (titleLower.includes('snapchat') || titleLower.includes('snap')) {
      return '<i class="fab fa-snapchat"></i>';
    }
    
    // WhatsApp
    if (titleLower.includes('whatsapp') || titleLower.includes('wa')) {
      return '<i class="fab fa-whatsapp"></i>';
    }
    
    // Telegram
    if (titleLower.includes('telegram')) {
      return '<i class="fab fa-telegram"></i>';
    }
    
    // Discord
    if (titleLower.includes('discord')) {
      return '<i class="fab fa-discord"></i>';
    }
    
    // GitHub
    if (titleLower.includes('github')) {
      return '<i class="fab fa-github"></i>';
    }
    
    // Dribbble
    if (titleLower.includes('dribbble')) {
      return '<i class="fab fa-dribbble"></i>';
    }
    
    // Behance
    if (titleLower.includes('behance')) {
      return '<i class="fab fa-behance"></i>';
    }
    
    // Medium
    if (titleLower.includes('medium')) {
      return '<i class="fab fa-medium"></i>';
    }
    
    // Spotify
    if (titleLower.includes('spotify')) {
      return '<i class="fab fa-spotify"></i>';
    }
    
    // Reddit
    if (titleLower.includes('reddit')) {
      return '<i class="fab fa-reddit"></i>';
    }
    
    // Twitch
    if (titleLower.includes('twitch')) {
      return '<i class="fab fa-twitch"></i>';
    }
    
    // Google Reviews / Google
    if (titleLower.includes('google')) {
      return '<i class="fab fa-google"></i>';
    }
    
    // Website / Globe
    if (titleLower.includes('website') || titleLower.includes('web') || titleLower.includes('site') || titleLower.includes('portfolio')) {
      return '<i class="fas fa-globe"></i>';
    }
    
    // Email
    if (titleLower.includes('email') || titleLower.includes('mail')) {
      return '<i class="fas fa-envelope"></i>';
    }
    
    // Phone
    if (titleLower.includes('phone') || titleLower.includes('call') || titleLower.includes('mobile')) {
      return '<i class="fas fa-phone"></i>';
    }
    
    // Location
    if (titleLower.includes('location') || titleLower.includes('map') || titleLower.includes('address')) {
      return '<i class="fas fa-location-dot"></i>';
    }
    
    // Default link icon
    return '<i class="fas fa-link"></i>';
  }

  getSocialCardClass(title: string): string {
    const titleLower = title.toLowerCase();
    
    // Define brand colors
    const classes: Record<string, string> = {
      instagram: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white shadow-lg hover:shadow-2xl',
      facebook: 'bg-[#1877F2] text-white shadow-lg hover:shadow-2xl',
      youtube: 'bg-[#FF0000] text-white shadow-lg hover:shadow-2xl',
      twitter: 'bg-[#1DA1F2] text-white shadow-lg hover:shadow-2xl',
      linkedin: 'bg-[#0A66C2] text-white shadow-lg hover:shadow-2xl',
      tiktok: 'bg-black text-white shadow-lg hover:shadow-2xl',
      pinterest: 'bg-[#E60023] text-white shadow-lg hover:shadow-2xl',
      snapchat: 'bg-[#FFFC00] text-black shadow-lg hover:shadow-2xl',
      whatsapp: 'bg-[#25D366] text-white shadow-lg hover:shadow-2xl',
      telegram: 'bg-[#0088cc] text-white shadow-lg hover:shadow-2xl',
      discord: 'bg-[#5865F2] text-white shadow-lg hover:shadow-2xl',
      github: 'bg-[#181717] text-white shadow-lg hover:shadow-2xl',
      dribbble: 'bg-[#EA4C89] text-white shadow-lg hover:shadow-2xl',
      behance: 'bg-[#1769FF] text-white shadow-lg hover:shadow-2xl',
      medium: 'bg-black text-white shadow-lg hover:shadow-2xl',
      spotify: 'bg-[#1DB954] text-white shadow-lg hover:shadow-2xl',
      reddit: 'bg-[#FF4500] text-white shadow-lg hover:shadow-2xl',
      twitch: 'bg-[#9146FF] text-white shadow-lg hover:shadow-2xl',
      google: 'bg-white text-[#4285F4] border-2 border-[#4285F4] shadow-lg hover:shadow-2xl',
      website: 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-2xl',
      portfolio: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-2xl',
      email: 'bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg hover:shadow-2xl',
      phone: 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-2xl',
    };
    
    // Check for matches
    for (const key in classes) {
      if (titleLower.includes(key)) {
        return classes[key];
      }
    }
    
    // Default professional gradient
    return 'bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-lg hover:shadow-2xl';
  }

  getContactIcon(platform: string): string {
    const icons: Record<string, string> = {
      email: '✉️',
      phone: '📞',
      whatsapp: '💬',
      map: '📍',
      twitter: '🐦',
      instagram: '📷',
      facebook: '👥',
      linkedin: '💼',
      github: '⚙️',
      youtube: '🎥',
    };
    return icons[platform.toLowerCase()] || '🔗';
  }

  getContactUrl(contact: any): string {
    const platform = contact.platform.toLowerCase();
    const value = contact.value;

    const urlMap: Record<string, string> = {
      email: `mailto:${value}`,
      phone: `tel:${value}`,
      whatsapp: `https://wa.me/${value}`,
      map: value, // Google Maps URL should be provided as-is
      twitter: `https://twitter.com/${value}`,
      instagram: `https://instagram.com/${value}`,
      facebook: `https://facebook.com/${value}`,
      linkedin: `https://linkedin.com/in/${value}`,
      github: `https://github.com/${value}`,
      youtube: `https://youtube.com/@${value}`,
    };

    return urlMap[platform] || value;
  }

  trackLinkClick(linkId: string): void {
    // Track click analytics (optional - can be implemented later)
    console.log('Link clicked:', linkId);
    // TODO: Send analytics to backend
    // this.http.post(`/api/analytics/click`, { linkId }).subscribe();
  }

  trackContactClick(contact: any): void {
    if (contact.platform && (contact.platform.toLowerCase() === 'map' || contact.platform.toLowerCase() === 'location')) {
      // Always go directly to the map location
      window.open(this.getContactUrl(contact), '_blank');
    } else {
      // Track contact click analytics
      console.log('Contact clicked:', contact.id);
      // TODO: Send analytics to backend
    }
  }


  // Lighten a color by a percentage (0-100)
  lightenColor(color: string, percent: number): string {
    if (!color) return '#f5f7fa';
    
    // Remove # if present
    color = color.replace('#', '');
    
    // Convert to RGB
    const num = parseInt(color, 16);
    const r = (num >> 16);
    const g = (num >> 8) & 0x00FF;
    const b = num & 0x0000FF;
    
    // Lighten by blending with white
    const amount = percent / 100;
    const newR = Math.round(r + (255 - r) * amount);
    const newG = Math.round(g + (255 - g) * amount);
    const newB = Math.round(b + (255 - b) * amount);
    
    // Convert back to hex
    return '#' + ((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1);
  }
}
