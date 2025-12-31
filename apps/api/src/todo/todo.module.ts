import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

@Module({
  imports: [AuthModule], // Guard 사용을 위해 import
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
