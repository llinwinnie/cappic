export interface Moment {
  id: string;
  timestamp: number;
  imageUrl?: string;
  note?: string;
  tags?: string[];
  mood?: string;
  userId: string; // Add user ID for database
  createdAt?: number; // Add creation timestamp
}

export interface Settings {
  promptFrequency: 'daily' | 'weekly' | 'manual';
  enableNotifications: boolean;
  autoCapture: boolean;
  theme: 'light' | 'dark' | 'auto';
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
} 