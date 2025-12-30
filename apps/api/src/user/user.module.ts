import { Module } from '@nestjs/common';
import { UserService } from './user.service';

@Module({
  providers: [UserService],
  exports: [UserService], // Auth 모듈에서 사용하기 위해 export
})
export class UserModule {}
