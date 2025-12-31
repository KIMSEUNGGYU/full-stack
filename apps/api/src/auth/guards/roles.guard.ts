import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'auth/decorators/roles.decorator';
import { UserRole } from 'user/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // @Roles() 데코레이터에서 설정한 역할 가져오기
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // @Roles() 데코레이터가 없으면 통과
    if (!requiredRoles) {
      return true;
    }

    // request에서 user 가져오기 (JwtAuthGuard에서 설정됨)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('사용자 정보가 없습니다.');
    }

    // 사용자 role이 required roles에 포함되는지 확인
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
