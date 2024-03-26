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
import { EventsService } from './events.service';
import { ApiResponse } from 'src/common/types/response.type';
import {
  CreateEventDto,
  UpdateEventDto,
  findAllEventsDto,
} from './dtos/events.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from '@prisma/client';
import { User } from 'src/common/decorators/current-user.decorator';
import { TokenPayload } from 'src/auth/types/token.type';
import { Public } from 'src/common/decorators/public.decorator';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';

@ApiTags('events')
@UseGuards(JwtAuthGuard, RolesGuardGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventService: EventsService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Post()
  async create(
    @User() user: TokenPayload,
    @Body() body: CreateEventDto,
  ): Promise<ApiResponse> {
    return this.eventService.create(body, user.sub);
  }

  @Public()
  @Get()
  async findAll(@Query() query: findAllEventsDto): Promise<ApiResponse> {
    return this.eventService.findAll(query);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', MongoIdPipe) id: string): Promise<ApiResponse> {
    return this.eventService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Put(':id')
  async update(
    @Param('id', MongoIdPipe) id: string,
    @Body() body: UpdateEventDto,
  ): Promise<ApiResponse> {
    return this.eventService.update(id, body);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Delete(':id')
  async delete(@Param('id', MongoIdPipe) id: string): Promise<ApiResponse> {
    return this.eventService.delete(id);
  }
}
