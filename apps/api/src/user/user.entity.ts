export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}
