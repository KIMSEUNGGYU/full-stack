import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  // 회원가입
  signup(dto: SignupDto) {
    // 이메일 중복 체크
    const existing = this.userService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('이미 존재하는 이메일입니다.');
    }

    // 사용자 생성
    const user = this.userService.create({
      email: dto.email,
      password: dto.password, // TODO: 나중에 해시 처리
      name: dto.name,
    });

    // 비밀번호 제외하고 반환
    const { password, ...result } = user;
    return result;
  }

  // 로그인
  login(dto: LoginDto) {
    const user = this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 확인 (TODO: 나중에 해시 비교)
    if (user.password !== dto.password) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    // 비밀번호 제외하고 반환 (TODO: 나중에 JWT 토큰 반환)
    const { password, ...result } = user;
    return {
      user: result,
      message: '로그인 성공',
    };
  }
}
