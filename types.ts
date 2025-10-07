export enum Role {
  VISITANTE = 'VISITANTE',
  MEMBRO = 'MEMBRO',
  ADM = 'ADM',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  memberSince?: string;
  allergies?: string;
}

export enum EventType {
  GIRA = 'Gira',
  ATENDIMENTO = 'Atendimento',
  ESTUDO = 'Estudo',
  MUTIRAO = 'Mutirão',
}

export interface Event {
  id: number;
  title: string;
  type: EventType;
  date: Date;
  capacity: number;
  attendees: number;
}

export interface PrayerRequest {
  id: number;
  initials: string;
  request: string;
  timestamp: Date;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
}

export interface DiaryEntry {
  id: number;
  userId: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  dueDate?: Date;
  attachment?: {
    name: string;
    size: number; // in bytes
  };
}

export enum ImageCategory {
    TERREIRO = 'Terreiro',
    EVENTOS = 'Eventos',
    SIMBOLOS = 'Símbolos',
}

export interface GalleryImage {
    id: number;
    src: string;
    alt: string;
    caption: string;
    category: ImageCategory;
}

export interface SpiritualEntity {
    id: number;
    name: string;
    description: string;
    line: string; // e.g., 'Exu', 'Malandragem', 'Caboclos'
    descriptionHistory?: {
        timestamp: Date;
        description: string;
    }[];
}

export interface LoreEntry {
    id: number;
    title: string;
    content: string;
    relatedEntities: number[]; // IDs of SpiritualEntity
}

export interface Recado {
    id: number;
    userId: number;
    from: string;
    message: string;
    date: Date;
    read: boolean;
}

export interface MemberEntity {
    id: number;
    userId: number;
    name: string;
    line: string;
    history: string;
    curiosities: string;
}