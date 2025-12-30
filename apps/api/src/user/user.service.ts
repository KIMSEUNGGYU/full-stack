import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UserService {
  // Mock 데이터 (나중에 DB로 교체)
  private users: User[] = [];
  private idCounter = 1;

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
