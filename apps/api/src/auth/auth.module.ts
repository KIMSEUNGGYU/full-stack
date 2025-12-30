import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule], // UserService 사용을 위해 import
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
