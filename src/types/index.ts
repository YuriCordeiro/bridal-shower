export interface Gift {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  category: string;
  isReserved: boolean;
  reservedBy?: string;
  reservedAt?: Date;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  willAttend: boolean | null;
  numberOfGuests: number;
  dietaryRestrictions?: string;
  message?: string;
  rsvpAt?: Date;
}

export interface GiftCategory {
  id: string;
  name: string;
  icon: string;
}
