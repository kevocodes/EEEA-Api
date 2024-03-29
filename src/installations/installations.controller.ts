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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuardGuard } from 'src/common/guards/roles-guard.guard';
import { InstallationsService } from './installations.service';
import { ApiResponse } from 'src/common/types/response.type';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from '@prisma/client';
import {
  CreateInstallationDto,
  UpdateInstallationDto,
} from './dtos/installations.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';

@ApiTags('installations')
@Controller('installations')
@UseGuards(JwtAuthGuard, RolesGuardGuard)
export class InstallationsController {
  constructor(private readonly installationsService: InstallationsService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Post()
  async create(@Body() body: CreateInstallationDto): Promise<ApiResponse> {
    return this.installationsService.create(body);
  }

  @Public()
  @Get()
  async findAll(): Promise<ApiResponse> {
    return this.installationsService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', MongoIdPipe) id: string): Promise<ApiResponse> {
    return this.installationsService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Put(':id')
  async update(
    @Param('id', MongoIdPipe) id: string,
    @Body() body: UpdateInstallationDto,
  ): Promise<ApiResponse> {
    return this.installationsService.update(id, body);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Delete(':id')
  async delete(@Param('id', MongoIdPipe) id: string): Promise<ApiResponse> {
    return this.installationsService.delete(id);
  }
}
