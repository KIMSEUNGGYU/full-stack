import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateTodoDto } from './dtos/create-todo.dto';
import { UpdateTodoDto } from './dtos/update-todo.dto';
import { TodoService } from './todo.service';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  // GET /todos - 누구나
  @Get()
  findAll() {
    return this.todoService.findAll();
  }

  // GET /todos/:id - 누구나
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todoService.findOne(Number(id));
  }

  // POST /todos - 로그인 필요
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateTodoDto) {
    return this.todoService.create(dto);
  }

  // PATCH /todos/:id - 로그인 필요
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTodoDto) {
    return this.todoService.update(Number(id), dto);
  }

  // DELETE /todos/:id - admin만
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.todoService.remove(Number(id));
  }
}
