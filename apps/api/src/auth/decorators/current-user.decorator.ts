import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'user/user.entity';

// Controller에서 현재 로그인한 사용자 정보 가져오기
// 사용법: @CurrentUser() user: User
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
