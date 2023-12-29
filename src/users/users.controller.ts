import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiResponse } from 'src/common/models/response.model';
import { CreateUserDto } from './dto/users.dto';
import { MongoIdPipe } from 'src/common/pipes/mongo-id/mongo-id.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async create(@Body() body: CreateUserDto): Promise<ApiResponse> {
    return this.userService.create(body);
  }

  @Get(':id')
  async findOneById(
    @Param('id', MongoIdPipe) id: string,
  ): Promise<ApiResponse> {
    return this.userService.findOneById(id);
  }
}
