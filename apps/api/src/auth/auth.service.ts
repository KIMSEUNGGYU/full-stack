import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dtos/login.dto';
import { SignupDto } from './dtos/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // 토큰 생성 (accessToken + refreshToken)
  private generateTokens(userId: number, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email, type: 'access' },
      { expiresIn: '1h' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, email, type: 'refresh' },
      { expiresIn: '7d' },
    );

    return { accessToken, refreshToken };
  }

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

    // JWT 토큰 생성
    const tokens = this.generateTokens(user.id, user.email);

    // 비밀번호 제외하고 반환
    const { password, ...result } = user;
    return {
      user: result,
      ...tokens,
    };
  }

  // 토큰 갱신 (accessToken만)
  refresh(refreshToken: string) {
    // refreshToken 검증
    let payload: { sub: number; email: string; type: string };
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    // refreshToken 타입 체크 (accessToken으로 refresh 방지)
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('refreshToken이 아닙니다.');
    }

    // 사용자 존재 확인
    const user = this.userService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    // accessToken만 새로 발급
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'access' },
      { expiresIn: '1h' },
    );

    return { accessToken };
  }
}
