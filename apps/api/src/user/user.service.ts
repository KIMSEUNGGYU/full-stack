import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UserService {
  // Mock 데이터 (나중에 DB로 교체)
  private users: User[] = [
    {
      id: 1,
      email: 'admin@test.com',
      password: 'admin123',
      name: '관리자',
      role: 'admin',
      createdAt: new Date(),
    },
    {
      id: 2,
      email: 'test@test.com',
      password: 'test123',
      name: '유저1',
      role: 'admin',
      createdAt: new Date(),
    },
  ];
  private idCounter = 3;

  // 이메일로 사용자 찾기
  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  // ID로 사용자 찾기
  findById(id: number): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  // 사용자 생성
  create(data: { email: string; password: string; name: string }): User {
    const user: User = {
      id: this.idCounter++,
      email: data.email,
      password: data.password,
      name: data.name,
      role: 'user', // 기본값: 일반 사용자
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // 전체 사용자 조회 (비밀번호 제외)
  findAll(): Omit<User, 'password'>[] {
    return this.users.map(({ password, ...user }) => user);
  }
}
