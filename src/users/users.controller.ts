import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiResponse } from 'src/common/types/response.type';
import { CreateUserDto, UpdateUserDto } from './dtos/users.dto';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from '@prisma/client';
import { RolesGuardGuard } from 'src/common/guards/roles-guard.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuardGuard)
@Roles(Role.ADMIN)
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
