import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: 'my-secret-key', // TODO: 환경변수로 이동
      signOptions: { expiresIn: '1h' }, // 토큰 만료시간
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard, JwtModule, UserModule], // 다른 모듈에서 사용 가능
})
export class AuthModule {}
