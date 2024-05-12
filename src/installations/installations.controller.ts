import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
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
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { getParseImagePipe } from 'src/common/utils/get-parse-file-pipe';

@ApiTags('installations')
@Controller('installations')
@UseGuards(JwtAuthGuard, RolesGuardGuard)
export class InstallationsController {
  constructor(private readonly installationsService: InstallationsService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image', 'name'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
        name: { type: 'string' },
      },
    },
  })
  @Post()
  async create(
    @UploadedFile(getParseImagePipe())
    image: Express.Multer.File,
    @Body() body: CreateInstallationDto,
  ): Promise<ApiResponse> {
    return this.installationsService.create(image, body);
  }

  @Public()
  @Get()
  async findAll(): Promise<ApiResponse> {
    return this.installationsService.findAll();
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Delete('all')
  async deleteAll(): Promise<ApiResponse> {
    return this.installationsService.deleteAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', MongoIdPipe) id: string): Promise<ApiResponse> {
    return this.installationsService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
        name: { type: 'string' },
      },
    },
  })
  @Put(':id')
  async update(
    @UploadedFile(getParseImagePipe({ required: false }))
    image: Express.Multer.File,
    @Param('id', MongoIdPipe) id: string,
    @Body() body: UpdateInstallationDto,
  ): Promise<ApiResponse> {
    return this.installationsService.update(id, body, image);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CONTENT_MANAGER)
  @Delete(':id')
  async delete(@Param('id', MongoIdPipe) id: string): Promise<ApiResponse> {
    return this.installationsService.delete(id);
  }
}
