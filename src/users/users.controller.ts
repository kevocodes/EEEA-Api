import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiResponse } from 'src/common/types/response.type';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async create(@Body() body: CreateUserDto): Promise<ApiResponse> {
    return this.userService.create(body);
  }

  @Get()
  async findAll(): Promise<ApiResponse> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOneById(
    @Param('id', MongoIdPipe) id: string,
  ): Promise<ApiResponse> {
    return this.userService.findOneById(id);
  }

  @Put(':id')
  async update(
    @Param('id', MongoIdPipe) id: string,
    @Body() body: UpdateUserDto,
  ): Promise<ApiResponse> {
    return this.userService.updateOneById(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', MongoIdPipe) id: string): Promise<ApiResponse> {
    return this.userService.deleteOneById(id);
  }
}
