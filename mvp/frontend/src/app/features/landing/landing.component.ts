import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent {
  features = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Create your landing page in under 5 minutes',
    },
    {
      icon: '🎨',
      title: '5 Beautiful Themes',
      description: 'Professional designs that match your brand',
    },
    {
      icon: '📊',
      title: 'Advanced Analytics',
      description: 'Track clicks, views, and engagement',
    },
    {
      icon: '📱',
      title: 'Mobile Optimized',
      description: 'Perfect on any device, any screen size',
    },
  ];

  plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      features: [
        '1 Business Profile',
        '10 Links',
        'Basic Analytics',
        '1 Theme',
        'onelinks.bio/yourname',
      ],
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      popular: true,
      features: [
        '5 Business Profiles',
        'Unlimited Links',
        'Advanced Analytics',
        'All 5 Themes',
        'Custom Domain',
        'Remove Branding',
      ],
    },
    {
      name: 'Agency',
      price: '$29',
      period: '/month',
      features: [
        'Unlimited Profiles',
        'Unlimited Links',
        'White Label',
        'Priority Support',
        'Custom Themes',
        'Team Collaboration',
      ],
    },
  ];
}
