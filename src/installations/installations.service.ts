import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import {
  CreateInstallationDto,
  UpdateInstallationDto,
} from './dtos/installations.dto';
import { ApiResponse } from 'src/common/types/response.type';
import { CloudinaryService } from 'src/config/cloudinary/cloudinary.service';
import { Installation } from '@prisma/client';

@Injectable()
export class InstallationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
    file: Express.Multer.File,
    data: CreateInstallationDto,
  ): Promise<ApiResponse> {
    const upload = await this.cloudinaryService.uploadFile(file);

    const installation = await this.prismaService.installation.create({
      data: {
        name: data.name,
        public_id: upload.public_id,
        url: upload.secure_url,
      },
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

  async update(
    id: string,
    data: UpdateInstallationDto,
    file: Express.Multer.File,
  ): Promise<ApiResponse> {
    // Check if the installation exists
    const result = await this.findOne(id);
    const prevInstallation: Installation = result.data;

    let updatedInstallation: Installation;

    if (file) {
      // Upload the new installation image and delete the previous one
      const [upload] = await Promise.all([
        this.cloudinaryService.uploadFile(file),
        this.cloudinaryService.deleteFiles([prevInstallation.public_id]),
      ]);

      // Update the installation with the new image details
      updatedInstallation = await this.prismaService.installation.update({
        where: {
          id,
        },
        data: {
          name: data.name,
          public_id: upload.public_id,
          url: upload.secure_url,
        },
      });
    }

    // If file is not provided, update the installation without changing the image
    updatedInstallation = await this.prismaService.installation.update({
      where: {
        id,
      },
      data,
    });

    return {
      statusCode: 200,
      message: 'Installation updated successfully',
      data: updatedInstallation,
    };
  }

  async delete(id: string): Promise<ApiResponse> {
    // Check if the installation exists
    const installation = await this.findOne(id);
    const data = installation.data as Installation;

    // Delete the installation and its image in parallel
    await Promise.all([
      this.cloudinaryService.deleteFiles([data.public_id]),
      this.prismaService.installation.delete({
        where: {
          id,
        },
      }),
    ]);

    return {
      statusCode: 200,
      message: 'Installation deleted successfully',
      data: null,
    };
  }
}
