// Tipos para o módulo de administrador

export interface RSVP {
  id: string;
  name: string;
  whatsapp: string;
  cpf: string;
  attendance: 'sim' | 'nao';
  guests: number;
  message?: string;
  submittedAt: string;
  createdAt: string;
}

export interface AdminGift {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  link?: string;
  isReserved: boolean;
  isAvailable: boolean;
  reservedBy?: string;
  reservedAt?: string;
  order: number;
}

export interface AdminUser {
  username: string;
  password: string;
}
