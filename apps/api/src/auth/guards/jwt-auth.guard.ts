import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from 'user/user.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('토큰이 필요합니다.');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const payload = this.jwtService.verify(token);

      // accessToken인지 확인
      if (payload.type !== 'access') {
        throw new UnauthorizedException('accessToken이 아닙니다.');
      }

      // 사용자 존재 확인
      const user = this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      // request에 user 정보 저장 (Controller에서 사용)
      (request as any).user = user;

      return true;
    } catch {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }
}
