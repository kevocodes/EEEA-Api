import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import {
  CreateInstallationDto,
  UpdateInstallationDto,
} from './dtos/installations.dto';
import { ApiResponse } from 'src/common/types/response.type';

@Injectable()
export class InstallationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateInstallationDto): Promise<ApiResponse> {
    const installation = await this.prismaService.installation.create({
      data,
    });

    return {
      statusCode: 201,
      data: installation,
      message: 'Installation created successfully',
    };
  }

  async findAll(): Promise<ApiResponse> {
    const installations = await this.prismaService.installation.findMany();

    return {
      statusCode: 200,
      message: 'Installations retrieved successfully',
      data: installations,
    };
  }

  async findOne(id: string): Promise<ApiResponse> {
    const installation = await this.prismaService.installation.findUnique({
      where: {
        id,
      },
    });

    if (!installation) throw new NotFoundException('Installation not found');

    return {
      statusCode: 200,
      message: 'Installation retrieved successfully',
      data: installation,
    };
  }

  async update(id: string, data: UpdateInstallationDto): Promise<ApiResponse> {
    // Check if the installation exists
    await this.findOne(id);

    const installation = await this.prismaService.installation.update({
      where: {
        id,
      },
      data,
    });

    return {
      statusCode: 200,
      message: 'Installation updated successfully',
      data: installation,
    };
  }

  async delete(id: string): Promise<ApiResponse> {
    // Check if the installation exists
    await this.findOne(id);

    await this.prismaService.installation.delete({
      where: {
        id,
      },
    });

    return {
      statusCode: 200,
      message: 'Installation deleted successfully',
      data: null,
    };
  }
}
