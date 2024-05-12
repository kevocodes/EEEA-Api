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
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from '@prisma/client';
import { RolesGuardGuard } from 'src/common/guards/roles-guard.guard';
import { User } from 'src/common/decorators/current-user.decorator';
import { TokenPayload } from 'src/auth/types/token.type';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuardGuard)
@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        lastname: { type: 'string' },
        password: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'enum', enum: ['ADMIN', 'CONTENT_MANAGER'] },
      },
    },
  })
  async create(@Body() body: CreateUserDto): Promise<ApiResponse> {
    return this.userService.create(body);
  }

  @Get()
  async findAll(@User() user: TokenPayload): Promise<ApiResponse> {
    return this.userService.findAll(user);
  }

  @Get(':id')
  async findOneById(
    @Param('id', MongoIdPipe) id: string,
  ): Promise<ApiResponse> {
    return this.userService.findOneById(id);
  }

  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        lastname: { type: 'string' },
        password: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'enum', enum: ['CONTENT_MANAGER', 'ADMIN'] },
      },
    },
  })
  @Put(':id')
  async update(
    @User() user: TokenPayload,
    @Body() body: UpdateUserDto,
    @Param('id', MongoIdPipe) id: string,
  ): Promise<ApiResponse> {
    return this.userService.updateOneById(id, body, user);
  }

  @Delete(':id')
  async delete(@Param('id', MongoIdPipe) id: string): Promise<ApiResponse> {
    return this.userService.deleteOneById(id);
  }
}
