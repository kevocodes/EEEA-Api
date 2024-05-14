import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuardGuard } from 'src/common/guards/roles-guard.guard';
import { EventsService } from './events.service';
import { ApiResponse } from 'src/common/types/response.type';
import {
  CreateEventDto,
  UpdateEventDto,
  UpdateEventStatusDto,
  findAllEventsDto,
} from './dtos/events.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role } from '@prisma/client';
import { User } from 'src/common/decorators/current-user.decorator';
import { TokenPayload } from 'src/auth/types/token.type';
import { Public } from 'src/common/decorators/public.decorator';
import { MongoIdPipe } from 'src/common/pipes/mongo-id.pipe';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { getParseImagePipe } from 'src/common/utils/get-parse-file-pipe';

@ApiTags('events')
@UseGuards(JwtAuthGuard, RolesGuardGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventService: EventsService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['thumbnail', 'title', 'datetime', 'location'],
      properties: {
        thumbnail: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        datetime: { type: 'datetime', default: new Date() },
        location: { type: 'string' },
      },
    },
  })
  @Post()
  async create(
    @User() user: TokenPayload,
    @Body() body: CreateEventDto,
    @UploadedFile(getParseImagePipe())
    file: Express.Multer.File,
  ): Promise<ApiResponse> {
    return this.eventService.create(body, file, user);
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
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        thumbnail: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        datetime: { type: 'datetime', default: new Date() },
        location: { type: 'string' },
      },
    },
  })
  @Put(':id')
  async update(
    @User() user: TokenPayload,
    @UploadedFile(getParseImagePipe({ required: false }))
    file: Express.Multer.File,
    @Param('id', MongoIdPipe) id: string,
    @Body() body: UpdateEventDto,
  ): Promise<ApiResponse> {
    return this.eventService.update(user, id, body, file);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', MongoIdPipe) id: string,
    @Body() body: UpdateEventStatusDto,
  ): Promise<ApiResponse> {
    return this.eventService.updateStatus(id, body);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Delete(':id')
  async delete(@Param('id', MongoIdPipe) id: string): Promise<ApiResponse> {
    return this.eventService.delete(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Patch(':id/images')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['images'],
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async addImages(
    @Param('id', MongoIdPipe) id: string,
    @UploadedFiles(getParseImagePipe())
    files: Array<Express.Multer.File>,
  ): Promise<ApiResponse> {
    return this.eventService.addImages(id, files);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Delete('/images/:imageId')
  async deleteImage(
    @Param('imageId', MongoIdPipe) imageId: string,
  ): Promise<ApiResponse> {
    return this.eventService.deleteImage(imageId);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Delete(':id/images/all')
  async deleteAllImages(
    @Param('id', MongoIdPipe) id: string,
  ): Promise<ApiResponse> {
    return this.eventService.deleteAllImages(id);
  }
}
