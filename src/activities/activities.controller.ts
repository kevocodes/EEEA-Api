import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuardGuard } from 'src/common/guards/roles-guard.guard';
import { ActivitiesService } from './activities.service';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/role.decorator';
import { User } from 'src/common/decorators/current-user.decorator';
import { TokenPayload } from 'src/auth/types/token.type';
import {
  CreateActivityDto,
  UpdateActivityDto,
  FindAllActivitiesByMonthDto,
  FindAllActivitiesDto,
} from './dtos/acitivities.dto';
import { ApiResponse } from 'src/common/types/response.type';
import { Public } from 'src/common/decorators/public.decorator';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';

@ApiTags('activities')
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuardGuard)
export class ActivitiesController {
  constructor(private readonly activityService: ActivitiesService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Post()
  async create(
    @User() user: TokenPayload,
    @Body() body: CreateActivityDto,
  ): Promise<ApiResponse> {
    return this.activityService.create(body, user);
  }

  @Public()
  @Get()
  async findAll(@Query() query: FindAllActivitiesDto): Promise<ApiResponse> {
    return this.activityService.findAll(query);
  }

  @Public()
  @Get('month/:month')
  async findAllByMonth(
    @Param() params: FindAllActivitiesByMonthDto,
  ): Promise<ApiResponse> {
    return this.activityService.findAllByMonth(params.month);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', MongoIdPipe) id: string): Promise<ApiResponse> {
    return this.activityService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Put(':id')
  async update(
    @User() user: TokenPayload,
    @Param('id', MongoIdPipe) id: string,
    @Body() body: UpdateActivityDto,
  ): Promise<ApiResponse> {
    return this.activityService.update(user, id, body);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Delete(':id')
  async delete(@Param('id', MongoIdPipe) id: string): Promise<ApiResponse> {
    return this.activityService.delete(id);
  }
}
