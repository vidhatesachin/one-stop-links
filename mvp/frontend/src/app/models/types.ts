export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  planTier: 'FREE' | 'PRO' | 'AGENCY';
  createdAt: string;
}

export interface Business {
  id: string;
  userId: string;
  name: string;
  slug: string;
  logo: string | null;
  bio: string | null;
  theme: string;
  primaryColor: string;
  bgColor: string;
  textColor: string;
  customDomain: string | null;
  isActive: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  links?: Link[];
  contacts?: Contact[];
}

export interface Link {
  id: string;
  businessId: string;
  title: string;
  url: string;
  icon: string | null;
  platform: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  businessId: string;
  platform: string; // email, phone, whatsapp, twitter, instagram, etc.
  value: string;
  label: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  id: string;
  businessId: string;
  date: string;
  views: number;
  uniqueViews: number;
  clicks: number;
}
