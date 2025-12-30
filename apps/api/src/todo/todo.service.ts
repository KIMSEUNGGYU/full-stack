import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateTodoDto } from './dtos/create-todo.dto';
import type { UpdateTodoDto } from './dtos/update-todo.dto';
import type { Todo } from './todo.entity';

@Injectable()
export class TodoService {
  // Mock 데이터 (나중에 DB로 교체)
  private todos: Todo[] = [
    {
      id: 1,
      title: '첫 번째 할일',
      description: 'NestJS 배우기',
      completed: false,
      createdAt: new Date(),
    },
  ];

  private idCounter = 2;

  // 전체 조회
  findAll(): Todo[] {
    return this.todos;
  }

  // 단일 조회
  findOne(id: number): Todo {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) {
      throw new NotFoundException(`Todo #${id}를 찾을 수 없습니다.`);
    }
    return todo;
  }

  // 생성
  create(dto: CreateTodoDto): Todo {
    const todo: Todo = {
      id: this.idCounter++,
      title: dto.title,
      description: dto.description,
      completed: false,
      createdAt: new Date(),
    };
    this.todos.push(todo);
    return todo;
  }

  // 수정
  update(id: number, dto: UpdateTodoDto): Todo {
    const todo = this.findOne(id);

    if (dto.title !== undefined) todo.title = dto.title;
    if (dto.description !== undefined) todo.description = dto.description;
    if (dto.completed !== undefined) todo.completed = dto.completed;

    return todo;
  }

  // 삭제
  remove(id: number): { deleted: boolean } {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Todo #${id}를 찾을 수 없습니다.`);
    }
    this.todos.splice(index, 1);
    return { deleted: true };
  }
}
